import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const PAYPAL_BASE_URL =
  process.env.PAYPAL_BASE_URL ||
  "https://api-m.paypal.com"

type PayPalAmount = {
  total?: string
  currency?: string
  value?: string
  currency_code?: string
}

type PayPalWebhookEvent = {
  id?: string
  event_type?: string
  create_time?: string
  resource?: {
    id?: string
    billing_agreement_id?: string
    status?: string
    state?: string
    amount?: PayPalAmount
    billing_info?: {
      next_billing_time?: string
    }
    [key: string]: unknown
  }
}

type PaymentLedgerStatus =
  | "completed"
  | "failed"
  | "denied"
  | "refunded"
  | "reversed"

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
    console.error("PAYPAL ACCESS TOKEN ERROR:", data)

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
    console.error("PAYPAL WEBHOOK HEADERS MISSING")

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

function getSubscriptionId(event: PayPalWebhookEvent) {
  return (
    event.resource?.billing_agreement_id ||
    event.resource?.id ||
    null
  )
}

function getTransactionId(event: PayPalWebhookEvent) {
  if (!event.event_type?.startsWith("PAYMENT.SALE.")) {
    return null
  }

  return event.resource?.id || null
}

function getPaymentAmount(event: PayPalWebhookEvent) {
  const amount = event.resource?.amount
  const rawValue = amount?.total || amount?.value || null

  if (!rawValue) return null

  const numericValue = Number(rawValue)

  return Number.isFinite(numericValue)
    ? numericValue
    : null
}

function getPaymentCurrency(event: PayPalWebhookEvent) {
  return String(
    event.resource?.amount?.currency ||
      event.resource?.amount?.currency_code ||
      "USD"
  ).toUpperCase()
}

function getEventTime(event: PayPalWebhookEvent) {
  const date = new Date(event.create_time || Date.now())

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  return date.toISOString()
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

async function getBusinessForSubscription(
  subscriptionId: string
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle()

  if (error) {
    console.error(
      "PAYPAL BUSINESS LOOKUP ERROR:",
      error
    )

    throw error
  }

  return data || null
}

async function recordPaymentEvent({
  event,
  subscriptionId,
  status,
}: {
  event: PayPalWebhookEvent
  subscriptionId: string
  status: PaymentLedgerStatus
}) {
  if (!event.id || !event.event_type) {
    console.error(
      "PAYPAL PAYMENT EVENT MISSING EVENT ID OR TYPE"
    )

    throw new Error(
      "PayPal payment event is missing its event ID or type."
    )
  }

  const business = await getBusinessForSubscription(
    subscriptionId
  )

  if (!business) {
    console.error(
      "PAYPAL PAYMENT HAS NO MATCHING BUSINESS:",
      subscriptionId
    )

    throw new Error(
      "No business matches the PayPal subscription."
    )
  }

  const eventTime = getEventTime(event)
  const failed = status === "failed" || status === "denied"

  const { error } = await supabase
    .from("payments")
    .upsert(
      {
        business_id: business.id,
        paypal_subscription_id: subscriptionId,
        paypal_event_id: event.id,
        paypal_transaction_id: getTransactionId(event),
        provider: "paypal",
        event_type: event.event_type,
        amount: getPaymentAmount(event),
        currency: getPaymentCurrency(event),
        status,
        paid_at:
          status === "completed" ? eventTime : null,
        failed_at: failed ? eventTime : null,
        created_at: eventTime,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "paypal_event_id",
        ignoreDuplicates: true,
      }
    )

  if (error) {
    console.error(
      "PAYPAL PAYMENT LEDGER ERROR:",
      error
    )

    throw error
  }

  console.log(
    "PAYPAL PAYMENT EVENT RECORDED:",
    event.id,
    status
  )
}

async function markSubscriptionActive({
  subscriptionId,
  event,
}: {
  subscriptionId: string
  event: PayPalWebhookEvent
}) {
  const paidAt = getEventTime(event)

  const nextBillingTime =
    event.resource?.billing_info?.next_billing_time || null

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
    .eq("paypal_subscription_id", subscriptionId)

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
  const paymentDueDate = new Date(getEventTime(event))
  const graceEndsAt = addDays(paymentDueDate, 7)

  const { error } = await supabase
    .from("businesses")
    .update({
      subscription_status: "payment_due",
      payment_due_at: paymentDueDate.toISOString(),
      billing_grace_ends_at: graceEndsAt.toISOString(),
      ai_suspended_at: null,
    })
    .eq("paypal_subscription_id", subscriptionId)

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
    .eq("paypal_subscription_id", subscriptionId)

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

    const verified = await verifyPayPalWebhook({
      req,
      event,
    })

    if (!verified) {
      return NextResponse.json(
        {
          error: "PayPal webhook verification failed.",
        },
        {
          status: 401,
        }
      )
    }

    const eventType = event.event_type
    const subscriptionId = getSubscriptionId(event)

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
      case "BILLING.SUBSCRIPTION.UPDATED": {
        await markSubscriptionActive({
          subscriptionId,
          event,
        })
        break
      }

      case "PAYMENT.SALE.COMPLETED": {
        await recordPaymentEvent({
          event,
          subscriptionId,
          status: "completed",
        })
        await markSubscriptionActive({
          subscriptionId,
          event,
        })
        break
      }

      case "PAYMENT.SALE.DENIED": {
        await recordPaymentEvent({
          event,
          subscriptionId,
          status: "denied",
        })
        await markPaymentDue({
          subscriptionId,
          event,
        })
        break
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        await recordPaymentEvent({
          event,
          subscriptionId,
          status: "failed",
        })
        await markPaymentDue({
          subscriptionId,
          event,
        })
        break
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        await markPaymentDue({
          subscriptionId,
          event,
        })
        break
      }

      case "PAYMENT.SALE.REFUNDED": {
        await recordPaymentEvent({
          event,
          subscriptionId,
          status: "refunded",
        })
        break
      }

      case "PAYMENT.SALE.REVERSED": {
        await recordPaymentEvent({
          event,
          subscriptionId,
          status: "reversed",
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
        error: "Could not process PayPal webhook.",
      },
      {
        status: 500,
      }
    )
  }
}