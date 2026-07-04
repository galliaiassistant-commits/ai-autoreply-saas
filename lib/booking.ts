import OpenAI from "openai"
import { supabase } from "@/lib/supabase"
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

Today's date:
${new Date().toISOString()}

Merge the customer message with the existing booking.
Preserve existing booking information unless the customer changes it.
        `,
      },
    ],
  })

  const raw = bookingExtract.choices[0].message.content || "{}"

  try {
    return JSON.parse(cleanJson(raw))
  } catch (error) {
    console.error("BOOKING JSON PARSE ERROR:", error)
    console.error("RAW BOOKING JSON:", raw)

    return {
      is_booking: false,
    }
  }
}

function cleanJson(value: string) {
  return value
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()
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
      })
    )
    .join(", ")

  return ` I have these available times: ${formatted}. Which one works for you?`
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
  userText,
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