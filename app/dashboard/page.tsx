import Link from "next/link"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentBusiness } from "@/lib/auth"
import {
  CalendarDays,
  Users,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Brain,
  ArrowRight,
  Activity,
} from "lucide-react"

export default async function DashboardPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome to Jhyro AI
          </h1>

          <p className="mt-3 text-slate-400">
            No business was found for this account. Complete onboarding first.
          </p>

          <Link
            href="/onboarding"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
          >
            Start Onboarding
          </Link>
        </div>
      </div>
    )
  }

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

    supabase
      .from("bookings")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("messages")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_services")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),

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

  const connectedIntegrations = safeIntegrations.filter(
    (integration) => integration.connected
  ).length

  const recentBookings = safeBookings.slice(0, 5)
  const recentMessages = safeMessages.slice(0, 5)
  const recentCustomers = safeCustomers.slice(0, 5)

  return (
    <div>
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Jhyro AI Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Welcome back, {business.name || business.business_name || "Business"}
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Monitor your customers, bookings, messages, services, and integrations from one secure dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <Activity size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  System Status
                </p>

                <p className="font-bold text-green-400">
                  Running
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Customers"
          value={safeCustomers.length}
          icon={<Users size={20} />}
          href="/dashboard/customers"
        />

        <StatCard
          title="Bookings"
          value={safeBookings.length}
          icon={<CalendarDays size={20} />}
          href="/dashboard/bookings"
        />

        <StatCard
          title="Messages"
          value={safeMessages.length}
          icon={<MessageCircle size={20} />}
          href="/dashboard/conversations"
        />

        <StatCard
          title="Integrations"
          value={connectedIntegrations}
          icon={<Activity size={20} />}
          href="/dashboard/integrations"
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <MiniStat
          title="Booked"
          value={bookedBookings}
          icon={<CheckCircle2 size={18} />}
        />

        <MiniStat
          title="Completed"
          value={completedBookings}
          icon={<CheckCircle2 size={18} />}
        />

        <MiniStat
          title="Missing Details"
          value={missingDetails}
          icon={<AlertCircle size={18} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <SectionHeader
            title="Recent Bookings"
            href="/dashboard/bookings"
          />

          <div className="mt-6 space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-slate-800 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {booking.service || "Service not provided"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {booking.booking_time
                          ? new Date(booking.booking_time).toLocaleString()
                          : "Missing date and time"}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
                      {booking.status || "missing_details"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No bookings yet." />
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeader
              title="Recent Customers"
              href="/dashboard/customers"
            />

            <div className="mt-5 space-y-3">
              {recentCustomers.length > 0 ? (
                recentCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/dashboard/conversations/${customer.id}`}
                    className="block rounded-xl bg-slate-800 p-4 transition hover:bg-slate-700"
                  >
                    <p className="font-semibold text-white">
                      {customer.name || "Unknown Customer"}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {customer.phone_number || "No phone number"}
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyState message="No customers yet." />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeader
              title="Active Services"
              href="/dashboard/business"
            />

            <div className="mt-5 space-y-3">
              {safeServices.length > 0 ? (
                safeServices.slice(0, 5).map((service) => (
                  <div
                    key={service.id}
                    className="rounded-xl bg-slate-800 p-4"
                  >
                    <p className="font-semibold text-white">
                      {service.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {service.duration_minutes || 30} minutes
                      {service.price ? ` • $${service.price}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState message="No active services yet." />
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <SectionHeader
          title="Recent Messages"
          href="/dashboard/conversations"
        />

        <div className="mt-6 space-y-4">
          {recentMessages.length > 0 ? (
            recentMessages.map((message) => (
              <div
                key={message.id}
                className="rounded-2xl bg-slate-800 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">
                      {message.role === "assistant"
                        ? "Jhyro AI"
                        : "Customer"}
                    </p>

                    <p className="mt-2 max-w-4xl text-sm leading-relaxed text-white">
                      {message.message || "Empty message"}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500">
                    {message.created_at
                      ? new Date(message.created_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No messages yet." />
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string
  value: number
  icon: ReactNode
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700 hover:bg-slate-800"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
        View
        <ArrowRight size={15} />
      </div>
    </Link>
  )
}

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function SectionHeader({
  title,
  href,
}: {
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
      >
        View all
        <ArrowRight size={15} />
      </Link>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
      {message}
    </div>
  )
}