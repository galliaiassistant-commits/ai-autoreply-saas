"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  bookingId: string
}

export default function BookingActions({ bookingId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
      return
    }

    if (!data || data.length === 0) {
      alert("No booking was updated.")
      return
    }

    alert("Booking updated.")
    router.refresh()
  }

  return (
    <div className="flex gap-2 relative z-50">
      <button type="button" disabled={loading} onClick={() => updateStatus("confirmed")} className="bg-blue-600 px-3 py-1 rounded text-sm">
        Confirm
      </button>

      <button type="button" disabled={loading} onClick={() => updateStatus("completed")} className="bg-green-600 px-3 py-1 rounded text-sm">
        Complete
      </button>

      <button type="button" disabled={loading} onClick={() => updateStatus("cancelled")} className="bg-red-600 px-3 py-1 rounded text-sm">
        Cancel
      </button>
    </div>
  )
}