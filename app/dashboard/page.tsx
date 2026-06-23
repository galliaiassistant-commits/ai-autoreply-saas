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

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

const { data: bookings } = await supabase
  .from("bookings")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(20)

const { data: messages } = await supabase
  .from("messages")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(20)

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Jhyro AI Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Customers</p>
          <h2 className="text-3xl font-bold">
            {customersCount || 0}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Bookings</p>
          <h2 className="text-3xl font-bold">
            {bookingsCount || 0}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Messages</p>
          <h2 className="text-3xl font-bold">
            {messagesCount || 0}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <p className="text-slate-400">Pending Bookings</p>
          <h2 className="text-3xl font-bold">
            {pendingBookingsCount || 0}
          </h2>
        </div>
      </div>

      <div className="mt-10 bg-slate-900 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">
          Customers
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400">
              <th className="py-3">Name</th>
              <th>Phone</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {customers?.map((customer) => (
              <tr
                key={customer.id}
                className="border-t border-slate-800"
              >
                <td className="py-3">
                  {customer.name || "Unknown"}
                </td>

                <td>{customer.phone_number}</td>

                <td>
                  {new Date(
                    customer.created_at
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

<div className="mt-10 bg-slate-900 p-6 rounded-2xl">
  <h2 className="text-2xl font-bold mb-4">
    Bookings
  </h2>

  <table className="w-full text-left">
    <thead>
      <tr className="text-slate-400">
        <th>Service</th>
        <th>Date/Time</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {bookings?.map((booking) => (
        <tr
          key={booking.id}
          className="border-t border-slate-800"
        >
          <td className="py-3">
            {booking.service || "Unknown"}
          </td>

          <td>
            {booking.booking_time || "Not set"}
          </td>

          <td>
            {booking.status}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </main>
  )
}