import { supabase } from "@/lib/supabase"

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: customerId } = await params

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .maybeSingle()

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })

  const { data: memories } = await supabase
    .from("customer_memory")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">
        {customer?.name || "Unknown Customer"}
      </h1>

      <p className="text-slate-400 mb-8">
        {customer?.phone_number}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Bookings</h2>
          {bookings?.map((booking) => (
            <div key={booking.id} className="border-t border-slate-800 py-3">
              <p>{booking.service || "Unknown service"}</p>
              <p className="text-slate-400">{booking.booking_time || "No time set"}</p>
              <p>{booking.status}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Memory</h2>
          {memories?.map((memory) => (
            <div key={memory.id} className="border-t border-slate-800 py-3">
              <p className="text-slate-400">{memory.type}</p>
              <p>{memory.content}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          {messages?.map((msg) => (
            <div key={msg.id} className="border-t border-slate-800 py-3">
              <p className="text-slate-400">{msg.role}</p>
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}