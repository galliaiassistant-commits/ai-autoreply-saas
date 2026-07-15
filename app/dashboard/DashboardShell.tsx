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

type DashboardShellProps = {
  children: React.ReactNode
  subscriptionStatus: string
  paymentDueAt: string | null
  billingGraceEndsAt: string | null
  aiSuspendedAt: string | null
}

export default function DashboardShell({
  children,
  subscriptionStatus,
  paymentDueAt,
  billingGraceEndsAt,
  aiSuspendedAt,
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
      <div className="min-h-screen bg-gray-950 text-white">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        <div
          className={`min-h-screen transition-all duration-300 ${
            sidebarOpen ? "md:ml-72" : "md:ml-0"
          }`}
        >
          <Topbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
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

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
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

  const isPaymentDue =
    status === "payment_due" ||
    status === "past_due"

  const isStopped =
    status === "cancelled" ||
    status === "expired" ||
    status === "suspended"

  const graceDate = billingGraceEndsAt
    ? new Date(billingGraceEndsAt)
    : null

  const graceIsValid =
    Boolean(
      graceDate &&
      !Number.isNaN(graceDate.getTime())
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

  const dayMs = 1000 * 60 * 60 * 24

  const daysRemaining =
    graceIsValid && graceDate && !graceHasEnded
      ? Math.max(
          1,
          Math.ceil(
            (graceDate.getTime() - Date.now()) /
              dayMs
          )
        )
      : 0

  return {
    status,
    showBanner: isPaymentDue || suspended,
    suspended,
    daysRemaining,
    paymentDueAt: formatBillingDate(paymentDueAt),
    graceEndsAt: formatBillingDate(
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
    <div className="px-6 pt-6">
      <section
        className={
          suspended
            ? "rounded-2xl border border-red-500/40 bg-red-500/10 p-5"
            : "rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5"
        }
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={
                suspended
                  ? "rounded-xl bg-red-500/20 p-3 text-red-400"
                  : "rounded-xl bg-yellow-500/20 p-3 text-yellow-400"
              }
            >
              {suspended ? (
                <Lock size={22} />
              ) : (
                <AlertCircle size={22} />
              )}
            </div>

            <div>
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

              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {suspended
                  ? status === "cancelled" ||
                    status === "expired" ||
                    status === "suspended"
                    ? `Your subscription is ${status}. Renew your PayPal plan to restore automatic replies.`
                    : "The 7-day grace period has ended. Renew your PayPal subscription to restore automatic WhatsApp replies."
                  : `Your PayPal payment is overdue. Jhyro AI remains active for ${daysRemaining} more day${
                      daysRemaining === 1 ? "" : "s"
                    }.`}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  Due: {paymentDueAt}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={14} />
                  Grace ends: {graceEndsAt}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/billing"
            className={
              suspended
                ? "inline-flex shrink-0 items-center justify-center rounded-xl bg-red-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-red-300"
                : "inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-yellow-200"
            }
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
  if (!value) {
    return "Not set"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(date)
}