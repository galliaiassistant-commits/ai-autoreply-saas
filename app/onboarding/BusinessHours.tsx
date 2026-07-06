"use client"

import { useState } from "react"
import { saveBusinessHours } from "./actions"

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

    const result = await saveBusinessHours({
      openTime,
      closeTime,
      closedSunday,
    })

    setLoading(false)

    if (!result.ok) {
      alert(result.error)
      return
    }

    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold text-white">
        Business Hours
      </h2>

      <p className="mt-2 text-slate-400">
        Set your default opening hours.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-sm text-slate-400">
            Opening Time
          </span>

          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
          />
        </label>

        <label>
          <span className="text-sm text-slate-400">
            Closing Time
          </span>

          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
          />
        </label>
      </div>

      <label className="mt-6 flex items-center gap-3 rounded-xl bg-slate-800 p-4 text-white">
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
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="button"
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