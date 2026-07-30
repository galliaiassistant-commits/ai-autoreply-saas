import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import { cancelPayPalSubscription } from "@/lib/paypal"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function POST() {
  try {
    const business =
      await getCurrentBusiness()

    if (!business) {
      return NextResponse.json(
        {
          error: "No business found.",
        },
        {
          status: 401,
        }
      )
    }

    const subscriptionId =
      business.paypal_subscription_id

    if (!subscriptionId) {
      return NextResponse.json(
        {
          error:
            "No PayPal subscription found.",
        },
        {
          status: 400,
        }
      )
    }

    await cancelPayPalSubscription(
      subscriptionId
    )

    const { error } =
      await supabase
        .from("businesses")
        .update({
          subscription_status:
            "cancelled",
        })
        .eq(
          "id",
          business.id
        )

    if (error) {
      console.error(
        "DATABASE CANCEL UPDATE ERROR:",
        error
      )

      return NextResponse.json(
        {
          error:
            "Subscription cancelled but database update failed.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error(
      "CANCEL SUBSCRIPTION ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Could not cancel subscription.",
      },
      {
        status: 500,
      }
    )
  }
}