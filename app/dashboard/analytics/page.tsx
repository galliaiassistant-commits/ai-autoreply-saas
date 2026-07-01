import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatCard } from "@/components/dashboard/StatCard"

export default async function AnalyticsPage() {
  const [
    { count: customerCount },
    { count: bookingCount },
    { count: messageCount },
    { count: memoryCount },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("messages")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("customer_memory")
      .select("*", { count: "exact", head: true }),
  ])

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track your AI assistant's performance."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Customers"
          value={customerCount ?? 0}
          subtitle="Total customers"
        />

        <StatCard
          title="Bookings"
          value={bookingCount ?? 0}
          subtitle="Total bookings"
        />

        <StatCard
          title="Messages"
          value={messageCount ?? 0}
          subtitle="Messages exchanged"
        />

        <StatCard
          title="Memory"
          value={memoryCount ?? 0}
          subtitle="Memory entries"
        />
      </div>
    </div>
  )
}