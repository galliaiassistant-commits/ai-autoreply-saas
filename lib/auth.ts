import { supabase } from "@/lib/supabase"

export async function getCurrentBusiness() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("GET CURRENT BUSINESS ERROR:", error)
    return null
  }

  return business
}