import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { hasBookingConflict } from "./conflicts"
import {
  AvailabilityCheck,
  AvailabilityRule,
  BusinessBreak,
  BusinessClosure,
} from "./types"

function getDayName(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
  })
}

function getDateOnly(date: Date) {
  return date.toISOString().split("T")[0]
}

function getTimeOnly(date: Date) {
  return date.toTimeString().slice(0, 5)
}

function normalizeTime(time: string | null) {
  if (!time) return null
  return time.slice(0, 5)
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

  const { data, error } = await supabase
    .from("business_availability")
    .select("*")
    .eq("business_id", businessId)
    .eq("day_of_week", dayName)
    .maybeSingle<AvailabilityRule>()

  if (error) {
    console.error("GET AVAILABILITY RULE ERROR:", error)
    return null
  }

  return data
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

  if (!isTimeBetween({ time: timeOnly, start: openTime, end: closeTime })) {
    return {
      available: false,
      reason: `That time is outside business hours. Hours are ${openTime} - ${closeTime}.`,
    }
  }

  const { data: breaks, error: breakError } = await supabase
    .from("business_breaks")
    .select("*")
    .eq("business_id", businessId)
    .eq("day_of_week", dayName)
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