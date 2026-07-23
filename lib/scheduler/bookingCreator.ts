import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { createGoogleCalendarEvent } from "@/lib/google-calendar"
import { businessCanUseFeature } from "@/lib/plans"
import { checkAvailability } from "./availability"
import { findNextAvailableSlots } from "./slotGenerator"
import { findServiceByName } from "./services"
import { getBusinessTimezone } from "./timezone"
import {
  CreateBookingInput,
  CreateBookingResult,
} from "./types"

async function businessCanAcceptBookings(
  businessId: string
) {
  const { data: business, error } = await supabase
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
    console.error("BOOKING PLAN ACCESS CHECK ERROR:", error)
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

async function formatBookingTime({
  businessId,
  bookingTime,
}: {
  businessId: string
  bookingTime: string
}) {
  const timeZone = await getBusinessTimezone(businessId)

  return new Date(bookingTime).toLocaleString("en-US", {
    timeZone,
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
  const canAcceptBookings =
    await businessCanAcceptBookings(businessId)

  if (!canAcceptBookings) {
    return {
      success: false,
      message:
        "Online appointment booking is not currently available. Please contact the business directly for assistance.",
      suggestions: [],
    }
  }

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

  const durationMinutes =
    Number(service.duration_minutes) || 30

  const availability = await checkAvailability({
    businessId,
    bookingTime,
    durationMinutes,
  })

  if (!availability.available) {
    const suggestions = await findNextAvailableSlots({
      businessId,
      fromDate: new Date(bookingTime),
      durationMinutes,
      limit: 3,
    })

    return {
      success: false,
      message:
        availability.reason || "That time is not available.",
      suggestions,
    }
  }

  const normalizedBookingTime = new Date(
    bookingTime
  ).toISOString()

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service: service.name,
      booking_time: normalizedBookingTime,
      status: "booked",
    })
    .select()
    .single()

  if (error) {
    console.error("CREATE SCHEDULED BOOKING ERROR:", error)

    return {
      success: false,
      message:
        "I could not save that booking. Please try again.",
      suggestions: [],
    }
  }

  const calendarSync = await createGoogleCalendarEvent({
    businessId,
    bookingId: data.id,
    customerId,
    serviceName: service.name,
    bookingTime: normalizedBookingTime,
    durationMinutes,
  })

  if (!calendarSync.synced && !calendarSync.skipped) {
    console.error(
      "BOOKING SAVED BUT GOOGLE CALENDAR SYNC FAILED:",
      calendarSync.error
    )
  }

  const formattedTime = await formatBookingTime({
    businessId,
    bookingTime: normalizedBookingTime,
  })

  const savedBooking = calendarSync.eventId
    ? {
        ...data,
        google_calendar_event_id: calendarSync.eventId,
        google_calendar_id: calendarSync.calendarId,
        google_calendar_synced_at: new Date().toISOString(),
        google_calendar_sync_error: null,
      }
    : data

  return {
    success: true,
    message: `You're booked for ${service.name} on ${formattedTime}.`,
    booking: savedBooking,
    suggestions: [],
  }
}