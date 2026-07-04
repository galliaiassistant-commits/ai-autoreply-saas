import { supabase } from "@/lib/supabase"

type AvailabilityResult = {
  available: boolean
  reason?: string
  suggestions?: string[]
}

function getDayName(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
  })
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function dateToTimeMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

function addMinutes(date: Date, minutes: number) {
  const copy = new Date(date)
  copy.setMinutes(copy.getMinutes() + minutes)
  return copy
}

export async function checkBookingAvailability({
  businessId,
  bookingTime,
  durationMinutes = 30,
}: {
  businessId: string
  bookingTime: string
  durationMinutes?: number
}): Promise<AvailabilityResult> {
  const requestedDate = new Date(bookingTime)
  const dayName = getDayName(requestedDate)
  const requestedMinutes = dateToTimeMinutes(requestedDate)
  const requestedEndMinutes = requestedMinutes + durationMinutes

  const requestedDateOnly = requestedDate.toISOString().split("T")[0]

  const { data: closure } = await supabase
    .from("business_closures")
    .select("*")
    .eq("business_id", businessId)
    .eq("closure_date", requestedDateOnly)
    .maybeSingle()

  if (closure) {
    return {
      available: false,
      reason: `The business is closed on that date because of ${closure.reason || "a scheduled closure"}.`,
    }
  }

  const { data: availability } = await supabase
    .from("business_availability")
    .select("*")
    .eq("business_id", businessId)
    .eq("day_of_week", dayName)
    .maybeSingle()

  if (!availability || availability.is_closed) {
    return {
      available: false,
      reason: `The business is closed on ${dayName}s.`,
    }
  }

  const openMinutes = timeToMinutes(availability.open_time)
  const closeMinutes = timeToMinutes(availability.close_time)

  if (
    requestedMinutes < openMinutes ||
    requestedEndMinutes > closeMinutes
  ) {
    return {
      available: false,
      reason: `That time is outside business hours. The business is open ${availability.open_time} to ${availability.close_time} on ${dayName}s.`,
    }
  }

  const { data: breaks } = await supabase
    .from("business_breaks")
    .select("*")
    .eq("business_id", businessId)
    .eq("day_of_week", dayName)

  for (const breakTime of breaks || []) {
    const breakStart = timeToMinutes(breakTime.start_time)
    const breakEnd = timeToMinutes(breakTime.end_time)

    const overlapsBreak =
      requestedMinutes < breakEnd &&
      requestedEndMinutes > breakStart

    if (overlapsBreak) {
      return {
        available: false,
        reason: `That time overlaps with ${breakTime.reason || "a break"}.`,
      }
    }
  }

  const start = new Date(requestedDate)
  start.setMinutes(start.getMinutes() - durationMinutes)

  const end = new Date(requestedDate)
  end.setMinutes(end.getMinutes() + durationMinutes)

  const { data: conflictingBooking } = await supabase
    .from("bookings")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "booked")
    .gte("booking_time", start.toISOString())
    .lte("booking_time", end.toISOString())
    .maybeSingle()

  if (conflictingBooking) {
    return {
      available: false,
      reason: "That time is already booked.",
    }
  }

  return {
    available: true,
  }
}

export async function findNextAvailableSlots({
  businessId,
  fromDate = new Date(),
  durationMinutes = 30,
  limit = 3,
}: {
  businessId: string
  fromDate?: Date
  durationMinutes?: number
  limit?: number
}) {
  const suggestions: string[] = []
  let cursor = new Date(fromDate)

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const day = new Date(cursor)
    day.setDate(cursor.getDate() + dayOffset)

    const dayName = getDayName(day)
    const dateOnly = day.toISOString().split("T")[0]

    const { data: closure } = await supabase
      .from("business_closures")
      .select("*")
      .eq("business_id", businessId)
      .eq("closure_date", dateOnly)
      .maybeSingle()

    if (closure) continue

    const { data: availability } = await supabase
      .from("business_availability")
      .select("*")
      .eq("business_id", businessId)
      .eq("day_of_week", dayName)
      .maybeSingle()

    if (!availability || availability.is_closed) continue

    const openMinutes = timeToMinutes(availability.open_time)
    const closeMinutes = timeToMinutes(availability.close_time)

    for (
      let minute = openMinutes;
      minute + durationMinutes <= closeMinutes;
      minute += availability.slot_duration || durationMinutes
    ) {
      const slot = new Date(day)
      slot.setHours(Math.floor(minute / 60))
      slot.setMinutes(minute % 60)
      slot.setSeconds(0)
      slot.setMilliseconds(0)

      if (slot < fromDate) continue

      const result = await checkBookingAvailability({
        businessId,
        bookingTime: slot.toISOString(),
        durationMinutes,
      })

      if (result.available) {
        suggestions.push(slot.toISOString())
      }

      if (suggestions.length >= limit) {
        return suggestions
      }
    }
  }

  return suggestions
}