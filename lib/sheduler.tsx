import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

type AvailabilityResult = {
  available: boolean
  reason?: string
  suggestions?: string[]
}

type ScheduledBookingResult = {
  success: boolean
  message: string
  booking?: any
  suggestions?: string[]
}

type BusinessService = {
  id: string
  business_id: string
  name: string
  duration_minutes?: number | null
  price?: number | string | null
  is_active?: boolean | null
}

type BusinessAvailability = {
  id?: string
  business_id?: string
  day_of_week?: string | number | null
  open_time?: string | null
  close_time?: string | null
  is_closed?: boolean | null
  slot_duration?: number | null
}

type ZonedDateParts = {
  year: number
  month: number
  day: number
  weekday: string
  hour: number
  minute: number
  second: number
}

const DEFAULT_TIMEZONE = "America/Jamaica"

export async function getBusinessTimezone(
  businessId: string
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("timezone")
    .eq("id", businessId)
    .maybeSingle()

  if (error) {
    console.error(
      "GET BUSINESS TIMEZONE ERROR:",
      error
    )
  }

  return isValidTimeZone(data?.timezone)
    ? data.timezone
    : DEFAULT_TIMEZONE
}

function isValidTimeZone(
  value: unknown
): value is string {
  if (typeof value !== "string" || !value.trim()) {
    return false
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    }).format(new Date())

    return true
  } catch {
    return false
  }
}

function getZonedDateParts(
  value: string | Date,
  timeZone: string
): ZonedDateParts | null {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const part = (type: string) =>
    parts.find((item) => item.type === type)
      ?.value || ""

  const result = {
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day")),
    weekday: part("weekday"),
    hour: Number(part("hour")),
    minute: Number(part("minute")),
    second: Number(part("second")),
  }

  if (
    !result.weekday ||
    Object.entries(result).some(
      ([key, value]) =>
        key !== "weekday" &&
        Number.isNaN(value)
    )
  ) {
    return null
  }

  return result
}

function normalizeDayOfWeek(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()

  const numericDays: Record<string, string> = {
    "0": "sunday",
    "1": "monday",
    "2": "tuesday",
    "3": "wednesday",
    "4": "thursday",
    "5": "friday",
    "6": "saturday",
  }

  return numericDays[normalized] || normalized
}

function dateOnly(parts: ZonedDateParts) {
  return `${String(parts.year).padStart(
    4,
    "0"
  )}-${String(parts.month).padStart(
    2,
    "0"
  )}-${String(parts.day).padStart(2, "0")}`
}

function timeToMinutes(
  value?: string | null
) {
  if (!value) return null

  const match = value.match(
    /^(\d{1,2}):(\d{2})/
  )

  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null
  }

  return hour * 60 + minute
}

function formatTime(
  value?: string | null
) {
  const total = timeToMinutes(value)

  if (total === null) {
    return value || "an unknown time"
  }

  const hour24 = Math.floor(total / 60)
  const minute = total % 60
  const suffix = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 || 12

  return `${hour12}:${String(minute).padStart(
    2,
    "0"
  )} ${suffix}`
}

function formatDateTime(
  value: string | Date,
  timeZone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(
    value instanceof Date ? value : new Date(value)
  )
}

function localDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  timeZone,
}: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  timeZone: string
}) {
  const targetAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0
  )

  let estimate = new Date(targetAsUtc)

  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = getZonedDateParts(
      estimate,
      timeZone
    )

    if (!parts) break

    const renderedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0
    )

    const difference =
      targetAsUtc - renderedAsUtc

    if (difference === 0) {
      return estimate
    }

    estimate = new Date(
      estimate.getTime() + difference
    )
  }

  return estimate
}

function addCalendarDays(
  parts: ZonedDateParts,
  amount: number
) {
  const date = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day + amount,
      12
    )
  )

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

async function getAvailabilityForDay({
  businessId,
  dayName,
}: {
  businessId: string
  dayName: string
}) {
  const { data, error } = await supabase
    .from("business_availability")
    .select("*")
    .eq("business_id", businessId)

  if (error) {
    console.error(
      "BUSINESS AVAILABILITY LOOKUP ERROR:",
      error
    )

    return {
      data: null,
      error,
    }
  }

  const matchingDay = (
    (data || []) as BusinessAvailability[]
  ).find(
    (row) =>
      normalizeDayOfWeek(row.day_of_week) ===
      normalizeDayOfWeek(dayName)
  )

  return {
    data: matchingDay || null,
    error: null,
  }
}

export async function findServiceByName(
  businessId: string,
  serviceName: string
): Promise<BusinessService | null> {
  const cleanName = serviceName.trim()

  if (!cleanName) return null

  const { data, error } = await supabase
    .from("business_services")
    .select("*")
    .eq("business_id", businessId)
    .neq("is_active", false)

  if (error) {
    console.error(
      "FIND SERVICE ERROR:",
      error
    )

    return null
  }

  const normalizedRequested =
    cleanName.toLowerCase()

  const services =
    (data || []) as BusinessService[]

  return (
    services.find(
      (service) =>
        service.name.trim().toLowerCase() ===
        normalizedRequested
    ) ||
    services.find(
      (service) =>
        service.name
          .trim()
          .toLowerCase()
          .includes(normalizedRequested) ||
        normalizedRequested.includes(
          service.name.trim().toLowerCase()
        )
    ) ||
    null
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
}): Promise<AvailabilityResult> {
  const timeZone =
    await getBusinessTimezone(businessId)

  const requestedDate = new Date(bookingTime)
  const requestedParts = getZonedDateParts(
    requestedDate,
    timeZone
  )

  if (
    Number.isNaN(requestedDate.getTime()) ||
    !requestedParts
  ) {
    return {
      available: false,
      reason:
        "I couldn't understand that appointment date and time. Please send it again.",
    }
  }

  const duration = Math.max(
    1,
    Number(durationMinutes) || 30
  )

  const requestedMinutes =
    requestedParts.hour * 60 +
    requestedParts.minute

  const requestedEndMinutes =
    requestedMinutes + duration

  const { data: closure, error: closureError } =
    await supabase
      .from("business_closures")
      .select("*")
      .eq("business_id", businessId)
      .eq(
        "closure_date",
        dateOnly(requestedParts)
      )
      .maybeSingle()

  if (closureError) {
    console.error(
      "BUSINESS CLOSURE LOOKUP ERROR:",
      closureError
    )

    return {
      available: false,
      reason:
        "I couldn't check scheduled closures right now. Please try again.",
    }
  }

  if (closure) {
    return {
      available: false,
      reason: `The business is closed on that date because of ${
        closure.reason || "a scheduled closure"
      }.`,
    }
  }

  const {
    data: availability,
    error: availabilityError,
  } = await getAvailabilityForDay({
    businessId,
    dayName: requestedParts.weekday,
  })

  if (availabilityError) {
    return {
      available: false,
      reason:
        "I couldn't check the business hours right now. Please try again.",
    }
  }

  if (!availability) {
    return {
      available: false,
      reason: `The business has not set hours for ${requestedParts.weekday}.`,
    }
  }

  if (availability.is_closed) {
    return {
      available: false,
      reason: `The business is closed on ${requestedParts.weekday}s.`,
    }
  }

  const openMinutes = timeToMinutes(
    availability.open_time
  )

  const closeMinutes = timeToMinutes(
    availability.close_time
  )

  if (
    openMinutes === null ||
    closeMinutes === null
  ) {
    return {
      available: false,
      reason: `The business hours for ${requestedParts.weekday} are incomplete.`,
    }
  }

  if (requestedMinutes < openMinutes) {
    return {
      available: false,
      reason: `That time is before opening. The business opens at ${formatTime(
        availability.open_time
      )} on ${requestedParts.weekday}s.`,
    }
  }

  if (requestedEndMinutes > closeMinutes) {
    return {
      available: false,
      reason: `That appointment is outside business hours. The business is open ${formatTime(
        availability.open_time
      )} to ${formatTime(
        availability.close_time
      )} on ${requestedParts.weekday}s.`,
    }
  }

  const { data: breaks, error: breaksError } =
    await supabase
      .from("business_breaks")
      .select("*")
      .eq("business_id", businessId)

  if (breaksError) {
    console.error(
      "BUSINESS BREAK LOOKUP ERROR:",
      breaksError
    )

    return {
      available: false,
      reason:
        "I couldn't check business breaks right now. Please try again.",
    }
  }

  for (const breakTime of breaks || []) {
    if (
      normalizeDayOfWeek(
        breakTime.day_of_week
      ) !==
      normalizeDayOfWeek(
        requestedParts.weekday
      )
    ) {
      continue
    }

    const breakStart = timeToMinutes(
      breakTime.start_time
    )

    const breakEnd = timeToMinutes(
      breakTime.end_time
    )

    if (
      breakStart === null ||
      breakEnd === null
    ) {
      continue
    }

    const overlapsBreak =
      requestedMinutes < breakEnd &&
      requestedEndMinutes > breakStart

    if (overlapsBreak) {
      return {
        available: false,
        reason: `That time overlaps with ${
          breakTime.reason || "a break"
        }.`,
      }
    }
  }

  const requestedEnd = new Date(
    requestedDate.getTime() +
      duration * 60 * 1000
  )

  const searchStart = new Date(
    requestedDate.getTime() -
      24 * 60 * 60 * 1000
  )

  const searchEnd = new Date(
    requestedDate.getTime() +
      24 * 60 * 60 * 1000
  )

  const {
    data: existingBookings,
    error: bookingsError,
  } = await supabase
    .from("bookings")
    .select(
      "id, booking_time, service, status"
    )
    .eq("business_id", businessId)
    .eq("status", "booked")
    .gte(
      "booking_time",
      searchStart.toISOString()
    )
    .lte(
      "booking_time",
      searchEnd.toISOString()
    )

  if (bookingsError) {
    console.error(
      "BOOKING CONFLICT LOOKUP ERROR:",
      bookingsError
    )

    return {
      available: false,
      reason:
        "I couldn't check existing bookings right now. Please try again.",
    }
  }

  for (const existing of existingBookings || []) {
    if (!existing.booking_time) continue

    const existingStart = new Date(
      existing.booking_time
    )

    if (
      Number.isNaN(existingStart.getTime())
    ) {
      continue
    }

    let existingDuration = duration

    if (existing.service) {
      const existingService =
        await findServiceByName(
          businessId,
          existing.service
        )

      existingDuration = Math.max(
        1,
        Number(
          existingService?.duration_minutes
        ) || duration
      )
    }

    const existingEnd = new Date(
      existingStart.getTime() +
        existingDuration * 60 * 1000
    )

    const overlaps =
      requestedDate < existingEnd &&
      requestedEnd > existingStart

    if (overlaps) {
      return {
        available: false,
        reason: "That time is already booked.",
      }
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
  const timeZone =
    await getBusinessTimezone(businessId)

  const startingParts = getZonedDateParts(
    fromDate,
    timeZone
  )

  if (!startingParts) {
    return suggestions
  }

  const duration = Math.max(
    1,
    Number(durationMinutes) || 30
  )

  for (
    let dayOffset = 0;
    dayOffset < 14;
    dayOffset++
  ) {
    const calendarDay = addCalendarDays(
      startingParts,
      dayOffset
    )

    const noon = localDateTimeToUtc({
      ...calendarDay,
      hour: 12,
      minute: 0,
      timeZone,
    })

    const dayParts = getZonedDateParts(
      noon,
      timeZone
    )

    if (!dayParts) continue

    const {
      data: availability,
      error: availabilityError,
    } = await getAvailabilityForDay({
      businessId,
      dayName: dayParts.weekday,
    })

    if (
      availabilityError ||
      !availability ||
      availability.is_closed
    ) {
      continue
    }

    const openMinutes = timeToMinutes(
      availability.open_time
    )

    const closeMinutes = timeToMinutes(
      availability.close_time
    )

    if (
      openMinutes === null ||
      closeMinutes === null
    ) {
      continue
    }

    const slotStep = Math.max(
      1,
      Number(
        availability.slot_duration
      ) || duration
    )

    for (
      let minute = openMinutes;
      minute + duration <= closeMinutes;
      minute += slotStep
    ) {
      const slot = localDateTimeToUtc({
        ...calendarDay,
        hour: Math.floor(minute / 60),
        minute: minute % 60,
        timeZone,
      })

      if (slot < fromDate) continue

      const result =
        await checkAvailability({
          businessId,
          bookingTime: slot.toISOString(),
          durationMinutes: duration,
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

export async function createScheduledBooking({
  businessId,
  customerId,
  serviceName,
  bookingTime,
}: {
  businessId: string
  customerId: string
  serviceName: string
  bookingTime: string
}): Promise<ScheduledBookingResult> {
  const service = await findServiceByName(
    businessId,
    serviceName
  )

  if (!service) {
    return {
      success: false,
      message: `Sorry, we don't offer ${serviceName}.`,
    }
  }

  const duration = Math.max(
    1,
    Number(service.duration_minutes) || 30
  )

  const availability =
    await checkAvailability({
      businessId,
      bookingTime,
      durationMinutes: duration,
    })

  if (!availability.available) {
    const suggestions =
      await findNextAvailableSlots({
        businessId,
        fromDate: new Date(bookingTime),
        durationMinutes: duration,
        limit: 3,
      })

    return {
      success: false,
      message:
        availability.reason ||
        "That appointment time is unavailable.",
      suggestions,
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service: service.name,
      booking_time: new Date(
        bookingTime
      ).toISOString(),
      status: "booked",
    })
    .select()
    .single()

  if (error) {
    console.error(
      "CREATE SCHEDULED BOOKING ERROR:",
      error
    )

    return {
      success: false,
      message:
        "Sorry, I couldn't save that booking. Please try again.",
    }
  }

  const timeZone =
    await getBusinessTimezone(businessId)

  return {
    success: true,
    booking: data,
    message: `Your ${service.name} appointment is booked for ${formatDateTime(
      bookingTime,
      timeZone
    )}.`,
  }
}