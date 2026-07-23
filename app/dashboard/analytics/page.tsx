import Link from "next/link"
import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  Users,
  AlertCircle,
  TrendingUp,
  Bot,
  LockKeyhole,
} from "lucide-react"

export default async function AnalyticsPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="Track how Jhyro AI is performing for your business."
        />

        <EmptyPanel message="No business found for this account." />
      </div>
    )
  }

  const canUseBookings =
    businessCanUseFeature(
      business,
      "appointment_bookings"
    )

  const canManageServices =
    businessCanUseFeature(
      business,
      "service_management"
    )

  const canUseGoogleCalendar =
    businessCanUseFeature(
      business,
      "google_calendar"
    )

  const supabase =
    await createClient()

  const [
    { data: customers },
    { data: bookings },
    { data: messages },
    { data: services },
    { data: integrations },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    canUseBookings
      ? supabase
          .from("bookings")
          .select("*")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({
          data: [],
          error: null,
        }),

    supabase
      .from("messages")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    canManageServices
      ? supabase
          .from("business_services")
          .select("*")
          .eq("business_id", business.id)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", business.id),
  ])

  const safeCustomers = customers || []
  const safeBookings = bookings || []
  const safeMessages = messages || []
  const safeServices = services || []
  const safeIntegrations = integrations || []

  const bookedBookings = safeBookings.filter(
    (booking) => booking.status === "booked"
  ).length

  const completedBookings = safeBookings.filter(
    (booking) => booking.status === "completed"
  ).length

  const missingDetails = safeBookings.filter(
    (booking) => booking.status === "missing_details"
  ).length

  const cancelledBookings = safeBookings.filter(
    (booking) => booking.status === "cancelled"
  ).length

  const customerMessages = safeMessages.filter(
    (message) => message.role === "user"
  ).length

  const aiMessages = safeMessages.filter(
    (message) => message.role === "assistant"
  ).length

  const connectedIntegrations = safeIntegrations.filter(
    (integration) =>
      integration.connected &&
      (
        integration.provider !==
          "google_calendar" ||
        canUseGoogleCalendar
      )
  ).length

  const completionRate =
    safeBookings.length > 0
      ? Math.round((completedBookings / safeBookings.length) * 100)
      : 0

  const bookingRate =
    safeCustomers.length > 0
      ? Math.round((bookedBookings / safeCustomers.length) * 100)
      : 0

  const aiReplyRate =
    customerMessages > 0
      ? Math.round((aiMessages / customerMessages) * 100)
      : 0

  const topServices = getTopServices(safeBookings)

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track customers, messages, bookings, services, and AI performance."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Customers"
          value={safeCustomers.length}
          helper="Total customer profiles"
          icon={<Users size={20} />}
        />

        {canUseBookings ? (
          <MetricCard
            title="Bookings"
            value={safeBookings.length}
            helper="All appointment records"
            icon={<CalendarDays size={20} />}
          />
        ) : (
          <LockedMetricCard
            title="Bookings"
            icon={<CalendarDays size={20} />}
          />
        )}

        <MetricCard
          title="Messages"
          value={safeMessages.length}
          helper="Customer + AI messages"
          icon={<MessageCircle size={20} />}
        />

        <MetricCard
          title="AI Replies"
          value={aiMessages}
          helper="Responses sent by Jhyro AI"
          icon={<Bot size={20} />}
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {canUseBookings ? (
          <ScoreCard
            title="Booking Rate"
            value={`${bookingRate}%`}
            description="Booked appointments compared to total customers."
            icon={<TrendingUp size={18} />}
          />
        ) : (
          <LockedScoreCard
            title="Booking Rate"
            icon={<TrendingUp size={18} />}
          />
        )}

        {canUseBookings ? (
          <ScoreCard
            title="Completion Rate"
            value={`${completionRate}%`}
            description="Completed bookings compared to all bookings."
            icon={<CheckCircle2 size={18} />}
          />
        ) : (
          <LockedScoreCard
            title="Completion Rate"
            icon={<CheckCircle2 size={18} />}
          />
        )}

        <ScoreCard
          title="AI Reply Ratio"
          value={`${aiReplyRate}%`}
          description="AI replies compared to customer messages."
          icon={<Activity size={18} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        {canUseBookings ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Booking Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Status overview for this business only.
          </p>

          <div className="mt-6 space-y-4">
            <ProgressRow
              label="Booked"
              value={bookedBookings}
              total={safeBookings.length}
            />

            <ProgressRow
              label="Completed"
              value={completedBookings}
              total={safeBookings.length}
            />

            <ProgressRow
              label="Missing Details"
              value={missingDetails}
              total={safeBookings.length}
            />

            <ProgressRow
              label="Cancelled"
              value={cancelledBookings}
              total={safeBookings.length}
            />
          </div>
        </section>
        ) : (
          <UpgradePanel
            title="Booking Breakdown"
            message="Booking analytics are available on the Pro and Business plans."
          />
        )}

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              System Health
            </h2>

            <div className="mt-5 space-y-4">
              {canManageServices ? (
                <HealthRow
                  label="Active Services"
                  value={safeServices.filter((service) => service.is_active).length}
                />
              ) : (
                <LockedHealthRow
                  label="Active Services"
                />
              )}

              <HealthRow
                label="Connected Integrations"
                value={connectedIntegrations}
              />

              {canUseBookings ? (
                <HealthRow
                  label="Missing Detail Bookings"
                  value={missingDetails}
                  warning={missingDetails > 0}
                />
              ) : (
                <LockedHealthRow
                  label="Booking Health"
                />
              )}
            </div>
          </section>

          {canUseBookings ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Top Services
            </h2>

            <div className="mt-5 space-y-3">
              {topServices.length > 0 ? (
                topServices.map((service) => (
                  <div
                    key={service.name}
                    className="rounded-xl bg-slate-800 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-white">
                        {service.name}
                      </p>

                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
                        {service.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No service data yet.
                </p>
              )}
            </div>
          </section>
          ) : (
            <UpgradePanel
              title="Top Services"
              message="Service booking trends are available on the Pro and Business plans."
            />
          )}
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Latest messages and bookings for this business.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ActivityList
            title="Recent Messages"
            items={safeMessages.slice(0, 5).map((message) => ({
              id: message.id,
              title:
                message.role === "assistant"
                  ? "Jhyro AI replied"
                  : "Customer sent a message",
              description: message.message || "Empty message",
              date: message.created_at,
            }))}
          />

          {canUseBookings ? (
            <ActivityList
              title="Recent Bookings"
              items={safeBookings.slice(0, 5).map((booking) => ({
                id: booking.id,
                title: booking.service || "Service not provided",
                description: booking.status || "missing_details",
                date: booking.created_at,
              }))}
            />
          ) : (
            <UpgradePanel
              title="Recent Bookings"
              message="Recent booking activity is available on the Pro and Business plans."
            />
          )}
        </div>
      </section>
    </div>
  )
}

function getTopServices(bookings: any[]) {
  const counts: Record<string, number> = {}

  bookings.forEach((booking) => {
    const service = booking.service || "Unknown Service"
    counts[service] = (counts[service] || 0) + 1
  })

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

function MetricCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string
  value: number
  helper: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {helper}
      </p>
    </div>
  )
}

function ScoreCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  )
}

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-300">
          {label}
        </span>

        <span className="text-slate-500">
          {value} / {total}
        </span>
      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function HealthRow({
  label,
  value,
  warning,
}: {
  label: string
  value: number
  warning?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
      <div className="flex items-center gap-3">
        <div
          className={
            warning
              ? "text-yellow-400"
              : "text-green-400"
          }
        >
          {warning ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        </div>

        <p className="text-sm font-semibold text-slate-300">
          {label}
        </p>
      </div>

      <span className="font-bold text-white">
        {value}
      </span>
    </div>
  )
}

function ActivityList({
  title,
  items,
}: {
  title: string
  items: {
    id: string
    title: string
    description: string
    date?: string | null
  }[]
}) {
  return (
    <div className="rounded-2xl bg-slate-950 p-5">
      <h3 className="font-bold text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-slate-900 p-4"
            >
              <p className="font-semibold text-white">
                {item.title}
              </p>

              <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                {item.description}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {item.date
                  ? new Date(item.date).toLocaleString()
                  : "Unknown date"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No activity yet.
          </p>
        )}
      </div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
      {message}
    </div>
  )
}

function LockedMetricCard({
  title,
  icon,
}: {
  title: string
  icon: ReactNode
}) {
  return (
    <Link
      href="/dashboard/billing"
      className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6 transition hover:border-cyan-400/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-cyan-100">
          {title}
        </p>

        <div className="text-cyan-300">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300">
        <LockKeyhole size={17} />
        Pro feature
      </div>
    </Link>
  )
}

function LockedScoreCard({
  title,
  icon,
}: {
  title: string
  icon: ReactNode
}) {
  return (
    <LockedMetricCard
      title={title}
      icon={icon}
    />
  )
}

function LockedHealthRow({
  label,
}: {
  label: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <p className="text-sm font-semibold text-cyan-100">
        {label}
      </p>

      <div className="flex items-center gap-2 text-cyan-300">
        <LockKeyhole size={17} />
        <span className="text-xs font-bold">
          Pro
        </span>
      </div>
    </div>
  )
}

function UpgradePanel({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
      <LockKeyhole
        size={20}
        className="text-cyan-300"
      />

      <h2 className="mt-4 font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {message}
      </p>

      <Link
        href="/dashboard/billing"
        className="mt-4 inline-flex text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
      >
        Upgrade to Pro
      </Link>
    </section>
  )
}