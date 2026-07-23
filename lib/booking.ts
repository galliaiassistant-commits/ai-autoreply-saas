import OpenAI from "openai"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { businessCanUseFeature } from "@/lib/plans"
import {
  checkAvailability,
  createScheduledBooking,
  findServiceByName,
} from "@/lib/scheduler"
import { updateGoogleCalendarEvent } from "@/lib/google-calendar"

import { getBusinessTimezone } from "@/lib/scheduler/timezone"

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

async function businessCanUseBookings(
  businessId: string
) {
  const {
    data: business,
    error,
  } = await supabase
    .from("businesses")
    .select(`
      subscription_plan,
      subscription_status,
      plan_override,
      plan_override_expires_at
    `)
    .eq("id", businessId)
    .maybeSingle()

  if (error) {
    console.error(
      "BOOKING PLAN ACCESS ERROR:",
      error
    )

    return false
  }

  if (!business) {
    return false
  }

  return businessCanUseFeature(
    business,
    "appointment_bookings"
  )
}

export async function getOpenBooking(
  businessId: string,
  customerId: string,
  includeBooked = false
) {
  const hasAccess =
    await businessCanUseBookings(
      businessId
    )

  if (!hasAccess) {
    return null
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .in(
      "status",
      includeBooked
        ? ["missing_details", "booked"]
        : ["missing_details"]
    )
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
  const hasAccess =
    await businessCanUseBookings(
      businessId
    )

  if (!hasAccess) {
    return null
  }

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
  const hasAccess =
    await businessCanUseBookings(
      booking.business_id
    )

  if (!hasAccess) {
    return null
  }

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
  isNewBookingRequest: boolean,
  businessId: string
): Promise<ExtractedBooking> {
  const hasAccess =
    await businessCanUseBookings(
      businessId
    )

  if (!hasAccess) {
    return {
      is_booking: false,
    }
  }

  const businessTimezone =
    await getBusinessTimezone(businessId)

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
- The business timezone is ${businessTimezone}.
- Interpret today, tomorrow, weekdays, and relative dates in the business timezone.
- Return booking_time as local ISO date and time without Z or an offset: YYYY-MM-DDTHH:mm:ss.
- The server will convert that local business time into UTC safely.

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
${JSON.stringify(
  getOpenBookingExtractionContext(
    openBooking,
    businessTimezone
  )
)}

Current customer message:
${userText}

Current date and time in the business timezone (${businessTimezone}):
${getBusinessNowText(businessTimezone)}

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
      booking_time: normalizeBookingTime(
        parsed.booking_time,
        businessTimezone
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

function getBusinessNowText(
  timeZone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date())
}

function getOpenBookingExtractionContext(
  openBooking: any,
  timeZone: string
) {
  if (!openBooking) {
    return null
  }

  let localBookingTime: string | null = null

  if (openBooking.booking_time) {
    const date = new Date(openBooking.booking_time)

    if (!Number.isNaN(date.getTime())) {
      const parts = getZonedParts(date, timeZone)

      const pad = (value: number) =>
        String(value).padStart(2, "0")

      localBookingTime =
        `${parts.year}-${pad(parts.month)}-${pad(parts.day)}` +
        `T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`
    }
  }

  return {
    id: openBooking.id,
    service: openBooking.service || null,
    booking_time: localBookingTime,
    status:
      openBooking.status || "missing_details",
  }
}

function cleanJson(value: string) {
  return value
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()
}

function getZonedParts(
  date: Date,
  timeZone: string
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || ""

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
    second: Number(getPart("second")),
  }
}

function localDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  second,
  timeZone,
}: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  timeZone: string
}) {
  const targetAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  )

  let estimate = new Date(targetAsUtc)

  for (let attempt = 0; attempt < 4; attempt++) {
    const rendered = getZonedParts(
      estimate,
      timeZone
    )

    const renderedAsUtc = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second
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

function normalizeBookingTime(
  value: string | null | undefined,
  timeZone: string
) {
  if (!value) return null

  const cleanValue = value.trim()

  if (
    /z$/i.test(cleanValue) ||
    /[+-]\d{2}:\d{2}$/.test(cleanValue)
  ) {
    const instant = new Date(cleanValue)

    return Number.isNaN(instant.getTime())
      ? null
      : instant.toISOString()
  }

  const match = cleanValue
    .replace(" ", "T")
    .match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
    )

  if (!match) {
    return null
  }

  return localDateTimeToUtc({
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || "0"),
    timeZone,
  }).toISOString()
}

function formatSuggestions(
  suggestions: string[] | undefined,
  timeZone: string
) {
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
        timeZone,
      })
    )
    .join(", ")

  return ` I have these available times: ${formatted}. Which one works for you?`
}

type BusinessHoursValidation = {
  allowed: boolean
  message?: string
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
  const result = await checkAvailability({
    businessId,
    bookingTime,
    durationMinutes: serviceDurationMinutes,
  })

  return {
    allowed: result.available,
    message: result.reason,
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
  const hasAccess =
    await businessCanUseBookings(
      businessId
    )

  if (!hasAccess) {
    return null
  }

  if (openBooking?.status === "booked") {
    return openBooking
  }

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
  const hasAccess =
    await businessCanUseBookings(
      businessId
    )

  if (!hasAccess) {
    return "Online appointment booking is not currently available. Please contact the business directly for assistance."
  }

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
    openBooking?.service ??
    null

  const bookingTime =
    booking.booking_time ??
    openBooking?.booking_time ??
    null

  console.log("FINAL BOOKING TIME:", bookingTime)

  const hasRealTime =
    Boolean(bookingTime) &&
    !String(bookingTime).includes("00:00:00")

if (bookingTime && hasRealTime && !service) {
  const earlyAvailabilityCheck =
    await checkAvailability({
      businessId,
      bookingTime,
      durationMinutes: 1,
    })

  if (!earlyAvailabilityCheck.available) {
    await saveMissingDetails({
      businessId,
      customerId,
      openBooking,
      service: null,
      bookingTime: null,
    })

    return (
      earlyAvailabilityCheck.reason ||
      "That date or time is outside the business hours. Please choose another time."
    )
  }
}

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
      bookingTime,
    })

    return (
      hoursValidation.message ||
      "That appointment time is outside the business hours. Please choose another time."
    )
  }

  if (openBooking?.status === "booked") {
    const calendarResult =
      await updateGoogleCalendarEvent({
        businessId,
        bookingId: openBooking.id,
        customerId,
        serviceName: validService.name,
        bookingTime,
        durationMinutes:
          serviceDurationMinutes,
      })

    if (
      !calendarResult.synced &&
      !calendarResult.skipped
    ) {
      return "I could not update the Google Calendar event. Your original appointment has not been changed. Please try again."
    }

    const updatedBooking =
      await updateBooking({
        businessId,
        customerId,
        bookingId: openBooking.id,
        updates: {
          service: validService.name,
          booking_time: bookingTime,
          status: "booked",
        },
      })

    if (!updatedBooking) {
      return "I could not save the new appointment time. Please try again."
    }

    const businessTimezone =
      await getBusinessTimezone(
        businessId
      )

    const formattedTime =
      new Date(
        bookingTime
      ).toLocaleString("en-US", {
        timeZone:
          businessTimezone,
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

    return `Your ${validService.name} appointment has been rescheduled to ${formattedTime}.`
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
    const businessTimezone =
      await getBusinessTimezone(businessId)

    return `${result.message}${formatSuggestions(
      result.suggestions,
      businessTimezone
    )}`
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