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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const billingState = getBillingState({
    subscriptionStatus,
    paymentDueAt,
    billingGraceEndsAt,
    aiSuspendedAt,
  })

  return (
    <AuthGuard>
      <div className="min-h-screen overflow-x-hidden bg-gray-950 text-white">

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          subscriptionPlan={subscriptionPlan}
        />

        <div
          className={`flex min-h-screen flex-col transition-all duration-300 ${
            sidebarOpen
              ? "md:ml-72"
              : "md:ml-0"
          }`}
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


          <main className="w-full flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>


          <DashboardFooter />

        </div>
      </div>
    </AuthGuard>
  )
}


function DashboardFooter() {
  return (
    <footer className="border-t border-slate-800 px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

        <p>
          © {new Date().getFullYear()} Jhyro AI. All rights reserved.
        </p>

        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >

          <Link
            href="/privacy"
            className="transition hover:text-slate-300"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-slate-300"
          >
            Terms of Service
          </Link>

          <Link
            href="/data-deletion"
            className="transition hover:text-slate-300"
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

  const status = subscriptionStatus.toLowerCase()


  const isPaymentDue =
    status === "payment_due" ||
    status === "past_due"


  const isStopped =
    status === "cancelled" ||
    status === "expired" ||
    status === "suspended"


  const graceDate =
    billingGraceEndsAt
      ? new Date(billingGraceEndsAt)
      : null


  const graceIsValid =
    Boolean(
      graceDate &&
      !Number.isNaN(
        graceDate.getTime()
      )
    )


  const graceHasEnded =
    Boolean(
      graceIsValid &&
      graceDate &&
      Date.now() >= graceDate.getTime()
    )


  const suspended =
    Boolean(aiSuspendedAt) ||
    isStopped ||
    (isPaymentDue && graceHasEnded)


  const dayMs =
    1000 * 60 * 60 * 24


  const daysRemaining =
    graceIsValid &&
    graceDate &&
    !graceHasEnded
      ? Math.max(
          1,
          Math.ceil(
            (graceDate.getTime() - Date.now()) / dayMs
          )
        )
      : 0


  return {
    status,
    showBanner:
      isPaymentDue ||
      suspended,
    suspended,
    daysRemaining,
    paymentDueAt:
      formatBillingDate(paymentDueAt),
    graceEndsAt:
      formatBillingDate(billingGraceEndsAt),
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

    <div className="px-4 pt-4 sm:px-6">

      <section
        className={
          suspended
            ? "rounded-2xl border border-red-500/40 bg-red-500/10 p-4 sm:p-5"
            : "rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 sm:p-5"
        }
      >

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


          <div className="flex min-w-0 items-start gap-4">

            <div
              className={
                suspended
                  ? "rounded-xl bg-red-500/20 p-3 text-red-400"
                  : "rounded-xl bg-yellow-500/20 p-3 text-yellow-400"
              }
            >

              {suspended
                ? <Lock size={22}/>
                : <AlertCircle size={22}/>
              }

            </div>


            <div className="min-w-0">

              <h2
                className={
                  suspended
                    ? "font-bold text-red-300"
                    : "font-bold text-yellow-300"
                }
              >
                {suspended
                  ? "Jhyro AI replies are suspended"
                  : "Payment is due"}
              </h2>


              <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">

                {suspended
                  ? status === "cancelled" ||
                    status === "expired" ||
                    status === "suspended"
                    ? `Your subscription is ${status}. Renew your PayPal plan to restore automatic replies.`
                    : "The 7-day grace period has ended. Renew your PayPal subscription to restore automatic WhatsApp replies."
                  : `Your PayPal payment is overdue. Jhyro AI remains active for ${daysRemaining} more day${daysRemaining === 1 ? "" : "s"}.`
                }

              </p>


              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">

                <span className="flex items-center gap-2">
                  <AlertCircle size={14}/>
                  Due: {paymentDueAt}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={14}/>
                  Grace ends: {graceEndsAt}
                </span>

              </div>

            </div>

          </div>


          <Link
            href="/dashboard/billing"
            className={
              suspended
                ? "inline-flex justify-center rounded-xl bg-red-400 px-5 py-3 font-bold text-slate-950"
                : "inline-flex justify-center rounded-xl bg-yellow-300 px-5 py-3 font-bold text-slate-950"
            }
          >
            Open Billing
          </Link>


        </div>

      </section>

    </div>
  )
}


function formatBillingDate(value: string | null) {

  if (!value) return "Not set"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
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