import { supabase } from "@/lib/supabase"
import Link from "next/link"
import BookingActions from "./BookingActions"

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

const { data: recentMessages } = await supabase
  .from("messages")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(20)

const { data: memories } = await supabase
  .from("customer_memory")
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
    <th>Service</th>
    <th>Date/Time</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>

          <tbody>
            {customers?.map((customer) => (
              <tr
                key={customer.id}
                className="border-t border-slate-800"
              >
                <td className="py-3">
  <Link
    href={`/dashboard/customers/${customer.id}`}
    className="text-blue-400 hover:text-blue-300"
  >
    {customer.name || "Unknown"}
  </Link>
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
  <span
    className={`px-3 py-1 rounded-full text-sm ${
      booking.status === "pending"
        ? "bg-yellow-600"
        : booking.status === "confirmed"
        ? "bg-blue-600"
        : booking.status === "completed"
        ? "bg-green-600"
        : "bg-red-600"
    }`}
  >
    {booking.status}
  </span>
</td>

          <td>
            {booking.status}
          </td>
          <td>
  <BookingActions bookingId={booking.id} />
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="mt-10 bg-slate-900 p-6 rounded-2xl">
  <h2 className="text-2xl font-bold mb-4">
    Recent Messages
  </h2>

  <table className="w-full text-left">
    <thead>
      <tr className="text-slate-400">
        <th>Role</th>
        <th>Message</th>
        <th>Time</th>
      </tr>
    </thead>

    <tbody>
      {recentMessages?.map((msg) => (
        <tr
          key={msg.id}
          className="border-t border-slate-800"
        >
          <td className="py-3">
            {msg.role}
          </td>

          <td>
            {msg.message}
          </td>

          <td>
            {new Date(
              msg.created_at
            ).toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="mt-10 bg-slate-900 p-6 rounded-2xl">
  <h2 className="text-2xl font-bold mb-4">
    Customer Memory
  </h2>

  <table className="w-full text-left">
    <thead>
      <tr className="text-slate-400">
        <th>Type</th>
        <th>Memory</th>
        <th>Confidence</th>
      </tr>
    </thead>

    <tbody>
      {memories?.map((memory) => (
        <tr
          key={memory.id}
          className="border-t border-slate-800"
        >
          <td className="py-3">
            {memory.type}
          </td>

          <td>
            {memory.content}
          </td>

          <td>
            {memory.confidence}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </main>
  )
}