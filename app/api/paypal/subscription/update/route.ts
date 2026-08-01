import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import {
  updatePayPalSubscription,
  getPayPalSubscription,
} from "@/lib/paypal"
import {
  supabaseAdmin as supabase,
} from "@/lib/supabase/admin"

type Plan =
  | "starter"
  | "pro"
  | "business"

const planMap: Record<
  Plan,
  string | undefined
> = {
  starter:
    process.env.NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID,

  pro:
    process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID,

  business:
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_PLAN_ID,
}

function isPlan(
  value: unknown
): value is Plan {
  return (
    value === "starter" ||
    value === "pro" ||
    value === "business"
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const plan = body.plan

    if (!isPlan(plan)) {
      return NextResponse.json(
        {
          error: "Invalid plan",
        },
        {
          status: 400,
        }
      )
    }

    const currentBusiness =
      await getCurrentBusiness()

    if (!currentBusiness) {
      return NextResponse.json(
        {
          error: "No business found",
        },
        {
          status: 401,
        }
      )
    }

    const subscriptionId =
      currentBusiness.paypal_subscription_id

    if (!subscriptionId) {
      return NextResponse.json(
        {
          error:
            "No active PayPal subscription found",
        },
        {
          status: 400,
        }
      )
    }

    const newPlanId =
      planMap[plan]

    if (!newPlanId) {
      return NextResponse.json(
        {
          error:
            "Missing PayPal plan ID",
        },
        {
          status: 500,
        }
      )
    }

    await updatePayPalSubscription(
      subscriptionId,
      newPlanId
    )

    const updatedSubscription =
      await getPayPalSubscription(
        subscriptionId
      )

    const newStatus =
      updatedSubscription.status
        ?.toLowerCase() ||
      "unknown"

    const { error: updateError } =
      await supabase
        .from("businesses")
        .update({
          subscription_plan: plan,
          subscription_status:
            newStatus,
        })
        .eq(
          "id",
          currentBusiness.id
        )

    if (updateError) {
      console.error(
        "PAYPAL PLAN UPDATE DATABASE ERROR:",
        updateError
      )

      return NextResponse.json(
        {
          error:
            "Could not update business plan",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      ok: true,
      plan,
      status: newStatus,
    })

  } catch (error) {
    console.error(
      "PAYPAL UPDATE ROUTE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Could not update subscription",
      },
      {
        status: 500,
      }
    )
  }
}