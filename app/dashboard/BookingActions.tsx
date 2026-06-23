"use client"

import { supabase } from "@/lib/supabase"

type Props = {
  bookingId: string
}

export default function BookingActions({ bookingId }: Props) {
  async function updateStatus(status: string) {

console.log("BOOKING ID:", bookingId)

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
    if (error) {
      alert(error.message)
      return
    }

    alert(`Updated to ${status}`)
window.location.reload()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus("confirmed")}
        className="bg-blue-600 px-3 py-1 rounded text-sm"
      >
        Confirm
      </button>

      <button
        onClick={() => updateStatus("completed")}
        className="bg-green-600 px-3 py-1 rounded text-sm"
      >
        Complete
      </button>

      <button
        onClick={() => updateStatus("cancelled")}
        className="bg-red-600 px-3 py-1 rounded text-sm"
      >
        Cancel
      </button>
    </div>
  )
}