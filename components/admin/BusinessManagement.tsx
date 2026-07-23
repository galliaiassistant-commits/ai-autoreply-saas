"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CalendarCheck2,
  Lock,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react"
import {
  restoreBusinessAI,
  suspendBusinessAI,
} from "@/app/admin/businesses/actions"

export type AdminBusinessRow = {
  id: string
  businessName: string
  email: string
  subscriptionStatus: string
  createdAt: string | null
  aiSuspended: boolean
  whatsappConnected: boolean
  calendarConnected: boolean
}

type StatusFilter =
  | "all"
  | "active"
  | "attention"
  | "suspended"

export default function BusinessManagement({
  businesses,
}: {
  businesses: AdminBusinessRow[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all")
  const [pendingBusinessId, setPendingBusinessId] =
    useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase()

    return businesses.filter((business) => {
      const matchesSearch =
        !query ||
        business.businessName.toLowerCase().includes(query) ||
        business.email.toLowerCase().includes(query)

      const normalizedStatus =
        business.subscriptionStatus.toLowerCase()

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          ["active", "trialing"].includes(normalizedStatus) &&
          !business.aiSuspended) ||
        (statusFilter === "attention" &&
          ["payment_due", "past_due"].includes(
            normalizedStatus
          )) ||
        (statusFilter === "suspended" &&
          business.aiSuspended)

      return matchesSearch && matchesStatus
    })
  }, [businesses, search, statusFilter])

  function changeAIStatus(business: AdminBusinessRow) {
    const actionName = business.aiSuspended
      ? "restore"
      : "suspend"

    const confirmed = window.confirm(
      business.aiSuspended
        ? `Restore AI replies for ${business.businessName}?`
        : `Suspend AI replies for ${business.businessName}? Customers will stop receiving automatic replies.`
    )

    if (!confirmed) return

    setPendingBusinessId(business.id)

    startTransition(async () => {
      const result = business.aiSuspended
        ? await restoreBusinessAI(business.id)
        : await suspendBusinessAI(business.id)

      setPendingBusinessId(null)
      window.alert(result.message)

      if (result.success) {
        router.refresh()
      }

      console.log(
        `ADMIN BUSINESS ${actionName.toUpperCase()}:`,
        result.success
      )
    })
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total businesses"
          value={businesses.length}
          icon={<Building2 size={20} />}
          color="cyan"
        />
        <SummaryCard
          label="AI enabled"
          value={
            businesses.filter((item) => !item.aiSuspended).length
          }
          icon={<ShieldCheck size={20} />}
          color="green"
        />
        <SummaryCard
          label="WhatsApp connected"
          value={
            businesses.filter((item) => item.whatsappConnected)
              .length
          }
          icon={<MessageCircle size={20} />}
          color="green"
        />
        <SummaryCard
          label="Calendar connected"
          value={
            businesses.filter((item) => item.calendarConnected)
              .length
          }
          icon={<CalendarCheck2 size={20} />}
          color="blue"
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/8 bg-[#0b111d] shadow-xl shadow-black/10">
        <div className="border-b border-white/8 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Business management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search accounts and safely control AI availability.
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
                  placeholder="Search name or email"
                  className="w-full rounded-xl border border-white/8 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 sm:w-64"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="rounded-xl border border-white/8 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
              >
                <option value="all">All accounts</option>
                <option value="active">Active</option>
                <option value="attention">Payment attention</option>
                <option value="suspended">AI suspended</option>
              </select>
            </div>
          </div>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="p-12 text-center">
            <Search size={28} className="mx-auto text-slate-700" />
            <p className="mt-4 font-semibold text-slate-300">
              No businesses found
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Calendar</th>
                  <th className="px-6 py-4">AI status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/6">
                {filteredBusinesses.map((business) => {
                  const loading =
                    isPending && pendingBusinessId === business.id

                  return (
                    <tr
                      key={business.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">
                          {business.businessName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {business.email}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          label={formatStatus(
                            business.subscriptionStatus
                          )}
                          healthy={[
                            "active",
                            "trialing",
                          ].includes(
                            business.subscriptionStatus.toLowerCase()
                          )}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <ConnectionPill
                          connected={business.whatsappConnected}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <ConnectionPill
                          connected={business.calendarConnected}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <StatusPill
                          label={
                            business.aiSuspended
                              ? "Suspended"
                              : "Enabled"
                          }
                          healthy={!business.aiSuspended}
                        />
                      </td>
                      <td className="px-6 py-5 text-slate-400">
                        {formatDate(business.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => changeAIStatus(business)}
                          disabled={isPending}
                          className={
                            business.aiSuspended
                              ? "inline-flex items-center gap-2 rounded-xl border border-green-500/25 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-300 transition hover:bg-green-500/15 disabled:opacity-50"
                              : "inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
                          }
                        >
                          {business.aiSuspended ? (
                            <RotateCcw size={14} />
                          ) : (
                            <Lock size={14} />
                          )}
                          {loading
                            ? "Saving..."
                            : business.aiSuspended
                              ? "Restore AI"
                              : "Suspend AI"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4 text-sm text-slate-400">
        This page only uses business account, billing, and integration
        status. It does not query conversations, customers, bookings,
        memories, or Calendar events.
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: "cyan" | "green" | "blue"
}) {
  const colors = {
    cyan: "bg-cyan-400/10 text-cyan-300",
    green: "bg-green-400/10 text-green-300",
    blue: "bg-blue-400/10 text-blue-300",
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-[#0d1523] to-[#090f1a] p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {icon}
      </div>
      <p className="mt-5 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function ConnectionPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={
        connected
          ? "inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300"
          : "inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-500"
      }
    >
      {connected ? "Connected" : "Not connected"}
    </span>
  )
}

function StatusPill({
  label,
  healthy,
}: {
  label: string
  healthy: boolean
}) {
  return (
    <span
      className={
        healthy
          ? "inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300"
          : "inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300"
      }
    >
      {label}
    </span>
  )
}

function formatStatus(value: string) {
  return String(value || "inactive")
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ")
}

function formatDate(value: string | null) {
  if (!value) return "Unknown"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Unknown"

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeZone: "America/Jamaica",
  }).format(date)
}