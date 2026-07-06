import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import BookingActions from "../BookingActions"
import BookingCalendar from "@/components/calendar/BookingCalendar"
import {
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default async function BookingsPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Bookings"
          description="View and manage customer appointment requests."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No business found for this account.
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const [
    { data: bookings, error: bookingsError },
    { data: services, error: servicesError },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_services")
      .select("*")
      .eq("business_id", business.id)
      .order("name", { ascending: true }),
  ])

  if (bookingsError) {
    console.error("BOOKINGS PAGE BOOKINGS ERROR:", bookingsError)
  }

  if (servicesError) {
    console.error("BOOKINGS PAGE SERVICES ERROR:", servicesError)
  }

  const safeBookings = bookings || []
  const safeServices = services || []

  const totalBookings = safeBookings.length

  const bookedBookings =
    safeBookings.filter((booking) => booking.status === "booked")
      .length

  const completedBookings =
    safeBookings.filter((booking) => booking.status === "completed")
      .length

  const missingDetails =
    safeBookings.filter(
      (booking) => booking.status === "missing_details"
    ).length

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage customer appointment requests."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BookingStat
          title="Total"
          value={totalBookings}
          icon={<CalendarDays size={20} />}
        />

        <BookingStat
          title="Booked"
          value={bookedBookings}
          icon={<CalendarDays size={20} />}
        />

        <BookingStat
          title="Completed"
          value={completedBookings}
          icon={<CheckCircle2 size={20} />}
        />

        <BookingStat
          title="Missing Details"
          value={missingDetails}
          icon={<AlertCircle size={20} />}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Recent Bookings
        </h2>

        <div className="mt-6 space-y-4">
          {safeBookings.length > 0 ? (
            safeBookings.map((booking) => (
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
                        ? new Date(
                            booking.booking_time
                          ).toLocaleString()
                        : "Missing date and time"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Created{" "}
                      {booking.created_at
                        ? new Date(
                            booking.created_at
                          ).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge
                      status={booking.status || "missing_details"}
                    />

                    <BookingActions
                      bookingId={booking.id}
                      businessId={business.id}
                      status={booking.status}
                    />
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

      <BookingCalendar
        bookings={safeBookings}
        services={safeServices}
        businessId={business.id}
      />
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
    </div>
  )
}