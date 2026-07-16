import { createClient } from "@/lib/supabase/server"

export async function getCurrentBusiness() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (
      userError.name !==
      "AuthSessionMissingError"
    ) {
      console.error(
        "GET USER ERROR:",
        userError
      )
    }

    return null
  }

  if (!user) {
    return null
  }

  const defaultBusinessId =
    process.env.DEFAULT_BUSINESS_ID

  if (defaultBusinessId) {
    const {
      data: defaultBusiness,
      error: defaultError,
    } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", defaultBusinessId)
      .eq("owner_id", user.id)
      .maybeSingle()

    if (defaultError) {
      console.error(
        "GET DEFAULT BUSINESS ERROR:",
        defaultError
      )
    }

    if (defaultBusiness) {
      return defaultBusiness
    }
  }

  const { data: business, error } =
    await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

  if (error) {
    console.error(
      "GET CURRENT BUSINESS ERROR:",
      error
    )

    return null
  }

  return business
}