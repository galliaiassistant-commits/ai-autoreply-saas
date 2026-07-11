import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const graphVersion =
  process.env.META_GRAPH_VERSION || "v20.0"

const graphBaseUrl =
  `https://graph.facebook.com/${graphVersion}`

async function exchangeCodeForToken(code: string) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId) {
    throw new Error("Missing NEXT_PUBLIC_META_APP_ID")
  }

  if (!appSecret) {
    throw new Error("Missing META_APP_SECRET")
  }

  const url = new URL(`${graphBaseUrl}/oauth/access_token`)

  url.searchParams.set("client_id", appId)
  url.searchParams.set("client_secret", appSecret)
  url.searchParams.set("code", code)

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    console.error("META TOKEN EXCHANGE ERROR:", data)
    throw new Error("Could not exchange Meta code for token")
  }

  return data.access_token as string
}

async function debugToken(accessToken: string) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) return null

  const appAccessToken = `${appId}|${appSecret}`

  const url = new URL(`${graphBaseUrl}/debug_token`)
  url.searchParams.set("input_token", accessToken)
  url.searchParams.set("access_token", appAccessToken)

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    console.error("META DEBUG TOKEN ERROR:", data)
    return null
  }

  return data?.data || null
}

function getTargetIdsFromDebugToken(debugData: any) {
  const scopes =
    debugData?.granular_scopes ||
    debugData?.granular_scopes_v2 ||
    []

  const targetIds: string[] = []

  for (const scope of scopes) {
    const ids = scope?.target_ids || []

    for (const id of ids) {
      if (id && !targetIds.includes(id)) {
        targetIds.push(id)
      }
    }
  }

  return targetIds
}

async function getWhatsAppPhoneNumbers({
  accessToken,
  wabaId,
}: {
  accessToken: string
  wabaId: string
}) {
  const url = new URL(
    `${graphBaseUrl}/${wabaId}/phone_numbers`
  )

  url.searchParams.set(
    "fields",
    "id,display_phone_number,verified_name,quality_rating"
  )
  url.searchParams.set("access_token", accessToken)

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    console.error("META PHONE NUMBERS ERROR:", data)
    return []
  }

  return data?.data || []
}

async function subscribeAppToWaba({
  accessToken,
  wabaId,
}: {
  accessToken: string
  wabaId: string
}) {
  const url = new URL(
    `${graphBaseUrl}/${wabaId}/subscribed_apps`
  )

  url.searchParams.set("access_token", accessToken)

  const response = await fetch(url.toString(), {
    method: "POST",
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    console.error("META SUBSCRIBE APP ERROR:", data)
    return false
  }

  return true
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing Meta authorization code." },
        { status: 400 }
      )
    }

    const business = await getCurrentBusiness()

    if (!business) {
      return NextResponse.json(
        { error: "No business found." },
        { status: 401 }
      )
    }

    const accessToken = await exchangeCodeForToken(code)
    const debugData = await debugToken(accessToken)
    const targetIds = getTargetIdsFromDebugToken(debugData)

    const selectedWabaId = targetIds[0] || null

    if (!selectedWabaId) {
      return NextResponse.json(
        {
          error:
            "Connected, but no WhatsApp Business Account was found. Check Meta configuration permissions.",
        },
        { status: 400 }
      )
    }

    const phoneNumbers = await getWhatsAppPhoneNumbers({
      accessToken,
      wabaId: selectedWabaId,
    })

    if (phoneNumbers.length === 0) {
      return NextResponse.json(
        {
          error:
            "Connected, but no WhatsApp phone number was found. Check the Meta configuration permissions.",
        },
        { status: 400 }
      )
    }

    const phoneNumber = phoneNumbers[0]

    await subscribeAppToWaba({
      accessToken,
      wabaId: selectedWabaId,
    })

    const now = new Date().toISOString()

    const { error: integrationError } = await supabase
      .from("business_integrations")
      .upsert(
        {
          business_id: business.id,
          provider: "whatsapp",
          connected: true,
          phone_number_id: phoneNumber.id,
          display_phone_number:
            phoneNumber.display_phone_number || null,
          business_account_id: selectedWabaId,
          connection_method: "embedded_signup",
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
        "META INTEGRATION SAVE ERROR:",
        integrationError
      )

      return NextResponse.json(
        { error: "Could not save WhatsApp integration." },
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
          token_type: "system_user",
          expires_at: null,
          updated_at: now,
        },
        {
          onConflict: "business_id,provider",
        }
      )

    if (secretError) {
      console.error(
        "META SECRET SAVE ERROR:",
        secretError
      )

      return NextResponse.json(
        { error: "Connected but could not save secure token." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      wabaId: selectedWabaId,
      phoneNumberId: phoneNumber.id,
      displayPhoneNumber:
        phoneNumber.display_phone_number || null,
    })
  } catch (error) {
    console.error("META WHATSAPP CONNECT ERROR:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not connect WhatsApp.",
      },
      { status: 500 }
    )
  }
}