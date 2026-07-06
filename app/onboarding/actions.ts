"use server"

import { getCurrentBusiness } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

type ServiceInput = {
  name: string
  price: string
  duration: string
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export async function saveBusinessHours({
  openTime,
  closeTime,
  closedSunday,
}: {
  openTime: string
  closeTime: string
  closedSunday: boolean
}) {
  const business = await getCurrentBusiness()

  if (!business) {
    return {
      ok: false,
      error: "Business not found.",
    }
  }

  const supabase = await createClient()

  const { error: deleteError } = await supabase
    .from("business_availability")
    .delete()
    .eq("business_id", business.id)

  if (deleteError) {
    console.error("DELETE HOURS ERROR:", deleteError)

    return {
      ok: false,
      error: deleteError.message,
    }
  }

  const rows = days.map((day) => {
    const isSundayClosed =
      day === "Sunday" && closedSunday

    return {
      business_id: business.id,
      day_of_week: day,
      open_time: isSundayClosed ? null : openTime,
      close_time: isSundayClosed ? null : closeTime,
      is_closed: isSundayClosed,
      slot_duration: 30,
    }
  })

  const { error: insertError } = await supabase
    .from("business_availability")
    .insert(rows)

  if (insertError) {
    console.error("INSERT HOURS ERROR:", insertError)

    return {
      ok: false,
      error: insertError.message,
    }
  }

  return {
    ok: true,
  }
}

export async function saveBusinessServices({
  services,
}: {
  services: ServiceInput[]
}) {
  const business = await getCurrentBusiness()

  if (!business) {
    return {
      ok: false,
      error: "Business not found.",
    }
  }

  const supabase = await createClient()

  const cleanServices = services
    .filter((service) => service.name.trim())
    .map((service) => ({
      business_id: business.id,
      name: service.name.trim(),
      price: service.price ? Number(service.price) : null,
      duration_minutes: Number(service.duration || 30),
      is_active: true,
    }))

  if (cleanServices.length === 0) {
    return {
      ok: false,
      error: "Add at least one service.",
    }
  }

  const { error: deleteError } = await supabase
    .from("business_services")
    .delete()
    .eq("business_id", business.id)

  if (deleteError) {
    console.error("DELETE SERVICES ERROR:", deleteError)

    return {
      ok: false,
      error: deleteError.message,
    }
  }

  const { error: insertError } = await supabase
    .from("business_services")
    .insert(cleanServices)

  if (insertError) {
    console.error("INSERT SERVICES ERROR:", insertError)

    return {
      ok: false,
      error: insertError.message,
    }
  }

  return {
    ok: true,
  }
}