import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const graphVersion =
  process.env.META_GRAPH_VERSION || "v20.0"

const graphBaseUrl =
  `https://graph.facebook.com/${graphVersion}`

function cleanText(value: unknown) {
  if (typeof value !== "string") return ""
  return value.trim()
}

async function validateWhatsAppToken({
  accessToken,
  phoneNumberId,
}: {
  accessToken: string
  phoneNumberId: string
}) {
  const url = new URL(`${graphBaseUrl}/${phoneNumberId}`)

  url.searchParams.set(
    "fields",
    "id,display_phone_number,verified_name"
  )

  url.searchParams.set("access_token", accessToken)

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    console.error("WHATSAPP TOKEN VALIDATION ERROR:", data)

    const message =
      data?.error?.message ||
      "The WhatsApp access token could not be verified."

    throw new Error(message)
  }

  return data
}

async function subscribeAppToWaba({
  accessToken,
  businessAccountId,
}: {
  accessToken: string
  businessAccountId: string
}) {
  const url = new URL(
    `${graphBaseUrl}/${businessAccountId}/subscribed_apps`
  )

  url.searchParams.set("access_token", accessToken)

  const response = await fetch(url.toString(), {
    method: "POST",
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    console.error("WHATSAPP SUBSCRIBE APP ERROR:", data)

    return {
      ok: false,
      error:
        data?.error?.message ||
        "Could not subscribe app to WhatsApp webhook events.",
    }
  }

  return {
    ok: true,
    error: null,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const displayPhoneNumber = cleanText(
      body.displayPhoneNumber ||
        body.display_phone_number ||
        body.phoneNumber ||
        body.phone_number
    )

    const phoneNumberId = cleanText(
      body.phoneNumberId || body.phone_number_id
    )

    const businessAccountId = cleanText(
      body.businessAccountId ||
        body.business_account_id ||
        body.wabaId ||
        body.waba_id
    )

    const accessToken = cleanText(
      body.accessToken || body.access_token
    )

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: "Phone number ID is required." },
        { status: 400 }
      )
    }

    if (!businessAccountId) {
      return NextResponse.json(
        {
          error:
            "WhatsApp Business Account ID is required.",
        },
        { status: 400 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required." },
        { status: 400 }
      )
    }

    const business = await getCurrentBusiness()

    if (!business) {
      return NextResponse.json(
        {
          error:
            "No business found for this account.",
        },
        { status: 401 }
      )
    }

    const phoneDetails = await validateWhatsAppToken({
      accessToken,
      phoneNumberId,
    })

    const subscribeResult = await subscribeAppToWaba({
      accessToken,
      businessAccountId,
    })

    const now = new Date().toISOString()

    const finalDisplayPhoneNumber =
      displayPhoneNumber ||
      phoneDetails?.display_phone_number ||
      null

    const { error: integrationError } = await supabase
      .from("business_integrations")
      .upsert(
        {
          business_id: business.id,
          provider: "whatsapp",
          connected: true,
          phone_number_id: phoneNumberId,
          business_account_id: businessAccountId,
          display_phone_number: finalDisplayPhoneNumber,
          connection_method: "manual",
          last_connected_at: now,
          disconnected_at: null,
          updated_at: now,
        },
        {
          onConflict: "business_id,provider",
        }
      )

    if (integrationError) {
      console.error(
        "MANUAL WHATSAPP INTEGRATION SAVE ERROR:",
        integrationError
      )

      return NextResponse.json(
        {
          error:
            "Could not save WhatsApp integration.",
        },
        { status: 500 }
      )
    }

    const { error: secretError } = await supabase
      .from("business_integration_secrets")
      .upsert(
        {
          business_id: business.id,
          provider: "whatsapp",
          access_token: accessToken,
          token_type: "manual",
          expires_at: null,
          updated_at: now,
        },
        {
          onConflict: "business_id,provider",
        }
      )

    if (secretError) {
      console.error(
        "MANUAL WHATSAPP SECRET SAVE ERROR:",
        secretError
      )

      return NextResponse.json(
        {
          error:
            "WhatsApp details saved, but the access token could not be stored.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      connected: true,
      subscribedToWebhook: subscribeResult.ok,
      webhookWarning: subscribeResult.error,
      phoneNumberId,
      businessAccountId,
      displayPhoneNumber: finalDisplayPhoneNumber,
    })
  } catch (error) {
    console.error(
      "MANUAL WHATSAPP CONNECT ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not connect WhatsApp manually.",
      },
      { status: 500 }
    )
  }
}