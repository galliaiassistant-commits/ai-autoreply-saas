import { createClient } from "@/lib/supabase/server"

export async function getCurrentBusiness() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("GET USER ERROR:", userError)
    return null
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("GET CURRENT BUSINESS ERROR:", error)
    return null
  }

  return business
}