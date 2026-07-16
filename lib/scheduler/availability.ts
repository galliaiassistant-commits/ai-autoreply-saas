import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { checkGoogleCalendarAvailability } from "@/lib/google-calendar"
import { hasBookingConflict } from "./conflicts"
import { getBusinessTimezone } from "./timezone"
import {
  AvailabilityCheck,
  AvailabilityRule,
  BusinessBreak,
  BusinessClosure,
} from "./types"

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

function getDayName(
  date: Date,
  timeZone: string
) {
  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      timeZone,
    }
  )
}

function getDayIndex(
  date: Date,
  timeZone: string
) {
  const dayName =
    getDayName(date, timeZone)

  return dayNames.indexOf(dayName)
}

function getDateOnly(
  date: Date,
  timeZone: string
) {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date)
}

function getTimeOnly(
  date: Date,
  timeZone: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(date)
}

function normalizeTime(
  time: string | null
) {
  if (!time) return null

  return time.slice(0, 5)
}

function timeToMinutes(
  time: string
) {
  const [hours, minutes] =
    time.split(":").map(Number)

  return hours * 60 + minutes
}

function normalizeDay(
  value: unknown
) {
  return String(value || "")
    .toLowerCase()
    .trim()
}

function dayMatches({
  storedDay,
  dayName,
  dayIndex,
}: {
  storedDay: unknown
  dayName: string
  dayIndex: number
}) {
  const stored =
    normalizeDay(storedDay)

  if (!stored) return false

  if (
    stored === normalizeDay(dayName)
  ) {
    return true
  }

  if (
    stored === String(dayIndex)
  ) {
    return true
  }

  const mondayBasedIndex =
    dayIndex === 0 ? 7 : dayIndex

  return (
    stored ===
    String(mondayBasedIndex)
  )
}

function rangesOverlap({
  startA,
  endA,
  startB,
  endB,
}: {
  startA: number
  endA: number
  startB: number
  endB: number
}) {
  return (
    startA < endB &&
    endA > startB
  )
}

export async function getAvailabilityRule({
  businessId,
  date,
}: {
  businessId: string
  date: Date
}) {
  const timeZone =
    await getBusinessTimezone(
      businessId
    )

  const dayName =
    getDayName(date, timeZone)

  const dayIndex =
    getDayIndex(date, timeZone)

  const { data, error } =
    await supabase
      .from(
        "business_availability"
      )
      .select("*")
      .eq(
        "business_id",
        businessId
      )
      .returns<
        AvailabilityRule[]
      >()

  if (error) {
    console.error(
      "GET AVAILABILITY RULE ERROR:",
      error
    )

    return null
  }

  return (
    data?.find((item) =>
      dayMatches({
        storedDay:
          item.day_of_week,
        dayName,
        dayIndex,
      })
    ) || null
  )
}

export async function checkAvailability({
  businessId,
  bookingTime,
  durationMinutes = 30,
}: {
  businessId: string
  bookingTime: string
  durationMinutes?: number
}): Promise<AvailabilityCheck> {
  const date =
    new Date(bookingTime)

  if (
    Number.isNaN(date.getTime())
  ) {
    return {
      available: false,
      reason:
        "That date and time is invalid.",
    }
  }

  if (date.getTime() <= Date.now()) {
    return {
      available: false,
      reason:
        "That appointment time has already passed. Please choose a future date and time.",
    }
  }

  const safeDurationMinutes =
    Math.max(
      1,
      Number(durationMinutes) || 30
    )

  const timeZone =
    await getBusinessTimezone(
      businessId
    )

  const dateOnly =
    getDateOnly(date, timeZone)

  const timeOnly =
    getTimeOnly(date, timeZone)

  const dayName =
    getDayName(date, timeZone)

  const dayIndex =
    getDayIndex(date, timeZone)

  const requestedStart =
    timeToMinutes(timeOnly)

  const requestedEnd =
    requestedStart +
    safeDurationMinutes

  const {
    data: closure,
    error: closureError,
  } = await supabase
    .from("business_closures")
    .select("*")
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "closure_date",
      dateOnly
    )
    .maybeSingle<BusinessClosure>()

  if (closureError) {
    console.error(
      "CLOSURE CHECK ERROR:",
      closureError
    )

    return {
      available: false,
      reason:
        "I could not check the business closure calendar.",
    }
  }

  if (closure) {
    return {
      available: false,
      reason: closure.reason
        ? `The business is closed on that date: ${closure.reason}.`
        : "The business is closed on that date.",
    }
  }

  const rule =
    await getAvailabilityRule({
      businessId,
      date,
    })

  if (!rule) {
    return {
      available: false,
      reason:
        "The business has not added availability for that day.",
    }
  }

  if (rule.is_closed) {
    return {
      available: false,
      reason:
        `The business is closed on ${dayName}.`,
    }
  }

  const openTime =
    normalizeTime(rule.open_time)

  const closeTime =
    normalizeTime(rule.close_time)

  if (!openTime || !closeTime) {
    return {
      available: false,
      reason:
        "The business hours are incomplete for that day.",
    }
  }

  const openMinutes =
    timeToMinutes(openTime)

  const closeMinutes =
    timeToMinutes(closeTime)

  if (
    requestedStart < openMinutes ||
    requestedEnd > closeMinutes
  ) {
    return {
      available: false,
      reason:
        `That time is outside business hours. Hours are ${openTime} - ${closeTime}.`,
    }
  }

  const {
    data: breaks,
    error: breakError,
  } = await supabase
    .from("business_breaks")
    .select("*")
    .eq(
      "business_id",
      businessId
    )
    .returns<BusinessBreak[]>()

  if (breakError) {
    console.error(
      "BREAK CHECK ERROR:",
      breakError
    )

    return {
      available: false,
      reason:
        "I could not check business breaks.",
    }
  }

  const matchingBreak =
    breaks?.find((item) => {
      const start =
        normalizeTime(
          item.start_time
        )

      const end =
        normalizeTime(
          item.end_time
        )

      if (!start || !end) {
        return false
      }

      const sameDay =
        dayMatches({
          storedDay:
            item.day_of_week,
          dayName,
          dayIndex,
        })

      if (!sameDay) {
        return false
      }

      return rangesOverlap({
        startA: requestedStart,
        endA: requestedEnd,
        startB:
          timeToMinutes(start),
        endB:
          timeToMinutes(end),
      })
    })

  if (matchingBreak) {
    return {
      available: false,
      reason:
        matchingBreak.reason
          ? `That time is during a break: ${matchingBreak.reason}.`
          : "That time is during a business break.",
    }
  }

  const hasConflict =
    await hasBookingConflict({
      businessId,
      bookingTime,
    })

  if (hasConflict) {
    return {
      available: false,
      reason:
        "That time is already booked.",
    }
  }

  const googleAvailability =
    await checkGoogleCalendarAvailability({
      businessId,
      bookingTime:
        date.toISOString(),
      durationMinutes:
        safeDurationMinutes,
    })

  if (!googleAvailability.available) {
    return {
      available: false,
      reason:
        googleAvailability.error
          ? "I could not verify Google Calendar availability. Please try another time or contact the business."
          : "That time is unavailable on the business calendar. Please choose another time.",
    }
  }

  return {
    available: true,
  }
}