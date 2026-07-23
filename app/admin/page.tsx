import {
  Activity,
  ArrowUpRight,
  Building2,
  CalendarCheck2,
  CircleDollarSign,
  MessageCircle,
  ShieldAlert,
} from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

type BusinessRecord = {
  id: string
  business_name: string | null
  email: string | null
  subscription_status: string | null
  created_at: string | null
  ai_suspended_at: string | null
}

type WhatsAppRecord = {
  business_id: string
  connected: boolean | null
}

type CalendarRecord = {
  business_id: string
  connected: boolean | null
}

export default async function AdminPage() {
  const [
    businessesResult,
    whatsappResult,
    calendarResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("businesses")
      .select(
        "id, business_name, email, subscription_status, created_at, ai_suspended_at"
      )
      .order("created_at", { ascending: false })
      .returns<BusinessRecord[]>(),
    supabaseAdmin
      .from("business_integrations")
      .select("business_id, connected")
      .eq("provider", "whatsapp")
      .returns<WhatsAppRecord[]>(),
    supabaseAdmin
      .from("google_calendar_connections")
      .select("business_id, connected")
      .returns<CalendarRecord[]>(),
  ])

  const loadError =
    businessesResult.error ||
    whatsappResult.error ||
    calendarResult.error

  if (loadError) {
    console.error("ADMIN OVERVIEW LOAD ERROR:", loadError)
  }

  const businesses = businessesResult.data || []
  const whatsappConnections = whatsappResult.data || []
  const calendarConnections = calendarResult.data || []

  const whatsappBusinessIds = new Set(
    whatsappConnections
      .filter((item) => item.connected === true)
      .map((item) => item.business_id)
  )

  const calendarBusinessIds = new Set(
    calendarConnections
      .filter((item) => item.connected === true)
      .map((item) => item.business_id)
  )

  const activeBusinesses = businesses.filter((business) =>
    ["active", "trialing"].includes(
      normalizeStatus(business.subscription_status)
    )
  ).length

  const paymentAttention = businesses.filter((business) =>
    ["payment_due", "past_due"].includes(
      normalizeStatus(business.subscription_status)
    )
  ).length

  const suspendedBusinesses = businesses.filter(
    (business) =>
      Boolean(business.ai_suspended_at) ||
      ["cancelled", "expired", "suspended"].includes(
        normalizeStatus(business.subscription_status)
      )
  ).length

  return (
    <div id="overview">
      <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900 via-[#0d1727] to-[#08111e] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-300">
              Platform operational
            </p>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Platform overview
          </p>

          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to your Jhyro control center
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Manage Jhyro business accounts, billing health, and
            integration status without accessing customer
            conversations or bookings.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 backdrop-blur">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10 text-green-300">
            <Activity size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-500">Last refreshed</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-200">
              {formatDateTime(new Date().toISOString())}
            </p>
          </div>
        </div>
        </div>
      </section>

      {loadError && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Some platform information could not be loaded. Check the
          server logs for details.
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStat
          label="Businesses"
          value={businesses.length}
          icon={<Building2 size={21} />}
          tone="cyan"
        />

        <AdminStat
          label="Active plans"
          value={activeBusinesses}
          icon={<CircleDollarSign size={21} />}
          tone="green"
        />

        <AdminStat
          label="Payment attention"
          value={paymentAttention}
          icon={<ShieldAlert size={21} />}
          tone="yellow"
        />

        <AdminStat
          label="WhatsApp connected"
          value={whatsappBusinessIds.size}
          icon={<MessageCircle size={21} />}
          tone="green"
        />

        <AdminStat
          label="Calendar connected"
          value={calendarBusinessIds.size}
          icon={<CalendarCheck2 size={21} />}
          tone="blue"
        />
      </section>

      {suspendedBusinesses > 0 && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {suspendedBusinesses} business account
          {suspendedBusinesses === 1 ? " is" : "s are"} currently
          suspended, cancelled, or expired.
        </div>
      )}

      <section
        id="businesses"
        className="mt-8 scroll-mt-6 overflow-hidden rounded-3xl border border-white/8 bg-[#0b111d] shadow-xl shadow-black/10"
      >
        <div className="flex flex-col gap-3 border-b border-white/8 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Account management
          </p>
          <h2 className="mt-2 text-xl font-bold">
            Business accounts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Account, subscription, and integration information only.
          </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            {businesses.length} total
            <ArrowUpRight size={15} />
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No business accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Calendar</th>
                  <th className="px-6 py-4">AI status</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {businesses.map((business) => {
                  const whatsappConnected =
                    whatsappBusinessIds.has(business.id)

                  const calendarConnected =
                    calendarBusinessIds.has(business.id)

                  const suspended = Boolean(
                    business.ai_suspended_at
                  )

                  return (
                    <tr
                      key={business.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">
                          {business.business_name ||
                            "Unnamed business"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {business.email || "No account email"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusPill
                          value={formatStatus(
                            business.subscription_status
                          )}
                          active={[
                            "active",
                            "trialing",
                          ].includes(
                            normalizeStatus(
                              business.subscription_status
                            )
                          )}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <ConnectionPill
                          connected={whatsappConnected}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <ConnectionPill
                          connected={calendarConnected}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <StatusPill
                          value={suspended ? "Suspended" : "Enabled"}
                          active={!suspended}
                        />
                      </td>

                      <td className="px-6 py-5 text-slate-400">
                        {formatDate(business.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        id="privacy"
        className="mt-6 scroll-mt-6 rounded-3xl border border-cyan-400/15 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 p-6"
      >
        <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <ShieldAlert size={21} />
        </div>

        <div>
        <h2 className="font-semibold text-cyan-200">
          Privacy boundary
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          This dashboard does not query customer records, messages,
          conversations, memories, bookings, or Google Calendar
          events.
        </p>
        </div>
        </div>
      </section>
    </div>
  )
}

function AdminStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone: "cyan" | "green" | "yellow" | "blue"
}) {
  const tones = {
    cyan: "bg-cyan-500/15 text-cyan-300",
    green: "bg-green-500/15 text-green-300",
    yellow: "bg-yellow-500/15 text-yellow-300",
    blue: "bg-blue-500/15 text-blue-300",
  }

  return (
    <div className="group rounded-2xl border border-white/8 bg-gradient-to-br from-[#0d1523] to-[#090f1a] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/20">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function ConnectionPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={
        connected
          ? "inline-flex rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300"
          : "inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-500"
      }
    >
      {connected ? "Connected" : "Not connected"}
    </span>
  )
}

function StatusPill({
  value,
  active,
}: {
  value: string
  active: boolean
}) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300"
          : "inline-flex rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-300"
      }
    >
      {value}
    </span>
  )
}

function normalizeStatus(value: string | null) {
  return String(value || "inactive").toLowerCase()
}

function formatStatus(value: string | null) {
  return normalizeStatus(value)
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

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeZone: "America/Jamaica",
  }).format(date)
}

function formatDateTime(value: string) {
  const date = new Date(value)

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(date)
}