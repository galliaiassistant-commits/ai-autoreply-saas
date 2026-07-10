import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  if (!webhookSecret) {
    return new Response("Missing webhook secret", {
      status: 500,
    })
  }

  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return new Response("Missing Stripe signature", {
      status: 400,
    })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error("STRIPE WEBHOOK SIGNATURE ERROR:", error)

    return new Response("Invalid webhook signature", {
      status: 400,
    })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data
          .object as Stripe.Checkout.Session

        await handleCheckoutCompleted(session)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any

        await handleSubscriptionUpdated(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any

        await handleSubscriptionUpdated(
          subscription,
          "canceled"
        )
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any

        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any

        await handleInvoicePaymentFailed(invoice)
        break
      }

      default: {
        console.log("Unhandled Stripe event:", event.type)
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("STRIPE WEBHOOK HANDLER ERROR:", error)

    return new Response("Webhook handler failed", {
      status: 500,
    })
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const businessId = session.metadata?.business_id
  const plan = session.metadata?.plan || "unknown"

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null

  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null

  if (!businessId) {
    console.error("CHECKOUT SESSION MISSING BUSINESS ID")
    return
  }

  const { error: businessError } = await supabase
    .from("businesses")
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_plan: plan,
      subscription_status: "active",
    })
    .eq("id", businessId)

  if (businessError) {
    console.error(
      "CHECKOUT BUSINESS UPDATE ERROR:",
      businessError
    )
  }

  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      business_id: businessId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      amount: session.amount_total || null,
      currency: session.currency || "usd",
      status: "checkout_completed",
    })

  if (paymentError) {
    console.error(
      "CHECKOUT PAYMENT INSERT ERROR:",
      paymentError
    )
  }
}

async function handleSubscriptionUpdated(
  subscription: any,
  forcedStatus?: string
) {
  const businessId = subscription.metadata?.business_id
  const plan = subscription.metadata?.plan

  const periodEnd = subscription.current_period_end
    ? new Date(
        subscription.current_period_end * 1000
      ).toISOString()
    : null

  const updateData = {
    stripe_subscription_id: subscription.id,
    subscription_plan: plan || undefined,
    subscription_status:
      forcedStatus || subscription.status || "unknown",
    subscription_current_period_end: periodEnd,
  }

  if (businessId) {
    const { error } = await supabase
      .from("businesses")
      .update(updateData)
      .eq("id", businessId)

    if (error) {
      console.error(
        "SUBSCRIPTION UPDATE BY BUSINESS ERROR:",
        error
      )
    }

    return
  }

  const { error } = await supabase
    .from("businesses")
    .update(updateData)
    .eq("stripe_subscription_id", subscription.id)

  if (error) {
    console.error(
      "SUBSCRIPTION UPDATE BY STRIPE ID ERROR:",
      error
    )
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)

  if (!subscriptionId) return

  const { data: business, error: businessError } =
    await supabase
      .from("businesses")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle()

  if (businessError) {
    console.error(
      "INVOICE BUSINESS LOOKUP ERROR:",
      businessError
    )
  }

  if (!business) return

  const stripeCustomerId = getInvoiceCustomerId(invoice)

  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      business_id: business.id,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionId,
      amount: invoice.amount_paid || null,
      currency: invoice.currency || "usd",
      status: "paid",
    })

  if (paymentError) {
    console.error(
      "INVOICE PAYMENT INSERT ERROR:",
      paymentError
    )
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      subscription_status: "active",
    })
    .eq("id", business.id)

  if (updateError) {
    console.error(
      "INVOICE BUSINESS STATUS UPDATE ERROR:",
      updateError
    )
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)

  if (!subscriptionId) return

  const { error } = await supabase
    .from("businesses")
    .update({
      subscription_status: "past_due",
    })
    .eq("stripe_subscription_id", subscriptionId)

  if (error) {
    console.error(
      "INVOICE PAYMENT FAILED UPDATE ERROR:",
      error
    )
  }
}

function getInvoiceSubscriptionId(invoice: any) {
  if (!invoice) return null

  if (typeof invoice.subscription === "string") {
    return invoice.subscription
  }

  if (invoice.subscription?.id) {
    return invoice.subscription.id
  }

  if (typeof invoice.parent?.subscription_details?.subscription === "string") {
    return invoice.parent.subscription_details.subscription
  }

  return null
}

function getInvoiceCustomerId(invoice: any) {
  if (!invoice) return null

  if (typeof invoice.customer === "string") {
    return invoice.customer
  }

  if (invoice.customer?.id) {
    return invoice.customer.id
  }

  return null
}