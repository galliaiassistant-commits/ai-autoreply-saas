"use client"

import { useState } from "react"
import { saveBusinessHours } from "./actions"

type DaySchedule = {
  day: string
  openTime: string
  closeTime: string
  closed: boolean
}

const defaultHours: DaySchedule[] = [
  {
    day: "Monday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: false,
  },
  {
    day: "Tuesday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: false,
  },
  {
    day: "Wednesday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: false,
  },
  {
    day: "Thursday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: false,
  },
  {
    day: "Friday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: false,
  },
  {
    day: "Saturday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: false,
  },
  {
    day: "Sunday",
    openTime: "09:00",
    closeTime: "18:00",
    closed: true,
  },
]

export default function BusinessHours({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [hours, setHours] =
    useState<DaySchedule[]>(defaultHours)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  function updateDay(
    index: number,
    field: keyof DaySchedule,
    value: string | boolean
  ) {
    const updated = [...hours]

    updated[index] = {
      ...updated[index],
      [field]: value,
    }

    setHours(updated)
  }


  function validate() {
    const openDays =
      hours.filter(
        (day) => !day.closed
      )

    if (openDays.length === 0) {
      return "Your business must have at least one open day."
    }


    for (const day of openDays) {

      if (
        !day.openTime ||
        !day.closeTime
      ) {
        return `${day.day} needs opening and closing times.`
      }


      if (
        day.closeTime <=
        day.openTime
      ) {
        return `${day.day} closing time must be after opening time.`
      }

    }


    return ""
  }


  async function save() {

    const validation =
      validate()

    if (validation) {
      setError(validation)
      return
    }


    setError("")
    setLoading(true)


    const result =
      await saveBusinessHours({
        hours,
      })


    setLoading(false)


    if (!result.ok) {
  setError(
    result.error ??
      "Failed to save business hours."
  )
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
        Set when your AI receptionist is available.
      </p>


      {error && (
        <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}


      <div className="mt-8 space-y-4">

        {hours.map(
          (day, index) => (

            <div
              key={day.day}
              className="rounded-2xl bg-slate-800 p-5"
            >

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">


                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={!day.closed}
                    onChange={(e)=>
                      updateDay(
                        index,
                        "closed",
                        !e.target.checked
                      )
                    }
                    className="h-5 w-5 accent-white"
                  />

                  <span className="font-semibold text-white">
                    {day.day}
                  </span>

                </div>



                {!day.closed && (

                  <div className="grid gap-3 sm:grid-cols-2">

                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e)=>
                        updateDay(
                          index,
                          "openTime",
                          e.target.value
                        )
                      }
                      className="rounded-xl bg-slate-900 p-3 text-white outline-none"
                    />


                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e)=>
                        updateDay(
                          index,
                          "closeTime",
                          e.target.value
                        )
                      }
                      className="rounded-xl bg-slate-900 p-3 text-white outline-none"
                    />

                  </div>

                )}


                {day.closed && (
                  <span className="text-sm text-slate-500">
                    Closed
                  </span>
                )}

              </div>

            </div>

          )
        )}

      </div>



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
          {loading
            ? "Saving..."
            : "Continue"}
        </button>

      </div>


    </section>
  )
}