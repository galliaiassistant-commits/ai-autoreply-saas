import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { checkAvailability } from "./availability"
import { findNextAvailableSlots } from "./slotGenerator"
import { findServiceByName } from "./services"
import {
  CreateBookingInput,
  CreateBookingResult,
} from "./types"

function formatBookingTime(bookingTime: string) {
  return new Date(bookingTime).toLocaleString("en-US", {
    timeZone: "America/Jamaica",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export async function createScheduledBooking({
  businessId,
  customerId,
  serviceName,
  bookingTime,
}: CreateBookingInput): Promise<CreateBookingResult> {
  const service = await findServiceByName(
    businessId,
    serviceName
  )

  if (!service) {
    return {
      success: false,
      message: "Sorry, that service is not available.",
      suggestions: [],
    }
  }

  console.log("CREATE BOOKING TIME RAW:", bookingTime)
  console.log(
    "CREATE BOOKING TIME JAMAICA:",
    formatBookingTime(bookingTime)
  )

  const availability = await checkAvailability({
    businessId,
    bookingTime,
  })

  if (!availability.available) {
    const suggestions = await findNextAvailableSlots({
      businessId,
      fromDate: new Date(bookingTime),
      limit: 3,
    })

    return {
      success: false,
      message:
        availability.reason ||
        "That time is not available.",
      suggestions,
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service: service.name,
      booking_time: bookingTime,
      status: "booked",
    })
    .select()
    .single()

  if (error) {
    console.error("CREATE SCHEDULED BOOKING ERROR:", error)

    return {
      success: false,
      message: "I could not save that booking. Please try again.",
      suggestions: [],
    }
  }

  const formattedTime = formatBookingTime(bookingTime)

  return {
    success: true,
    message: `You're booked for ${service.name} on ${formattedTime}.`,
    booking: data,
    suggestions: [],
  }
}