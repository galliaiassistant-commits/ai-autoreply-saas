import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export const BUSINESS_COOKIE =
  "jhyro_selected_business_id"

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    if (
      error.name !==
      "AuthSessionMissingError"
    ) {
      console.error(
        "GET CURRENT USER ERROR:",
        error
      )
    }

    return null
  }

  return user || null
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const adminUserId =
    process.env
      .JHYRO_ADMIN_USER_ID
      ?.trim()

  if (!adminUserId) {
    console.error(
      "ADMIN AUTH ERROR: Missing JHYRO_ADMIN_USER_ID"
    )

    return null
  }

  if (user.id !== adminUserId) {
    return null
  }

  return user
}

export async function isCurrentUserAdmin() {
  const admin =
    await getCurrentAdmin()

  return Boolean(admin)
}

export async function getCurrentBusinesses() {
  const supabase =
    await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    if (
      userError &&
      userError.name !==
        "AuthSessionMissingError"
    ) {
      console.error(
        "GET BUSINESSES USER ERROR:",
        userError
      )
    }

    return []
  }

  const { data, error } =
    await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", {
        ascending: true,
      })

  if (error) {
    console.error(
      "GET CURRENT BUSINESSES ERROR:",
      error
    )

    return []
  }

  return data || []
}

export async function getCurrentBusiness() {
  const supabase =
    await createClient()

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

  const cookieStore =
    await cookies()

  const selectedBusinessId =
    cookieStore
      .get(BUSINESS_COOKIE)
      ?.value
      ?.trim()

  if (selectedBusinessId) {
    const {
      data: selectedBusiness,
      error: selectedError,
    } = await supabase
      .from("businesses")
      .select("*")
      .eq(
        "id",
        selectedBusinessId
      )
      .eq("owner_id", user.id)
      .maybeSingle()

    if (selectedError) {
      console.error(
        "GET SELECTED BUSINESS ERROR:",
        selectedError
      )
    }

    if (selectedBusiness) {
      return selectedBusiness
    }
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
        ascending: true,
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