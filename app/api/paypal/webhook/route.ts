import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL ||
  "https://api-m.paypal.com"

type PayPalWebhookEvent = {
  id?: string
  event_type?: string
  create_time?: string
  resource?: {
    id?: string
    billing_agreement_id?: string
    status?: string
    billing_info?: {
      next_billing_time?: string
    }
    [key: string]: unknown
  }
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET."
    )
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64")

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok || !data?.access_token) {
    console.error(
      "PAYPAL ACCESS TOKEN ERROR:",
      data
    )

    throw new Error(
      "Could not create PayPal access token."
    )
  }

  return data.access_token as string
}

async function verifyPayPalWebhook({
  req,
  event,
}: {
  req: Request
  event: PayPalWebhookEvent
}) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID

  if (!webhookId) {
    throw new Error("Missing PAYPAL_WEBHOOK_ID.")
  }

  const transmissionId = req.headers.get(
    "paypal-transmission-id"
  )
  const transmissionTime = req.headers.get(
    "paypal-transmission-time"
  )
  const certUrl = req.headers.get("paypal-cert-url")
  const authAlgo = req.headers.get("paypal-auth-algo")
  const transmissionSig = req.headers.get(
    "paypal-transmission-sig"
  )

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    console.error(
      "PAYPAL WEBHOOK HEADERS MISSING"
    )

    return false
  }

  const accessToken = await getPayPalAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: event,
      }),
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error(
      "PAYPAL WEBHOOK VERIFICATION ERROR:",
      data
    )

    return false
  }

  console.log(
    "PAYPAL VERIFICATION STATUS:",
    data?.verification_status
  )

  return data?.verification_status === "SUCCESS"
}

function getSubscriptionId(
  event: PayPalWebhookEvent
) {
  return (
    event.resource?.billing_agreement_id ||
    event.resource?.id ||
    null
  )
}

function addDays(
  date: Date,
  days: number
) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

async function markSubscriptionActive({
  subscriptionId,
  event,
}: {
  subscriptionId: string
  event: PayPalWebhookEvent
}) {
  const paidAt = new Date(
    event.create_time || Date.now()
  ).toISOString()

  const nextBillingTime =
    event.resource?.billing_info
      ?.next_billing_time || null

  const updateData: Record<string, unknown> = {
    subscription_status: "active",
    last_payment_at: paidAt,
    payment_due_at: null,
    billing_grace_ends_at: null,
    ai_suspended_at: null,
  }

  if (nextBillingTime) {
    updateData.subscription_current_period_end =
      nextBillingTime
  }

  const { error } = await supabase
    .from("businesses")
    .update(updateData)
    .eq(
      "paypal_subscription_id",
      subscriptionId
    )

  if (error) {
    console.error(
      "PAYPAL ACTIVE UPDATE ERROR:",
      error
    )

    throw error
  }
}

async function markPaymentDue({
  subscriptionId,
  event,
}: {
  subscriptionId: string
  event: PayPalWebhookEvent
}) {
  const paymentDueDate = new Date(
    event.create_time || Date.now()
  )

  const graceEndsAt = addDays(
    paymentDueDate,
    7
  )

  const { error } = await supabase
    .from("businesses")
    .update({
      subscription_status: "payment_due",
      payment_due_at:
        paymentDueDate.toISOString(),
      billing_grace_ends_at:
        graceEndsAt.toISOString(),
      ai_suspended_at: null,
    })
    .eq(
      "paypal_subscription_id",
      subscriptionId
    )

  if (error) {
    console.error(
      "PAYPAL PAYMENT DUE UPDATE ERROR:",
      error
    )

    throw error
  }
}

async function markSubscriptionStopped({
  subscriptionId,
  status,
}: {
  subscriptionId: string
  status: "cancelled" | "expired"
}) {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from("businesses")
    .update({
      subscription_status: status,
      ai_suspended_at: now,
    })
    .eq(
      "paypal_subscription_id",
      subscriptionId
    )

  if (error) {
    console.error(
      "PAYPAL STOPPED UPDATE ERROR:",
      error
    )

    throw error
  }
}

export async function POST(req: Request) {
  try {
    const event =
      (await req.json()) as PayPalWebhookEvent

    console.log(
      "PAYPAL WEBHOOK EVENT:",
      event.event_type
    )

    const verified =
      await verifyPayPalWebhook({
        req,
        event,
      })

    if (!verified) {
      return NextResponse.json(
        {
          error:
            "PayPal webhook verification failed.",
        },
        {
          status: 401,
        }
      )
    }

    const eventType = event.event_type
    const subscriptionId =
      getSubscriptionId(event)

    if (!eventType || !subscriptionId) {
      console.log(
        "PAYPAL EVENT HAS NO SUBSCRIPTION ID"
      )

      return NextResponse.json({
        ok: true,
        ignored: true,
      })
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED":
      case "PAYMENT.SALE.COMPLETED": {
        await markSubscriptionActive({
          subscriptionId,
          event,
        })

        break
      }

      case "PAYMENT.SALE.DENIED":
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        await markPaymentDue({
          subscriptionId,
          event,
        })

        break
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        await markSubscriptionStopped({
          subscriptionId,
          status: "cancelled",
        })

        break
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await markSubscriptionStopped({
          subscriptionId,
          status: "expired",
        })

        break
      }

      default: {
        console.log(
          "IGNORED PAYPAL EVENT:",
          eventType
        )
      }
    }

    return NextResponse.json({
      ok: true,
      eventType,
    })
  } catch (error) {
    console.error(
      "PAYPAL WEBHOOK ROUTE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Could not process PayPal webhook.",
      },
      {
        status: 500,
      }
    )
  }
}