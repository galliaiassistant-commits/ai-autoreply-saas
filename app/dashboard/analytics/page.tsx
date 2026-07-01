import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatCard } from "@/components/dashboard/StatCard"
import {
  Users,
  CalendarDays,
  MessageSquare,
  Brain,
} from "lucide-react"

export default async function AnalyticsPage() {
  const [
    { count: customerCount },
    { count: bookingCount },
    { count: messageCount },
    { count: memoryCount },
    { data: recentBookings },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("customer_memory").select("*", { count: "exact", head: true }),

    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const assistantMessages =
    recentMessages?.filter((msg) => msg.role === "assistant").length || 0

  const userMessages =
    recentMessages?.filter((msg) => msg.role === "user").length || 0

  const pendingBookings =
    recentBookings?.filter((booking) => booking.status === "pending").length || 0

  const confirmedBookings =
    recentBookings?.filter((booking) => booking.status === "confirmed").length || 0

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track your AI assistant's performance, bookings, and customer activity."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Customers" value={`${customerCount ?? 0}`} subtitle="Total customers" icon={<Users size={20} />} />
        <StatCard title="Bookings" value={`${bookingCount ?? 0}`} subtitle="Total bookings" icon={<CalendarDays size={20} />} />
        <StatCard title="Messages" value={`${messageCount ?? 0}`} subtitle="Messages exchanged" icon={<MessageSquare size={20} />} />
        <StatCard title="Memory" value={`${memoryCount ?? 0}`} subtitle="Memory entries" icon={<Brain size={20} />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AnalyticsCard title="Message Activity">
          <MetricRow label="Customer Messages" value={userMessages} />
          <MetricRow label="AI Replies" value={assistantMessages} />
          <MetricRow
            label="AI Reply Share"
            value={
              recentMessages && recentMessages.length > 0
                ? `${Math.round((assistantMessages / recentMessages.length) * 100)}%`
                : "0%"
            }
          />
        </AnalyticsCard>

        <AnalyticsCard title="Booking Activity">
          <MetricRow label="Pending Bookings" value={pendingBookings} />
          <MetricRow label="Confirmed Bookings" value={confirmedBookings} />
          <MetricRow label="Recent Bookings Tracked" value={recentBookings?.length || 0} />
        </AnalyticsCard>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-bold text-white">
          Recent AI Activity
        </h2>

        <div className="mt-4 space-y-3">
          {recentMessages?.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl bg-slate-800 p-4"
            >
              <div className="mb-1 text-xs uppercase text-slate-500">
                {msg.role}
              </div>

              <p className="line-clamp-2 text-sm text-slate-200">
                {msg.message}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalyticsCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-bold text-white">
        {title}
      </h2>

      <div className="space-y-3">
        {children}
      </div>
    </section>
  )
}

function MetricRow({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
      <span className="text-slate-300">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  )
}