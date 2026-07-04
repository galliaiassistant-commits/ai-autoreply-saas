import { Booking, CalendarView } from "./types"
import BookingCard from "./BookingCard"

function getWeekDays() {
  const today = new Date()

  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(today)
    day.setDate(today.getDate() + index)
    return day
  })
}

function getTimeSlots() {
  const slots: string[] = []

  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`)
    if (hour !== 18) {
      slots.push(`${String(hour).padStart(2, "0")}:30`)
    }
  }

  return slots
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function sameSlot(bookingTime: string, day: Date, time: string) {
  const date = new Date(bookingTime)
  const [hour, minute] = time.split(":").map(Number)

  return (
    sameDay(date, day) &&
    date.getHours() === hour &&
    date.getMinutes() === minute
  )
}

export default function BookingGrid({
  bookings,
  view,
  onSelect,
  onEmptySlot,
}: {
  bookings: Booking[]
  view: CalendarView
  onSelect: (booking: Booking) => void
  onEmptySlot: (date: Date) => void
}) {
  if (view === "month") {
    return (
      <MonthGrid
        bookings={bookings}
        onSelect={onSelect}
      />
    )
  }

  const days = view === "day" ? [new Date()] : getWeekDays()
  const slots = getTimeSlots()

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[900px] gap-px rounded-2xl bg-slate-800 p-px"
        style={{
          gridTemplateColumns: `90px repeat(${days.length}, minmax(150px, 1fr))`,
        }}
      >
        <div className="bg-slate-950 p-3 text-sm font-semibold text-slate-400">
          Time
        </div>

        {days.map((day) => (
          <div
            key={day.toDateString()}
            className="bg-slate-950 p-3 text-center"
          >
            <p className="font-semibold text-white">
              {day.toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>

            <p className="text-xs text-slate-500">
              {day.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        ))}

        {slots.map((slot) => {
          return (
            <div key={slot} className="contents">
              <div className="bg-slate-950 p-3 text-sm text-slate-500">
                {slot}
              </div>

              {days.map((day) => {
                const booking = bookings.find(
                  (item) =>
                    item.booking_time &&
                    item.status !== "cancelled" &&
                    sameSlot(item.booking_time, day, slot)
                )

                const [hour, minute] = slot.split(":").map(Number)
                const slotDate = new Date(day)
                slotDate.setHours(hour, minute, 0, 0)

                return (
                  <div
                    key={`${day.toDateString()}-${slot}`}
                    className="min-h-20 bg-slate-950 p-2"
                  >
                    {booking ? (
                      <BookingCard
                        booking={booking}
                        onSelect={onSelect}
                        compact
                      />
                    ) : (
                      <button
                        onClick={() => onEmptySlot(slotDate)}
                        className="h-full w-full rounded-xl border border-dashed border-slate-800 text-xs text-slate-600 hover:border-slate-600 hover:text-slate-400"
                      >
                        +
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthGrid({
  bookings,
  onSelect,
}: {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
}) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = Array.from({ length: daysInMonth }).map(
    (_, index) => new Date(year, month, index + 1)
  )

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
      {days.map((day) => {
        const dayBookings = bookings.filter(
          (booking) =>
            booking.booking_time &&
            new Date(booking.booking_time).toDateString() ===
              day.toDateString() &&
            booking.status !== "cancelled"
        )

        return (
          <div
            key={day.toDateString()}
            className="min-h-32 rounded-2xl bg-slate-950 p-3"
          >
            <p className="text-sm font-semibold text-white">
              {day.getDate()}
            </p>

            <p className="text-xs text-slate-500">
              {day.toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>

            <div className="mt-3 space-y-2">
              {dayBookings.slice(0, 3).map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => onSelect(booking)}
                  className="block w-full rounded-lg bg-blue-500/20 px-2 py-1 text-left text-xs font-semibold text-blue-400 hover:bg-blue-500/30"
                >
                  {booking.service || "Booking"}
                </button>
              ))}

              {dayBookings.length > 3 && (
                <p className="text-xs text-slate-500">
                  +{dayBookings.length - 3} more
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}