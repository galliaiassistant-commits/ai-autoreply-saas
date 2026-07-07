import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { hasBookingConflict } from "./conflicts"
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

function getDayName(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/Jamaica",
  })
}

function getDayIndex(date: Date) {
  const dayName = getDayName(date)
  return dayNames.indexOf(dayName)
}

function getDateOnly(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Jamaica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function getTimeOnly(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Jamaica",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

function normalizeTime(time: string | null) {
  if (!time) return null
  return time.slice(0, 5)
}

function normalizeDay(value: unknown) {
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
  const stored = normalizeDay(storedDay)

  if (!stored) return false

  if (stored === normalizeDay(dayName)) {
    return true
  }

  if (stored === String(dayIndex)) {
    return true
  }

  // Some systems store Monday as 1 and Sunday as 7
  const mondayBasedIndex = dayIndex === 0 ? 7 : dayIndex

  if (stored === String(mondayBasedIndex)) {
    return true
  }

  return false
}

function isTimeBetween({
  time,
  start,
  end,
}: {
  time: string
  start: string
  end: string
}) {
  return time >= start && time < end
}

export async function getAvailabilityRule({
  businessId,
  date,
}: {
  businessId: string
  date: Date
}) {
  const dayName = getDayName(date)
  const dayIndex = getDayIndex(date)

  const { data, error } = await supabase
    .from("business_availability")
    .select("*")
    .eq("business_id", businessId)
    .returns<AvailabilityRule[]>()

  if (error) {
    console.error("GET AVAILABILITY RULE ERROR:", error)
    return null
  }

  console.log("AVAILABILITY BUSINESS ID:", businessId)
  console.log("AVAILABILITY DAY NAME:", dayName)
  console.log("AVAILABILITY DAY INDEX:", dayIndex)
  console.log("AVAILABILITY ROWS:", data)

  const rule =
    data?.find((item) =>
      dayMatches({
        storedDay: item.day_of_week,
        dayName,
        dayIndex,
      })
    ) || null

  console.log("MATCHED AVAILABILITY RULE:", rule)

  return rule
}

export async function checkAvailability({
  businessId,
  bookingTime,
}: {
  businessId: string
  bookingTime: string
}): Promise<AvailabilityCheck> {
  const date = new Date(bookingTime)

  if (Number.isNaN(date.getTime())) {
    return {
      available: false,
      reason: "That date and time is invalid.",
    }
  }

  const dateOnly = getDateOnly(date)
  const timeOnly = getTimeOnly(date)
  const dayName = getDayName(date)
  const dayIndex = getDayIndex(date)

  console.log("CHECK AVAILABILITY TIME:", bookingTime)
  console.log("CHECK AVAILABILITY DATE:", dateOnly)
  console.log("CHECK AVAILABILITY DAY:", dayName)
  console.log("CHECK AVAILABILITY CLOCK:", timeOnly)

  const { data: closure, error: closureError } = await supabase
    .from("business_closures")
    .select("*")
    .eq("business_id", businessId)
    .eq("closure_date", dateOnly)
    .maybeSingle<BusinessClosure>()

  if (closureError) {
    console.error("CLOSURE CHECK ERROR:", closureError)

    return {
      available: false,
      reason: "I could not check the business closure calendar.",
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

  const rule = await getAvailabilityRule({
    businessId,
    date,
  })

  if (!rule) {
    return {
      available: false,
      reason: "The business has not added availability for that day.",
    }
  }

  if (rule.is_closed) {
    return {
      available: false,
      reason: `The business is closed on ${dayName}.`,
    }
  }

  const openTime = normalizeTime(rule.open_time)
  const closeTime = normalizeTime(rule.close_time)

  if (!openTime || !closeTime) {
    return {
      available: false,
      reason: "The business hours are incomplete for that day.",
    }
  }

  if (
    !isTimeBetween({
      time: timeOnly,
      start: openTime,
      end: closeTime,
    })
  ) {
    return {
      available: false,
      reason: `That time is outside business hours. Hours are ${openTime} - ${closeTime}.`,
    }
  }

  const { data: breaks, error: breakError } = await supabase
    .from("business_breaks")
    .select("*")
    .eq("business_id", businessId)
    .returns<BusinessBreak[]>()

  if (breakError) {
    console.error("BREAK CHECK ERROR:", breakError)

    return {
      available: false,
      reason: "I could not check business breaks.",
    }
  }

  const matchingBreak = breaks?.find((item) => {
    const start = normalizeTime(item.start_time)
    const end = normalizeTime(item.end_time)

    if (!start || !end) return false

    const sameDay = dayMatches({
      storedDay: item.day_of_week,
      dayName,
      dayIndex,
    })

    if (!sameDay) return false

    return isTimeBetween({
      time: timeOnly,
      start,
      end,
    })
  })

  if (matchingBreak) {
    return {
      available: false,
      reason: matchingBreak.reason
        ? `That time is during a break: ${matchingBreak.reason}.`
        : "That time is during a business break.",
    }
  }

  const hasConflict = await hasBookingConflict({
    businessId,
    bookingTime,
  })

  if (hasConflict) {
    return {
      available: false,
      reason: "That time is already booked.",
    }
  }

  return {
    available: true,
  }
}