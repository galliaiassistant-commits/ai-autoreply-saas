import {
  redirect,
} from "next/navigation"
import {
  createClient,
} from "@/lib/supabase/server"
import {
  getCurrentBusiness,
  getCurrentBusinesses,
} from "@/lib/auth"
import {
  businessCanUseFeature,
} from "@/lib/plans"
import DashboardShell from "./DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  const business =
    await getCurrentBusiness()

  const subscriptionPlan =
    business?.subscription_plan ||
    business?.plan ||
    "free"

  const subscriptionStatus =
    business?.subscription_status ||
    business?.billing_status ||
    "inactive"

  const canManageWorkspaces =
    business
      ? businessCanUseFeature(
          business,
          "multiple_businesses"
        )
      : false

  const allBusinesses =
    canManageWorkspaces
      ? await getCurrentBusinesses()
      : business
        ? [business]
        : []

  const businesses =
    allBusinesses.map(
      (item) => ({
        id: String(item.id),
        business_name:
          item.business_name ||
          item.name ||
          "Unnamed Business",
      })
    )

  return (
    <DashboardShell
      subscriptionPlan={String(
        subscriptionPlan
      )}
      subscriptionStatus={String(
        subscriptionStatus
      )}
      paymentDueAt={
        business?.payment_due_at ||
        null
      }
      billingGraceEndsAt={
        business
          ?.billing_grace_ends_at ||
        null
      }
      aiSuspendedAt={
        business?.ai_suspended_at ||
        null
      }
      businesses={businesses}
      currentBusinessId={
        business?.id || null
      }
      canManageWorkspaces={
        canManageWorkspaces
      }
    >
      {children}
    </DashboardShell>
  )
}