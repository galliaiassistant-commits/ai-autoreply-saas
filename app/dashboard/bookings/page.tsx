import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DataTable } from "@/components/dashboard/DataTable"

export default async function BookingsPage() {
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage customer appointments."
      />

      <DataTable title="Bookings">
        <thead>
          <tr className="text-slate-400">
            <th>Service</th>
            <th>Booking Time</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {bookings?.map((booking) => (
            <tr
              key={booking.id}
              className="border-t border-slate-800"
            >
              <td className="py-3">
                {booking.service || "Not provided"}
              </td>

              <td>
                {booking.booking_time || "Missing time"}
              </td>

              <td>
                {booking.status || "pending"}
              </td>

              <td>
                {booking.created_at
                  ? new Date(booking.created_at).toLocaleDateString()
                  : "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}