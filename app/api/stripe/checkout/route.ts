import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"

export const runtime = "nodejs"

type Plan = "starter" | "pro" | "business"

const priceMap: Record<Plan, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  business: process.env.STRIPE_BUSINESS_PRICE_ID,
}

export async function POST(req: Request) {
  try {
    const { plan } = (await req.json()) as { plan?: Plan }

    if (!plan || !priceMap[plan]) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      )
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"

    const supabase = await createClient()
    const business = await getCurrentBusiness()

    if (!business) {
      return NextResponse.json(
        { error: "No business found." },
        { status: 401 }
      )
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      )
    }

    let stripeCustomerId =
      business.stripe_customer_id || null

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name:
          business.business_name ||
          business.name ||
          "Jhyro AI Customer",
        metadata: {
          business_id: business.id,
          user_id: user.id,
        },
      })

      stripeCustomerId = customer.id

      await supabase
        .from("businesses")
        .update({
          stripe_customer_id: stripeCustomerId,
        })
        .eq("id", business.id)
    }

    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceMap[plan],
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard/billing?success=true`,
        cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
        metadata: {
          business_id: business.id,
          plan,
        },
        subscription_data: {
          metadata: {
            business_id: business.id,
            plan,
          },
        },
        allow_promotion_codes: true,
      })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error)

    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 }
    )
  }
}