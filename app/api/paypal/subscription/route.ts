import {
  NextResponse,
} from "next/server"
import {
  getCurrentBusiness,
} from "@/lib/auth"
import {
  getPayPalSubscription,
} from "@/lib/paypal"
import {
  supabaseAdmin as supabase,
} from "@/lib/supabase/admin"

export const runtime = "nodejs"

type Plan =
  | "starter"
  | "pro"
  | "business"

const planMap: Record<
  Plan,
  string | undefined
> = {
  starter:
    process.env
      .NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID,

  pro:
    process.env
      .NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID,

  business:
    process.env
      .NEXT_PUBLIC_PAYPAL_BUSINESS_PLAN_ID,
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

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json()

    const subscriptionId =
      body?.subscriptionId

    const plan = body?.plan

    if (
      !subscriptionId ||
      typeof subscriptionId !==
        "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Missing PayPal subscription ID.",
        },
        {
          status: 400,
        }
      )
    }

    if (!isPlan(plan)) {
      return NextResponse.json(
        {
          error: "Invalid plan.",
        },
        {
          status: 400,
        }
      )
    }

    const expectedPlanId =
      planMap[plan]

    if (!expectedPlanId) {
      return NextResponse.json(
        {
          error:
            "Missing PayPal plan ID for this plan.",
        },
        {
          status: 500,
        }
      )
    }

    const currentBusiness =
      await getCurrentBusiness()

    if (!currentBusiness) {
      return NextResponse.json(
        {
          error:
            "No business found.",
        },
        {
          status: 401,
        }
      )
    }

    const billingBusinessId =
      currentBusiness
        .billing_business_id ||
      currentBusiness.id

    const {
      data: billingBusiness,
      error: billingLoadError,
    } = await supabase
      .from("businesses")
      .select(
        "id, owner_id, billing_business_id"
      )
      .eq(
        "id",
        billingBusinessId
      )
      .eq(
        "owner_id",
        currentBusiness.owner_id
      )
      .maybeSingle()

    if (billingLoadError) {
      console.error(
        "PAYPAL BILLING BUSINESS LOAD ERROR:",
        billingLoadError
      )

      return NextResponse.json(
        {
          error:
            "Could not load the billing business.",
        },
        {
          status: 500,
        }
      )
    }

    if (
      !billingBusiness ||
      billingBusiness
        .billing_business_id
    ) {
      return NextResponse.json(
        {
          error:
            "The main billing business was not found.",
        },
        {
          status: 400,
        }
      )
    }

    const subscription =
      await getPayPalSubscription(
        subscriptionId
      )

    const paypalPlanId =
      subscription.plan_id ||
      null

    if (
      paypalPlanId &&
      paypalPlanId !==
        expectedPlanId
    ) {
      return NextResponse.json(
        {
          error:
            "PayPal plan ID does not match selected plan.",
        },
        {
          status: 400,
        }
      )
    }

    const paypalStatus =
      subscription.status ||
      "UNKNOWN"

    const appStatus =
      paypalStatus === "ACTIVE"
        ? "active"
        : paypalStatus.toLowerCase()

    const nextBillingTime =
      subscription.billing_info
        ?.next_billing_time ||
      null

    const {
      error: businessError,
    } = await supabase
      .from("businesses")
      .update({
        paypal_subscription_id:
          subscriptionId,

        payment_provider:
          "paypal",

        subscription_plan:
          plan,

        subscription_status:
          appStatus,

        subscription_current_period_end:
          nextBillingTime,
      })
      .eq(
        "id",
        billingBusiness.id
      )

    if (businessError) {
      console.error(
        "PAYPAL BUSINESS UPDATE ERROR:",
        businessError
      )

      return NextResponse.json(
        {
          error:
            "Could not update business subscription.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      ok: true,
      status: appStatus,
      plan,
      billingBusinessId:
        billingBusiness.id,
    })
  } catch (error) {
    console.error(
      "PAYPAL SUBSCRIPTION ROUTE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Could not save PayPal subscription.",
      },
      {
        status: 500,
      }
    )
  }
}