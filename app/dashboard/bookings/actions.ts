"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { createClient } from "@/lib/supabase/server"

export async function createManualBooking({
  serviceName,
  bookingTime,
}: {
  serviceName: string
  bookingTime: string
}) {
  const business =
    await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
  }

  const canUseBookings =
    businessCanUseFeature(
      business,
      "appointment_bookings"
    )

  if (!canUseBookings) {
    return {
      ok: false,
      error:
        "Appointment Bookings requires the Pro or Business plan.",
    }
  }

  const cleanServiceName =
    serviceName.trim()

  if (
    !cleanServiceName ||
    !bookingTime
  ) {
    return {
      ok: false,
      error:
        "Choose a service and time.",
    }
  }

  const requestedTime =
    new Date(bookingTime)

  if (
    Number.isNaN(
      requestedTime.getTime()
    )
  ) {
    return {
      ok: false,
      error:
        "Choose a valid booking time.",
    }
  }

  if (
    requestedTime.getTime() <=
    Date.now()
  ) {
    return {
      ok: false,
      error:
        "Bookings must be scheduled for a future time.",
    }
  }

  const normalizedBookingTime =
    requestedTime.toISOString()

  const supabase =
    await createClient()

  const {
    data: service,
    error: serviceError,
  } = await supabase
    .from("business_services")
    .select("id, name, is_active")
    .eq(
      "business_id",
      business.id
    )
    .eq("name", cleanServiceName)
    .maybeSingle()

  if (serviceError) {
    console.error(
      "MANUAL BOOKING SERVICE ERROR:",
      serviceError
    )

    return {
      ok: false,
      error:
        serviceError.message,
    }
  }

  if (
    !service ||
    service.is_active === false
  ) {
    return {
      ok: false,
      error:
        "Invalid service. Please choose an active service.",
    }
  }

  const {
    data: conflict,
    error: conflictError,
  } = await supabase
    .from("bookings")
    .select("id")
    .eq(
      "business_id",
      business.id
    )
    .eq(
      "booking_time",
      normalizedBookingTime
    )
    .eq("status", "booked")
    .maybeSingle()

  if (conflictError) {
    console.error(
      "MANUAL BOOKING CONFLICT ERROR:",
      conflictError
    )

    return {
      ok: false,
      error:
        conflictError.message,
    }
  }

  if (conflict) {
    return {
      ok: false,
      error:
        "That time is already booked.",
    }
  }

  const {
    data: existingCustomer,
    error: customerLoadError,
  } = await supabase
    .from("customers")
    .select("id")
    .eq(
      "business_id",
      business.id
    )
    .eq(
      "phone_number",
      "manual-booking"
    )
    .maybeSingle()

  if (customerLoadError) {
    console.error(
      "MANUAL CUSTOMER LOAD ERROR:",
      customerLoadError
    )

    return {
      ok: false,
      error:
        customerLoadError.message,
    }
  }

  let customerId =
    existingCustomer?.id

  if (!customerId) {
    const {
      data: newCustomer,
      error: customerCreateError,
    } = await supabase
      .from("customers")
      .insert({
        business_id:
          business.id,
        phone_number:
          "manual-booking",
        name: "Manual Booking",
      })
      .select("id")
      .single()

    if (customerCreateError) {
      console.error(
        "MANUAL CUSTOMER CREATE ERROR:",
        customerCreateError
      )

      return {
        ok: false,
        error:
          customerCreateError.message,
      }
    }

    customerId =
      newCustomer.id
  }

  const { error: bookingError } =
    await supabase
      .from("bookings")
      .insert({
        business_id:
          business.id,
        customer_id:
          customerId,
        service:
          service.name,
        booking_time:
          normalizedBookingTime,
        status: "booked",
      })

  if (bookingError) {
    console.error(
      "MANUAL BOOKING CREATE ERROR:",
      bookingError
    )

    return {
      ok: false,
      error:
        bookingError.message,
    }
  }

  revalidatePath(
    "/dashboard/bookings"
  )

  revalidatePath("/dashboard")

  revalidatePath(
    "/dashboard/analytics"
  )

  return {
    ok: true,
  }
}