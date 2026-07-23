"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  ExternalLink,
  Search,
  TriangleAlert,
} from "lucide-react"

export type AdminPaymentRow = {
  id: string
  businessId: string
  businessName: string
  businessEmail: string
  subscriptionPlan: string
  status: string
  amount: number | null
  currency: string
  provider: string
  paypalTransactionId: string | null
  paypalSubscriptionId: string | null
  eventType: string | null
  paidAt: string | null
  failedAt: string | null
  createdAt: string | null
}

type PaymentFilter =
  | "all"
  | "completed"
  | "failed"
  | "refunded"

export default function PaymentManagement({
  payments,
}: {
  payments: AdminPaymentRow[]
}) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] =
    useState<PaymentFilter>("all")

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.businessName.toLowerCase().includes(query) ||
        payment.businessEmail.toLowerCase().includes(query) ||
        payment.paypalTransactionId
          ?.toLowerCase()
          .includes(query) ||
        payment.paypalSubscriptionId
          ?.toLowerCase()
          .includes(query)

      const normalizedStatus = payment.status.toLowerCase()

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" &&
          normalizedStatus === "completed") ||
        (filter === "failed" &&
          ["failed", "denied"].includes(normalizedStatus)) ||
        (filter === "refunded" &&
          ["refunded", "reversed"].includes(normalizedStatus))

      return matchesSearch && matchesFilter
    })
  }, [payments, search, filter])

  const completedPayments = payments.filter(
    (payment) => payment.status.toLowerCase() === "completed"
  )

  const completedRevenue = completedPayments.reduce(
    (total, payment) => total + (payment.amount || 0),
    0
  )

  const failedPayments = payments.filter((payment) =>
    ["failed", "denied"].includes(
      payment.status.toLowerCase()
    )
  ).length

  return (
    <div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PaymentStat
          label="Payment records"
          value={String(payments.length)}
          icon={<CreditCard size={20} />}
          tone="cyan"
        />
        <PaymentStat
          label="Completed payments"
          value={String(completedPayments.length)}
          icon={<CheckCircle2 size={20} />}
          tone="green"
        />
        <PaymentStat
          label="Completed value"
          value={formatMoney(completedRevenue, "USD")}
          icon={<CircleDollarSign size={20} />}
          tone="blue"
        />
        <PaymentStat
          label="Failed or denied"
          value={String(failedPayments)}
          icon={<TriangleAlert size={20} />}
          tone="yellow"
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/8 bg-[#0b111d] shadow-xl shadow-black/10">
        <div className="border-b border-white/8 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Payment history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Verified PayPal payment events across Jhyro.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search business or transaction"
                  className="w-full rounded-xl border border-white/8 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 sm:w-72"
                />
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as PaymentFilter)
                }
                className="rounded-xl border border-white/8 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
              >
                <option value="all">All payments</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed or denied</option>
                <option value="refunded">Refunded or reversed</option>
              </select>
            </div>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard
              size={30}
              className="mx-auto text-slate-700"
            />
            <p className="mt-4 font-semibold text-slate-300">
              No payments found
            </p>
            <p className="mt-1 text-sm text-slate-600">
              New verified PayPal events will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Profile</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white">
                        {payment.businessName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.businessEmail}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-200">
                      {payment.amount === null
                        ? "—"
                        : formatMoney(
                            payment.amount,
                            payment.currency
                          )}
                    </td>
                    <td className="px-6 py-5">
                      <PaymentStatus status={payment.status} />
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      {formatLabel(payment.subscriptionPlan)}
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">
                      {shortenId(payment.paypalTransactionId)}
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">
                      {shortenId(payment.paypalSubscriptionId)}
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      {formatDateTime(
                        payment.paidAt ||
                          payment.failedAt ||
                          payment.createdAt
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/businesses/${payment.businessId}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/5 hover:text-cyan-200"
                      >
                        View
                        <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function PaymentStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: "cyan" | "green" | "blue" | "yellow"
}) {
  const tones = {
    cyan: "bg-cyan-400/10 text-cyan-300",
    green: "bg-green-400/10 text-green-300",
    blue: "bg-blue-400/10 text-blue-300",
    yellow: "bg-yellow-400/10 text-yellow-300",
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-[#0d1523] to-[#090f1a] p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        {icon}
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function PaymentStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const completed = normalized === "completed"
  const failed = ["failed", "denied"].includes(normalized)

  return (
    <span
      className={
        completed
          ? "inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300"
          : failed
            ? "inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300"
            : "inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300"
      }
    >
      {formatLabel(status)}
    </span>
  )
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`
  }
}

function formatLabel(value: string) {
  return String(value || "Unknown")
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ")
}

function shortenId(value: string | null) {
  if (!value) return "—"
  if (value.length <= 18) return value
  return `${value.slice(0, 9)}…${value.slice(-6)}`
}

function formatDateTime(value: string | null) {
  if (!value) return "Unknown"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Unknown"

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(date)
}