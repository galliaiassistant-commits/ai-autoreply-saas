import { supabase } from "@/lib/supabase"

export async function getOpenBooking(customerId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .in("status", ["missing_details", "pending", "confirmed"])
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
  }

  return data
}

export async function createBooking(
  booking: {
    business_id: string
    customer_id: string
    service: string | null
    booking_time: string | null
    status: string
  }
) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single()

  if (error) {
    console.error("CREATE BOOKING ERROR:", error)
  }

  return data
}