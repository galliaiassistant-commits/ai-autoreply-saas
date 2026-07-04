"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Booking } from "./types"
import StatusBadge from "./StatusBadge"

export default function BookingSidePanel({
  booking,
  businessId,
  onClose,
}: {
  booking: Booking | null
  businessId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [newDateTime, setNewDateTime] = useState("")

  if (!booking) return null

  if (booking.business_id !== businessId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/40 bg-slate-900 p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">
            Access blocked
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            This booking does not belong to the current business.
          </p>

          <button
            onClick={onClose}
            className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const date = booking.booking_time
    ? new Date(booking.booking_time)
    : null

  async function cancelBooking() {
    if (!booking) return
    if (!confirm("Cancel this booking?")) return

    setLoading(true)

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("id", booking.id)
      .eq("business_id", businessId)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onClose()
    router.refresh()
  }

  async function markCompleted() {
    if (!booking) return

    setLoading(true)

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "completed",
      })
      .eq("id", booking.id)
      .eq("business_id", businessId)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onClose()
    router.refresh()
  }

  async function saveReschedule() {
    if (!booking) return

    if (!newDateTime) {
      alert("Please choose a new date and time.")
      return
    }

    const newTime = new Date(newDateTime).toISOString()

    setLoading(true)

    const { data: conflict, error: conflictError } =
      await supabase
        .from("bookings")
        .select("id")
        .eq("business_id", businessId)
        .eq("booking_time", newTime)
        .eq("status", "booked")
        .neq("id", booking.id)
        .maybeSingle()

    if (conflictError) {
      setLoading(false)
      alert(conflictError.message)
      return
    }

    if (conflict) {
      setLoading(false)
      alert("That time is already booked.")
      return
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        booking_time: newTime,
        status: "booked",
      })
      .eq("id", booking.id)
      .eq("business_id", businessId)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setRescheduling(false)
    setNewDateTime("")
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Booking Details
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Detail
            label="Service"
            value={booking.service || "Unknown service"}
          />

          <Detail
            label="Date"
            value={
              date
                ? date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Not scheduled"
            }
          />

          <Detail
            label="Time"
            value={
              date
                ? date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Not scheduled"
            }
          />

          <div>
            <p className="text-sm text-slate-400">
              Status
            </p>

            <div className="mt-2">
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        {rescheduling && (
          <div className="mt-6 rounded-xl bg-slate-800 p-4">
            <label className="block text-sm text-slate-400">
              New date and time
            </label>

            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(event) => setNewDateTime(event.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-900 p-3 text-white outline-none"
            />

            <button
              onClick={saveReschedule}
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save New Time"}
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-3">
          <button
            onClick={() => setRescheduling(!rescheduling)}
            disabled={loading}
            className="w-full rounded-xl border border-blue-500 px-4 py-3 font-semibold text-blue-400 hover:bg-blue-500/10 disabled:opacity-50"
          >
            {rescheduling ? "Close Reschedule" : "Reschedule"}
          </button>

          <button
            onClick={markCompleted}
            disabled={loading || booking.status === "completed"}
            className="w-full rounded-xl border border-green-500 px-4 py-3 font-semibold text-green-400 hover:bg-green-500/10 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Mark Completed"}
          </button>

          <button
            onClick={cancelBooking}
            disabled={loading || booking.status === "cancelled"}
            className="w-full rounded-xl border border-red-500 px-4 py-3 font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-white">
        {value}
      </p>
    </div>
  )
}