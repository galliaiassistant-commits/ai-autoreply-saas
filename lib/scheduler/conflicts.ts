import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export async function hasBookingConflict({
  businessId,
  bookingTime,
  excludeBookingId,
}: {
  businessId: string
  bookingTime: string
  excludeBookingId?: string
}) {
  let query = supabase
    .from("bookings")
    .select("id")
    .eq("business_id", businessId)
    .eq("booking_time", bookingTime)
    .eq("status", "booked")

  if (excludeBookingId) {
    query = query.neq("id", excludeBookingId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error("BOOKING CONFLICT ERROR:", error)
    return true
  }

  return Boolean(data)
}