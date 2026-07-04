import { Booking } from "./types"
import StatusBadge from "./StatusBadge"

export default function BookingCard({
  booking,
  onSelect,
  compact = false,
}: {
  booking: Booking
  onSelect: (booking: Booking) => void
  compact?: boolean
}) {
  const date = booking.booking_time ? new Date(booking.booking_time) : null

  return (
    <button
      onClick={() => onSelect(booking)}
      className="w-full rounded-xl bg-blue-500/20 p-3 text-left transition hover:bg-blue-500/30"
    >
      <p className="truncate font-semibold text-blue-300">
        {booking.service || "Booking"}
      </p>

      {date && (
        <p className="mt-1 text-xs text-slate-300">
          {date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}

      {!compact && (
        <div className="mt-3">
          <StatusBadge status={booking.status} />
        </div>
      )}
    </button>
  )
}