import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import DashboardShell from "./DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  const business = await getCurrentBusiness()

  const subscriptionStatus =
    business?.subscription_status ||
    business?.billing_status ||
    "inactive"

  return (
    <DashboardShell
      subscriptionStatus={String(
        subscriptionStatus
      )}
      paymentDueAt={
        business?.payment_due_at || null
      }
      billingGraceEndsAt={
        business?.billing_grace_ends_at ||
        null
      }
      aiSuspendedAt={
        business?.ai_suspended_at || null
      }
    >
      {children}
    </DashboardShell>
  )
}