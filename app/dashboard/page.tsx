import { supabase } from "@/lib/supabase"

export default async function HomePage() {
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

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Jhyro AI Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Customers</p>
          <h2 className="text-3xl font-bold">{customersCount || 0}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Bookings</p>
          <h2 className="text-3xl font-bold">{bookingsCount || 0}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Messages</p>
          <h2 className="text-3xl font-bold">{messagesCount || 0}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Pending Bookings</p>
          <h2 className="text-3xl font-bold">{pendingBookingsCount || 0}</h2>
        </div>
      </div>
    </main>
  )
}