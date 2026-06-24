"use client"

import { supabase } from "@/lib/supabase"

type Props = {
  bookingId: string
}

export default function BookingActions({ bookingId }: Props) {
  async function updateStatus(status: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)

    if (error) {
      alert("Error: " + error.message)
      return
    }

    window.location.reload()
  }

  return (
    <div className="flex gap-2 relative z-10">
      <button
  onClick={() => updateStatus("confirmed")}
  className="bg-blue-600 px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-700"
>
  Confirm
</button>

      <button
  onClick={() => updateStatus("confirmed")}
  className="bg-blue-600 px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-700"
>
  Complete
</button>

      <button
  onClick={() => updateStatus("confirmed")}
  className="bg-blue-600 px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-700"
>
  Cancel
</button>
    </div>
  )
}