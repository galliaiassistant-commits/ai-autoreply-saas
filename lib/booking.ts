import OpenAI from "openai"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import {
  createScheduledBooking,
  findServiceByName,
} from "@/lib/scheduler"

type BookingStatus =
  | "missing_details"
  | "booked"
  | "completed"
  | "cancelled"

type BookingInput = {
  business_id: string
  customer_id: string
  service: string | null
  booking_time: string | null
  status: BookingStatus
}

type BookingUpdates = {
  service?: string | null
  booking_time?: string | null
  status?: BookingStatus
}

type ExtractedBooking = {
  is_booking: boolean
  cancel_booking?: boolean
  service?: string | null
  booking_time?: string | null
  requested_day?: string | null
  status?: BookingStatus
}

export async function getOpenBooking(
  businessId: string,
  customerId: string
) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .eq("status", "missing_details")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("OPEN BOOKING ERROR:", error)
    return null
  }

  return data
}

export async function updateBooking({
  businessId,
  customerId,
  bookingId,
  updates,
}: {
  businessId: string
  customerId: string
  bookingId: string
  updates: BookingUpdates
}) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .select()
    .single()

  if (error) {
    console.error("UPDATE BOOKING ERROR:", error)
    return null
  }

  return data
}

export async function createBooking(booking: BookingInput) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      business_id: booking.business_id,
      customer_id: booking.customer_id,
      service: booking.service,
      booking_time: booking.booking_time,
      status: booking.status,
    })
    .select()
    .single()

  if (error) {
    console.error("CREATE BOOKING ERROR:", error)
    return null
  }

  return data
}

export async function cancelBooking({
  businessId,
  customerId,
  bookingId,
}: {
  businessId: string
  customerId: string
  bookingId: string
}) {
  return await updateBooking({
    businessId,
    customerId,
    bookingId,
    updates: {
      status: "cancelled",
    },
  })
}

export async function extractBooking(
  openai: OpenAI,
  userText: string,
  openBooking: any,
  isNewBookingRequest: boolean
): Promise<ExtractedBooking> {
  const bookingExtract = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You extract booking intent and booking details from customer messages.

Return ONLY valid JSON. No markdown. No explanation.

If this is not about booking, return:
{
  "is_booking": false
}

Rules:
- Use the existing open booking as context.
- Keep existing service unless customer changes it.
- booking_time must include BOTH date and time.
- Never return 00:00:00 unless customer said midnight.
- If date or time is missing, booking_time must be null.
- If service and full booking_time exist, status is "booked".
- Otherwise status is "missing_details".
- Do NOT assume the service from customer memory or past bookings.
- If customer asks to cancel, return cancel_booking true.
- If customer asks to change, move, update, switch, or reschedule the booking date/time, overwrite existing booking_time with the new date/time.
- If customer gives only a new date and the open booking already has a time, keep the existing time but change the date.
- If customer gives only a new time and the open booking already has a date, keep the existing date but change the time.
- If customer mentions a day of the week such as Sunday, Monday, Tuesday, etc., include it in requested_day.
- Use ISO date format for booking_time.
- The business timezone is America/Jamaica, UTC-05:00.
- When returning booking_time, always include the timezone offset -05:00.
- Example: if the customer says tomorrow at 1pm, return YYYY-MM-DDT13:00:00-05:00, not YYYY-MM-DDT13:00:00Z.

Return shape:
{
  "is_booking": true,
  "cancel_booking": false,
  "service": null,
  "booking_time": null,
  "requested_day": null,
  "status": "missing_details"
}
        `,
      },
      {
        role: "user",
        content: `
Existing open booking:
${JSON.stringify(isNewBookingRequest ? null : openBooking)}

Current customer message:
${userText}

Today's date and time in Jamaica:
${getJamaicaNowText()}

Merge the customer message with the existing booking.
Preserve existing booking information unless the customer changes it.
        `,
      },
    ],
  })

  const raw = bookingExtract.choices[0].message.content || "{}"

  try {
    const parsed = JSON.parse(cleanJson(raw))

    return {
      ...parsed,
      booking_time: normalizeJamaicaBookingTime(
        parsed.booking_time
      ),
    }
  } catch (error) {
    console.error("BOOKING JSON PARSE ERROR:", error)
    console.error("RAW BOOKING JSON:", raw)

    return {
      is_booking: false,
    }
  }
}

function getJamaicaNowText() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Jamaica",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date())
}

function cleanJson(value: string) {
  return value
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()
}

function normalizeJamaicaBookingTime(value?: string | null) {
  if (!value) return null

  const cleanValue = value.trim()

  const hasTimezone =
    /z$/i.test(cleanValue) ||
    /[+-]\d{2}:\d{2}$/.test(cleanValue)

  if (hasTimezone) {
    return cleanValue
  }

  const withT = cleanValue.replace(" ", "T")

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(withT)) {
    return `${withT}:00-05:00`
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(withT)) {
    return `${withT}-05:00`
  }

  return cleanValue
}

function formatSuggestions(suggestions?: string[]) {
  if (!suggestions || suggestions.length === 0) {
    return ""
  }

  const formatted = suggestions
    .map((slot) =>
      new Date(slot).toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Jamaica",
      })
    )
    .join(", ")

  return ` I have these available times: ${formatted}. Which one works for you?`
}

type BusinessAvailability = {
  day_of_week?: string | number | null
  open_time?: string | null
  close_time?: string | null
  is_closed?: boolean | null
}

type BusinessHoursValidation = {
  allowed: boolean
  message?: string
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

function normalizeDayOfWeek(value: unknown) {
  const text = String(value ?? "")
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

  return numericDays[text] || text
}

function getJamaicaDateParts(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Jamaica",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || ""

  const weekday = getPart("weekday")
  const hour = Number(getPart("hour"))
  const minute = Number(getPart("minute"))

  if (
    !weekday ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null
  }

  return {
    weekday,
    minutesFromMidnight: hour * 60 + minute,
  }
}

function timeToMinutes(value?: string | null) {
  if (!value) return null

  const match = value.match(/^(\d{1,2}):(\d{2})/)

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

function formatDatabaseTime(value?: string | null) {
  const minutes = timeToMinutes(value)

  if (minutes === null) {
    return value || "an unknown time"
  }

  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const suffix = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 || 12

  return `${hour12}:${String(minute).padStart(
    2,
    "0"
  )} ${suffix}`
}

async function validateBookingAgainstBusinessHours({
  businessId,
  bookingTime,
  serviceDurationMinutes,
}: {
  businessId: string
  bookingTime: string
  serviceDurationMinutes: number
}): Promise<BusinessHoursValidation> {
  const jamaicaDate =
    getJamaicaDateParts(bookingTime)

  if (!jamaicaDate) {
    return {
      allowed: false,
      message:
        "Sorry, I couldn't understand that booking date and time. Please send it again.",
    }
  }

  const { data, error } = await supabase
    .from("business_availability")
    .select(
      "day_of_week, open_time, close_time, is_closed"
    )
    .eq("business_id", businessId)

  if (error) {
    console.error(
      "BUSINESS HOURS LOOKUP ERROR:",
      error
    )

    return {
      allowed: false,
      message:
        "Sorry, I couldn't check the business hours right now. Please try again.",
    }
  }

  const availability =
    (data || []) as BusinessAvailability[]

  if (availability.length === 0) {
    console.warn(
      "NO BUSINESS AVAILABILITY FOUND:",
      businessId
    )

    return {
      allowed: false,
      message:
        "The business hours have not been set yet, so I can't confirm that appointment time.",
    }
  }

  const requestedDay =
    normalizeDayOfWeek(jamaicaDate.weekday)

  const dayAvailability = availability.find(
    (day) =>
      normalizeDayOfWeek(day.day_of_week) ===
      requestedDay
  )

  if (!dayAvailability) {
    return {
      allowed: false,
      message: `The business has not set hours for ${jamaicaDate.weekday}, so I can't confirm that appointment.`,
    }
  }

  if (dayAvailability.is_closed) {
    return {
      allowed: false,
      message: `Sorry, the business is closed on ${jamaicaDate.weekday}s. Please choose another day.`,
    }
  }

  const openMinutes = timeToMinutes(
    dayAvailability.open_time
  )

  const closeMinutes = timeToMinutes(
    dayAvailability.close_time
  )

  if (
    openMinutes === null ||
    closeMinutes === null
  ) {
    return {
      allowed: false,
      message: `The business hours for ${jamaicaDate.weekday} are incomplete, so I can't confirm that appointment time.`,
    }
  }

  const appointmentStartsAt =
    jamaicaDate.minutesFromMidnight

  const safeDuration = Math.max(
    1,
    Number(serviceDurationMinutes) || 30
  )

  const appointmentEndsAt =
    appointmentStartsAt + safeDuration

  if (appointmentStartsAt < openMinutes) {
    return {
      allowed: false,
      message: `That time is before opening. The business opens at ${formatDatabaseTime(
        dayAvailability.open_time
      )} on ${jamaicaDate.weekday}s.`,
    }
  }

  if (appointmentStartsAt >= closeMinutes) {
    return {
      allowed: false,
      message: `That time is after closing. The business is open from ${formatDatabaseTime(
        dayAvailability.open_time
      )} to ${formatDatabaseTime(
        dayAvailability.close_time
      )} on ${jamaicaDate.weekday}s.`,
    }
  }

  if (appointmentEndsAt > closeMinutes) {
    return {
      allowed: false,
      message: `That appointment would finish after closing. Please choose a time that allows the ${safeDuration}-minute service to finish by ${formatDatabaseTime(
        dayAvailability.close_time
      )}.`,
    }
  }

  return {
    allowed: true,
  }
}

async function saveMissingDetails({
  businessId,
  customerId,
  openBooking,
  service,
  bookingTime,
}: {
  businessId: string
  customerId: string
  openBooking: any
  service: string | null
  bookingTime: string | null
}) {
  if (openBooking) {
    return await updateBooking({
      businessId,
      customerId,
      bookingId: openBooking.id,
      updates: {
        service,
        booking_time: bookingTime,
        status: "missing_details",
      },
    })
  }

  return await createBooking({
    business_id: businessId,
    customer_id: customerId,
    service,
    booking_time: bookingTime,
    status: "missing_details",
  })
}

export async function saveBookingAndGetReply({
  businessId,
  customerId,
  openBooking,
  booking,
  isNewBookingRequest,
}: {
  businessId: string
  customerId: string
  openBooking: any
  booking: ExtractedBooking
  isNewBookingRequest: boolean
  userText: string
}) {
  if (openBooking) {
    const belongsToBusiness =
      openBooking.business_id === businessId &&
      openBooking.customer_id === customerId

    if (!belongsToBusiness) {
      console.error("OPEN BOOKING SECURITY BLOCKED:", openBooking.id)

      return "Sorry, I couldn't safely continue that booking. Please start again."
    }
  }

  if (booking.cancel_booking && openBooking) {
    await cancelBooking({
      businessId,
      customerId,
      bookingId: openBooking.id,
    })

    return "No problem, I've cancelled that booking request."
  }

  const service =
    booking.service ??
    (isNewBookingRequest ? null : openBooking?.service) ??
    null

  const bookingTime =
    booking.booking_time ??
    (isNewBookingRequest ? null : openBooking?.booking_time) ??
    null

  console.log("FINAL BOOKING TIME:", bookingTime)

  const hasRealTime =
    Boolean(bookingTime) &&
    !String(bookingTime).includes("00:00:00")

  if (!service) {
    await saveMissingDetails({
      businessId,
      customerId,
      openBooking,
      service,
      bookingTime,
    })

    return "Sure! What service would you like to book?"
  }

  const validService = await findServiceByName(
    businessId,
    service
  )

  if (!validService) {
    await saveMissingDetails({
      businessId,
      customerId,
      openBooking,
      service: null,
      bookingTime,
    })

    return `Sorry, we don't offer ${service}. Please choose one of the services the business provides.`
  }

  if (!bookingTime || !hasRealTime) {
    await saveMissingDetails({
      businessId,
      customerId,
      openBooking,
      service: validService.name,
      bookingTime,
    })

    return `Great. What date and time would you like for your ${validService.name}?`
  }

  const serviceDurationMinutes =
    Number(validService.duration_minutes) || 30

  const hoursValidation =
    await validateBookingAgainstBusinessHours({
      businessId,
      bookingTime,
      serviceDurationMinutes,
    })

  if (!hoursValidation.allowed) {
    await saveMissingDetails({
      businessId,
      customerId,
      openBooking,
      service: validService.name,
      bookingTime: null,
    })

    return (
      hoursValidation.message ||
      "That appointment time is outside the business hours. Please choose another time."
    )
  }

  if (openBooking) {
    await updateBooking({
      businessId,
      customerId,
      bookingId: openBooking.id,
      updates: {
        service: validService.name,
        booking_time: bookingTime,
        status: "missing_details",
      },
    })
  }

  const result = await createScheduledBooking({
    businessId,
    customerId,
    serviceName: validService.name,
    bookingTime,
  })

  if (!result.success) {
    return `${result.message}${formatSuggestions(result.suggestions)}`
  }

  if (openBooking) {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", openBooking.id)
      .eq("business_id", businessId)
      .eq("customer_id", customerId)
      .eq("status", "missing_details")

    if (error) {
      console.error("DELETE OPEN BOOKING ERROR:", error)
    }
  }

  return result.message
}