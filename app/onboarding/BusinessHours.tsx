"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export default function BusinessHours({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("18:00")
  const [closedSunday, setClosedSunday] = useState(true)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      alert("You must be signed in.")
      return
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (!business) {
      setLoading(false)
      alert("Business not found.")
      return
    }

    await supabase
      .from("business_availability")
      .delete()
      .eq("business_id", business.id)

    const rows = days.map((day) => ({
      business_id: business.id,
      day_of_week: day,
      open_time: day === "Sunday" && closedSunday ? null : openTime,
      close_time: day === "Sunday" && closedSunday ? null : closeTime,
      is_closed: day === "Sunday" && closedSunday,
      slot_duration: 30,
    }))

    const { error } = await supabase
      .from("business_availability")
      .insert(rows)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold">Business Hours</h2>
      <p className="mt-2 text-slate-400">
        Set your default opening hours.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-sm text-slate-400">Opening Time</span>
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
          />
        </label>

        <label>
          <span className="text-sm text-slate-400">Closing Time</span>
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
          />
        </label>
      </div>

      <label className="mt-6 flex items-center gap-3 rounded-xl bg-slate-800 p-4">
        <input
          type="checkbox"
          checked={closedSunday}
          onChange={(e) => setClosedSunday(e.target.checked)}
          className="accent-white"
        />
        <span>Closed on Sundays</span>
      </label>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>

        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  )
}