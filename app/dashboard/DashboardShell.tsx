"use client"

import Link from "next/link"
import { useState } from "react"
import {
  AlertCircle,
  Clock3,
  Lock,
} from "lucide-react"

import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import AuthGuard from "@/components/auth/AuthGuard"

type Workspace = {
  id: string
  business_name: string | null
}

type DashboardShellProps = {
  children: React.ReactNode
  subscriptionPlan?: string
  subscriptionStatus: string
  paymentDueAt: string | null
  billingGraceEndsAt: string | null
  aiSuspendedAt: string | null
  businesses?: Workspace[]
  currentBusinessId?: string | null
  canManageWorkspaces?: boolean
}

export default function DashboardShell({
  children,
  subscriptionPlan = "free",
  subscriptionStatus,
  paymentDueAt,
  billingGraceEndsAt,
  aiSuspendedAt,
  businesses = [],
  currentBusinessId = null,
  canManageWorkspaces = false,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const billingState = getBillingState({
    subscriptionStatus,
    paymentDueAt,
    billingGraceEndsAt,
    aiSuspendedAt,
  })

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050816] text-white">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          subscriptionPlan={subscriptionPlan}
        />

        <div
  className={`
    min-h-screen
    transition-all
    duration-300
    ease-in-out
    ${
      sidebarOpen
        ? "lg:pl-72"
        : "lg:pl-0"
    }
  `}
>
          <Topbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            businesses={businesses}
            currentBusinessId={currentBusinessId}
            canManageWorkspaces={canManageWorkspaces}
          />

          {billingState.showBanner && (
            <GlobalBillingBanner
              suspended={billingState.suspended}
              daysRemaining={billingState.daysRemaining}
              paymentDueAt={billingState.paymentDueAt}
              graceEndsAt={billingState.graceEndsAt}
              status={billingState.status}
            />
          )}

          <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
            <div className="animate-in fade-in duration-500">
              {children}
            </div>
          </main>

          <DashboardFooter />
        </div>
      </div>
    </AuthGuard>
  )
}


function DashboardFooter() {
  return (
    <footer className="border-t border-slate-800/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Jhyro AI. All rights reserved.
        </p>

        <nav className="flex flex-wrap gap-5">
          <Link
            href="/privacy"
            className="hover:text-slate-300 transition"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="hover:text-slate-300 transition"
          >
            Terms
          </Link>

          <Link
            href="/data-deletion"
            className="hover:text-slate-300 transition"
          >
            Data Deletion
          </Link>
        </nav>
      </div>
    </footer>
  )
}


function getBillingState({
  subscriptionStatus,
  paymentDueAt,
  billingGraceEndsAt,
  aiSuspendedAt,
}: {
  subscriptionStatus: string
  paymentDueAt: string | null
  billingGraceEndsAt: string | null
  aiSuspendedAt: string | null
}) {
  const status =
    subscriptionStatus.toLowerCase()

  const paymentDue =
    status === "payment_due" ||
    status === "past_due"

  const stopped =
    status === "cancelled" ||
    status === "expired" ||
    status === "suspended"


  const graceDate =
    billingGraceEndsAt
      ? new Date(billingGraceEndsAt)
      : null


  const graceValid =
    Boolean(
      graceDate &&
      !Number.isNaN(
        graceDate.getTime()
      )
    )


  const graceEnded =
    Boolean(
      graceValid &&
      graceDate &&
      Date.now() >= graceDate.getTime()
    )


  const suspended =
    Boolean(aiSuspendedAt) ||
    stopped ||
    (paymentDue && graceEnded)


  const day =
    1000 *
    60 *
    60 *
    24


  const daysRemaining =
    graceValid &&
    graceDate &&
    !graceEnded
      ? Math.max(
          1,
          Math.ceil(
            (
              graceDate.getTime() -
              Date.now()
            ) /
            day
          )
        )
      : 0


  return {
    status,
    suspended,
    daysRemaining,
    showBanner:
      paymentDue ||
      suspended,
    paymentDueAt:
      formatBillingDate(
        paymentDueAt
      ),
    graceEndsAt:
      formatBillingDate(
        billingGraceEndsAt
      ),
  }
}


function GlobalBillingBanner({
  suspended,
  daysRemaining,
  paymentDueAt,
  graceEndsAt,
  status,
}: {
  suspended: boolean
  daysRemaining: number
  paymentDueAt: string
  graceEndsAt: string
  status: string
}) {
  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <section
        className={
          suspended
            ? "rounded-3xl border border-red-500/30 bg-red-500/10 p-5"
            : "rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5"
        }
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
          <div className="flex gap-4">
            <div className={
              suspended
                ? "rounded-2xl bg-red-500/20 p-3 text-red-400"
                : "rounded-2xl bg-yellow-500/20 p-3 text-yellow-400"
            }>
              {suspended ? (
                <Lock size={22}/>
              ) : (
                <AlertCircle size={22}/>
              )}
            </div>

            <div>
              <h2 className="font-bold">
                {suspended
                  ? "Jhyro AI replies are suspended"
                  : "Payment is due"}
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                {suspended
                  ? `Subscription status: ${status}`
                  : `Your payment is overdue. ${daysRemaining} days remaining.`}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <AlertCircle size={14}/>
                  Due: {paymentDueAt}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={14}/>
                  Grace: {graceEndsAt}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/billing"
            className="rounded-xl bg-white px-5 py-3 text-center font-bold text-black"
          >
            Open Billing
          </Link>
        </div>
      </section>
    </div>
  )
}


function formatBillingDate(
  value: string | null
) {
  if (!value) return "Not set"

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat(
    "en-JM",
    {
      dateStyle:"medium",
      timeStyle:"short",
      timeZone:"America/Jamaica",
    }
  ).format(date)
}