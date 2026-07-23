"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import {
  BUSINESS_COOKIE,
  getCurrentBusiness,
  getCurrentUser,
} from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const MAX_BUSINESS_WORKSPACES = 5

export async function switchBusinessWorkspace(
  businessId: string
) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
    }
  }

  const cleanBusinessId = businessId.trim()

  if (!cleanBusinessId) {
    return {
      ok: false,
      error: "Choose a business.",
    }
  }

  const supabase = await createClient()

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", cleanBusinessId)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("SWITCH WORKSPACE ERROR:", error)

    return {
      ok: false,
      error: "Could not switch businesses.",
    }
  }

  if (!business) {
    return {
      ok: false,
      error: "That business does not belong to your account.",
    }
  }

  const cookieStore = await cookies()

  cookieStore.set(BUSINESS_COOKIE, business.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  revalidatePath("/dashboard", "layout")

  return {
    ok: true,
  }
}

export async function createBusinessWorkspace(
  businessName: string
) {
  const user = await getCurrentUser()
  const currentBusiness = await getCurrentBusiness()

  if (!user || !currentBusiness) {
    return {
      ok: false,
      error: "You must be signed in.",
    }
  }

  const cleanBusinessName = businessName.trim()

  if (!cleanBusinessName) {
    return {
      ok: false,
      error: "Enter a business name.",
    }
  }

  const supabase = await createClient()

  const primaryBusinessId =
    currentBusiness.billing_business_id || currentBusiness.id

  const { data: primaryBusiness, error: primaryError } =
    await supabase
      .from("businesses")
      .select("*")
      .eq("id", primaryBusinessId)
      .eq("owner_id", user.id)
      .is("billing_business_id", null)
      .maybeSingle()

  if (primaryError) {
    console.error("LOAD PRIMARY WORKSPACE ERROR:", primaryError)

    return {
      ok: false,
      error: "Could not load the main business.",
    }
  }

  if (!primaryBusiness) {
    return {
      ok: false,
      error: "The main business was not found.",
    }
  }

  if (
    !businessCanUseFeature(
      primaryBusiness,
      "multiple_businesses"
    )
  ) {
    return {
      ok: false,
      error: "Multiple businesses require the Business plan.",
    }
  }

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("owner_id", user.id)
    .or(
      `id.eq.${primaryBusinessId},billing_business_id.eq.${primaryBusinessId}`
    )

  if (countError) {
    console.error("COUNT WORKSPACES ERROR:", countError)

    return {
      ok: false,
      error: "Could not check the workspace limit.",
    }
  }

  if ((count || 0) >= MAX_BUSINESS_WORKSPACES) {
    return {
      ok: false,
      error: "The Business plan supports up to 5 business workspaces.",
    }
  }

  // Re-check ownership and plan with the trusted server client immediately
  // before inserting. This prevents browser clients from writing billing data.
  const { data: trustedPrimary, error: trustedPrimaryError } =
    await supabaseAdmin
      .from("businesses")
      .select(`
        id,
        owner_id,
        billing_business_id,
        payment_provider,
        subscription_plan,
        subscription_status,
        subscription_current_period_end,
        last_payment_at,
        payment_due_at,
        billing_grace_ends_at,
        ai_suspended_at
      `)
      .eq("id", primaryBusinessId)
      .eq("owner_id", user.id)
      .is("billing_business_id", null)
      .maybeSingle()

  if (trustedPrimaryError || !trustedPrimary) {
    console.error(
      "TRUSTED PRIMARY WORKSPACE ERROR:",
      trustedPrimaryError
    )

    return {
      ok: false,
      error: "The main business could not be verified.",
    }
  }

  if (
    !businessCanUseFeature(
      trustedPrimary,
      "multiple_businesses"
    )
  ) {
    return {
      ok: false,
      error: "Multiple businesses require the Business plan.",
    }
  }

  const { data: newBusiness, error: createError } =
    await supabaseAdmin
      .from("businesses")
      .insert({
        owner_id: user.id,
        business_name: cleanBusinessName,
        billing_business_id: primaryBusinessId,
        payment_provider: trustedPrimary.payment_provider || null,
        subscription_plan:
          trustedPrimary.subscription_plan || "business",
        subscription_status:
          trustedPrimary.subscription_status || "inactive",
        subscription_current_period_end:
          trustedPrimary.subscription_current_period_end || null,
        last_payment_at: trustedPrimary.last_payment_at || null,
        payment_due_at: trustedPrimary.payment_due_at || null,
        billing_grace_ends_at:
          trustedPrimary.billing_grace_ends_at || null,
        ai_suspended_at: trustedPrimary.ai_suspended_at || null,
      })
      .select("id")
      .single()

  if (createError) {
    console.error("CREATE WORKSPACE ERROR:", createError)

    return {
      ok: false,
      error: createError.message,
    }
  }

  const cookieStore = await cookies()

  cookieStore.set(BUSINESS_COOKIE, newBusiness.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  revalidatePath("/dashboard", "layout")

  return {
    ok: true,
    businessId: newBusiness.id,
  }
}