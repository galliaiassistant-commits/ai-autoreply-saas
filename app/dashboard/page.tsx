import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import {
  Users,
  CalendarDays,
  MessageSquare,
  Clock,
  Brain,
  Zap,
} from "lucide-react"

export default async function DashboardPage() {
  const { count: customersCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })

  const { count: messagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })

  const { count: pendingBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { data: recentCustomers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentBookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentMessages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div>
      <PageHeader
        title="Jhyro AI Dashboard"
        description="Monitor customers, bookings, messages, and AI activity."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Customers" value={`${customersCount || 0}`} subtitle="Total customers" icon={<Users size={20} />} />
        <StatCard title="Bookings" value={`${bookingsCount || 0}`} subtitle="Total bookings" icon={<CalendarDays size={20} />} />
        <StatCard title="Messages" value={`${messagesCount || 0}`} subtitle="Total messages" icon={<MessageSquare size={20} />} />
        <StatCard title="Pending" value={`${pendingBookingsCount || 0}`} subtitle="Need attention" icon={<Clock size={20} />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/dashboard/ai/knowledge/new" icon="🧠" label="Add Knowledge" />
            <QuickLink href="/dashboard/ai/personality" icon="🤖" label="Edit Personality" />
            <QuickLink href="/dashboard/ai/actions" icon="⚡" label="AI Actions" />
            <QuickLink href="/dashboard/business" icon="🏢" label="Business Settings" />
          </div>
        </DashboardCard>

        <DashboardCard title="AI Status">
          <div className="space-y-4">
            <StatusRow icon={<Brain size={18} />} label="Knowledge Base" value="Active" />
            <StatusRow icon={<Zap size={18} />} label="AI Actions" value="Configured" />
            <StatusRow icon={<MessageSquare size={18} />} label="WhatsApp AI" value="Connected" />
          </div>
        </DashboardCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <DashboardCard title="Recent Customers">
          <div className="space-y-3">
            {recentCustomers?.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className="block rounded-xl bg-slate-800 p-4 hover:bg-slate-700"
              >
                <p className="font-semibold text-white">{customer.name || "Unknown"}</p>
                <p className="text-sm text-slate-400">{customer.phone_number}</p>
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Bookings">
          <div className="space-y-3">
            {recentBookings?.map((booking) => (
              <div key={booking.id} className="rounded-xl bg-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{booking.service || "Unknown service"}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {booking.booking_time
                    ? new Date(booking.booking_time).toLocaleString()
                    : "Not scheduled"}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Messages">
          <div className="space-y-3">
            {recentMessages?.map((msg) => (
              <div key={msg.id} className="rounded-xl bg-slate-800 p-4">
                <p className="text-xs uppercase text-slate-500">{msg.role}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-200">{msg.message}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  )
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl bg-slate-800 p-4 text-white hover:bg-slate-700"
    >
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 font-semibold">{label}</p>
    </Link>
  )
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-slate-300">{label}</span>
      </div>
      <span className="text-sm font-semibold text-green-400">{value}</span>
    </div>
  )
}