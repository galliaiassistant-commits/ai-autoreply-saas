import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import BookingActions from "../BookingActions"
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default async function BookingsPage() {
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  const totalBookings = bookings?.length || 0
  const pendingBookings =
    bookings?.filter((b) => b.status === "pending").length || 0
  const confirmedBookings =
    bookings?.filter((b) => b.status === "confirmed").length || 0
  const missingDetails =
    bookings?.filter((b) => b.status === "missing_details").length || 0

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage customer appointment requests."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BookingStat title="Total" value={totalBookings} icon={<CalendarDays size={20} />} />
        <BookingStat title="Pending" value={pendingBookings} icon={<Clock size={20} />} />
        <BookingStat title="Confirmed" value={confirmedBookings} icon={<CheckCircle2 size={20} />} />
        <BookingStat title="Missing Details" value={missingDetails} icon={<AlertCircle size={20} />} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Recent Bookings
        </h2>

        <div className="mt-6 space-y-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl bg-slate-800 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {booking.service || "Service not provided"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {booking.booking_time
                        ? new Date(booking.booking_time).toLocaleString()
                        : "Missing date and time"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Created{" "}
                      {booking.created_at
                        ? new Date(booking.created_at).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={booking.status || "pending"} />

                    <BookingActions bookingId={booking.id} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No bookings yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingStat({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
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
    </div>
  )
}