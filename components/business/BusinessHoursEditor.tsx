"use client"

import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  XCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

type AvailabilityRow = {
  id?: string
  business_id?: string
  day_of_week?: string | number | null
  open_time?: string | null
  close_time?: string | null
  is_closed?: boolean | null
  slot_duration?: number | null
}

type DaySchedule = {
  key: string
  label: string
  databaseValue: string
  openTime: string
  closeTime: string
  isClosed: boolean
  slotDuration: number
  existingId?: string
}

const DAYS = [
  {
    key: "monday",
    label: "Monday",
    databaseValue: "Monday",
  },
  {
    key: "tuesday",
    label: "Tuesday",
    databaseValue: "Tuesday",
  },
  {
    key: "wednesday",
    label: "Wednesday",
    databaseValue: "Wednesday",
  },
  {
    key: "thursday",
    label: "Thursday",
    databaseValue: "Thursday",
  },
  {
    key: "friday",
    label: "Friday",
    databaseValue: "Friday",
  },
  {
    key: "saturday",
    label: "Saturday",
    databaseValue: "Saturday",
  },
  {
    key: "sunday",
    label: "Sunday",
    databaseValue: "Sunday",
  },
]

function normalizeDayValue(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()

  const numericMap: Record<string, string> = {
    "0": "sunday",
    "1": "monday",
    "2": "tuesday",
    "3": "wednesday",
    "4": "thursday",
    "5": "friday",
    "6": "saturday",
  }

  return numericMap[text] || text
}

function normalizeTime(value: string | null | undefined) {
  if (!value) return ""

  const match = value.match(/^(\d{2}:\d{2})/)

  return match?.[1] || value
}

function buildInitialSchedule(
  availability: AvailabilityRow[]
): DaySchedule[] {
  return DAYS.map((day) => {
    const existing = availability.find(
      (item) =>
        normalizeDayValue(item.day_of_week) === day.key
    )

    return {
      ...day,
      openTime:
        normalizeTime(existing?.open_time) || "09:00",
      closeTime:
        normalizeTime(existing?.close_time) || "17:00",
      isClosed: existing?.is_closed ?? false,
      slotDuration:
        existing?.slot_duration || 30,
      existingId: existing?.id,
    }
  })
}

export default function BusinessHoursEditor({
  businessId,
  availability,
}: {
  businessId: string
  availability: AvailabilityRow[]
}) {
  const initialSchedule = useMemo(
    () => buildInitialSchedule(availability),
    [availability]
  )

  const [schedule, setSchedule] =
    useState<DaySchedule[]>(initialSchedule)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  function updateDay(
    key: string,
    changes: Partial<DaySchedule>
  ) {
    setSchedule((current) =>
      current.map((day) =>
        day.key === key
          ? {
              ...day,
              ...changes,
            }
          : day
      )
    )

    setMessage(null)
  }

  async function saveHours() {
    setSaving(true)
    setMessage(null)

    try {
      for (const day of schedule) {
        if (
          !day.isClosed &&
          (!day.openTime || !day.closeTime)
        ) {
          throw new Error(
            `${day.label} needs both an opening and closing time.`
          )
        }

        if (
          !day.isClosed &&
          day.openTime >= day.closeTime
        ) {
          throw new Error(
            `${day.label}'s closing time must be after its opening time.`
          )
        }

        const row = {
          business_id: businessId,
          day_of_week: day.databaseValue,
          open_time: day.isClosed
            ? null
            : day.openTime,
          close_time: day.isClosed
            ? null
            : day.closeTime,
          is_closed: day.isClosed,
          slot_duration: day.slotDuration,
        }

        if (day.existingId) {
          const { error } = await supabase
            .from("business_availability")
            .update(row)
            .eq("id", day.existingId)
            .eq("business_id", businessId)

          if (error) {
            throw error
          }
        } else {
          const { data, error } = await supabase
            .from("business_availability")
            .insert(row)
            .select("id")
            .single()

          if (error) {
            throw error
          }

          day.existingId = data.id
        }
      }

      const hoursText = schedule
        .map((day) => {
          if (day.isClosed) {
            return `${day.label}: Closed`
          }

          return `${day.label}: ${formatTime(
            day.openTime
          )} - ${formatTime(day.closeTime)}`
        })
        .join("\n")

      const { error: businessError } = await supabase
        .from("businesses")
        .update({
          hours: hoursText,
        })
        .eq("id", businessId)

      if (businessError) {
        throw businessError
      }

      setSchedule([...schedule])

      setMessage({
        type: "success",
        text: "Business hours saved. Jhyro AI can now use this schedule when replying to customers.",
      })
    } catch (error) {
      console.error(
        "SAVE BUSINESS HOURS ERROR:",
        error
      )

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Could not save business hours.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Business Hours
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Set the opening and closing time for each day.
            Mark a day as closed when the business does not
            operate that day.
          </p>
        </div>

        <button
          type="button"
          onClick={saveHours}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          {saving ? "Saving..." : "Save Hours"}
        </button>
      </div>

      {message && (
        <div
          className={
            message.type === "success"
              ? "mt-5 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300"
              : "mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          }
        >
          {message.type === "success" ? (
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
          )}

          <p className="text-sm leading-relaxed">
            {message.text}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {schedule.map((day) => (
          <div
            key={day.key}
            className={
              day.isClosed
                ? "rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
                : "rounded-2xl border border-slate-800 bg-slate-950 p-5"
            }
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-40">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      day.isClosed
                        ? "rounded-xl bg-red-500/20 p-3 text-red-400"
                        : "rounded-xl bg-green-500/20 p-3 text-green-400"
                    }
                  >
                    <Clock3 size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      {day.label}
                    </p>

                    <p
                      className={
                        day.isClosed
                          ? "mt-1 text-xs font-semibold text-red-400"
                          : "mt-1 text-xs font-semibold text-green-400"
                      }
                    >
                      {day.isClosed ? "Closed" : "Open"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:max-w-xl">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Opens
                  </span>

                  <input
                    type="time"
                    value={day.openTime}
                    disabled={day.isClosed}
                    onChange={(event) =>
                      updateDay(day.key, {
                        openTime: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Closes
                  </span>

                  <input
                    type="time"
                    value={day.closeTime}
                    disabled={day.isClosed}
                    onChange={(event) =>
                      updateDay(day.key, {
                        closeTime: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateDay(day.key, {
                    isClosed: !day.isClosed,
                  })
                }
                className={
                  day.isClosed
                    ? "inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-green-500/20 px-5 py-3 text-sm font-bold text-green-400 transition hover:bg-green-500/30"
                    : "inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                }
              >
                {day.isClosed ? (
                  <>
                    <CheckCircle2 size={17} />
                    Reopen
                  </>
                ) : (
                  <>
                    <XCircle size={17} />
                    Mark Closed
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatTime(value: string) {
  const [hourText, minuteText] = value.split(":")
  const hour = Number(hourText)
  const minute = minuteText || "00"

  if (Number.isNaN(hour)) {
    return value
  }

  const suffix = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minute} ${suffix}`
}