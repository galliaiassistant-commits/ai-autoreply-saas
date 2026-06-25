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