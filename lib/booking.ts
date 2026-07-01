import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

type BookingInput = {
  business_id: string
  customer_id: string
  service: string | null
  booking_time: string | null
  status: string
}

export async function getOpenBooking(customerId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .in("status", ["missing_details"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("OPEN BOOKING ERROR:", error)
  }

  return data
}

export async function updateBooking(
  bookingId: string,
  updates: {
    service?: string | null
    booking_time?: string | null
    status?: string
  }
) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
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
    .insert(booking)
    .select()
    .single()

  if (error) {
    console.error("CREATE BOOKING ERROR:", error)
    return null
  }

  return data
}

export async function extractBooking(
  openai: OpenAI,
  userText: string,
  openBooking: any,
  isNewBookingRequest: boolean
) {
  const bookingExtract = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You extract booking intent and booking details from customer messages.

Return ONLY valid JSON.

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
- If customer asks to change, move, update, switch, or reschedule the booking date/time, overwrite existing booking_time with the new date/time.
- If customer gives only a new date and the open booking already has a time, keep the existing time but change the date.
- If customer gives only a new time and the open booking already has a date, keep the existing date but change the time.
- If customer mentions a day of the week such as Sunday, Monday, Tuesday, etc., include it in "requested_day".

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

  try {
    return JSON.parse(
      bookingExtract.choices[0].message.content || "{}"
    )
  } catch {
    return { is_booking: false }
  }
}

function getClosedDay({
  userText,
  requestedDay,
  bookingTime,
  hoursText,
}: {
  userText: string
  requestedDay?: string | null
  bookingTime?: string | null
  hoursText: string
}) {
  const text = `${userText} ${requestedDay || ""} ${bookingTime || ""}`.toLowerCase()
  const hours = hoursText.toLowerCase()

  const mentionsSunday =
    text.includes("sunday") || text.includes("sun")

  const closedOnSunday = !hours.includes("sunday")

  if (mentionsSunday && closedOnSunday) {
    return "Sunday"
  }

  if (bookingTime && !String(bookingTime).includes("00:00:00")) {
    const date = new Date(bookingTime)

    const day = date.toLocaleDateString("en-US", {
      weekday: "long",
    })

    if (day === "Sunday" && closedOnSunday) {
      return "Sunday"
    }
  }

  return null
}

async function isTimeAlreadyBooked({
  businessId,
  bookingTime,
  openBookingId,
}: {
  businessId: string
  bookingTime: string | null
  openBookingId?: string | null
}) {
  if (!bookingTime) return false

  const requested = new Date(bookingTime)

  const start = new Date(requested)
  start.setMinutes(requested.getMinutes() - 1)

  const end = new Date(requested)
  end.setMinutes(requested.getMinutes() + 1)

  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_time, status")
    .eq("business_id", businessId)
    .gte("booking_time", start.toISOString())
    .lte("booking_time", end.toISOString())
    .eq("status", "booked")
    .maybeSingle()

  if (error) {
    console.error("DOUBLE BOOKING CHECK ERROR:", error)
    return false
  }

  if (!data) return false

  return data.id !== openBookingId
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
  booking: any
  isNewBookingRequest: boolean
  userText: string
}) {
  const service =
    booking.service ??
    (isNewBookingRequest ? null : openBooking?.service) ??
    null

  const bookingTime =
    booking.booking_time ??
    (isNewBookingRequest ? null : openBooking?.booking_time) ??
    null

  const hasRealTime =
    bookingTime &&
    !String(bookingTime).includes("00:00:00")

  const { data: business } = await supabase
    .from("businesses")
    .select("hours")
    .eq("id", businessId)
    .maybeSingle()

  const hoursText =
    business?.hours || "Monday to Saturday, 9 AM to 6 PM"

  const closedDay = getClosedDay({
    userText,
    requestedDay: booking.requested_day,
    bookingTime,
    hoursText,
  })

  if (closedDay) {
    return `Sorry, we're closed on ${closedDay}s. Our opening hours are ${hoursText}. What day would you like instead?`
  }

  if (!service) {
    if (openBooking) {
      await updateBooking(openBooking.id, {
        service,
        booking_time: bookingTime,
        status: "missing_details",
      })
    } else {
      await createBooking({
        business_id: businessId,
        customer_id: customerId,
        service,
        booking_time: bookingTime,
        status: "missing_details",
      })
    }

    return "Sure! What service would you like to book?"
  }

  if (!bookingTime || !hasRealTime) {
    if (openBooking) {
      await updateBooking(openBooking.id, {
        service,
        booking_time: bookingTime,
        status: "missing_details",
      })
    } else {
      await createBooking({
        business_id: businessId,
        customer_id: customerId,
        service,
        booking_time: bookingTime,
        status: "missing_details",
      })
    }

    return `Great. What date and time would you like for your ${service}?`
  }

  const alreadyBooked = await isTimeAlreadyBooked({
    businessId,
    bookingTime,
    openBookingId: openBooking?.id,
  })

  if (alreadyBooked) {
    return "Sorry, that time is already booked. What other time works for you?"
  }

  if (openBooking) {
    const updated = await updateBooking(openBooking.id, {
      service,
      booking_time: bookingTime,
      status: "booked",
    })

    if (!updated) {
      return "Sorry, I couldn't save that booking. Please try another time."
    }
  } else {
    const created = await createBooking({
      business_id: businessId,
      customer_id: customerId,
      service,
      booking_time: bookingTime,
      status: "booked",
    })

    if (!created) {
      return "Sorry, that time may already be booked. What other time works for you?"
    }
  }

  return `You're booked for ${service} on ${bookingTime}.`
}