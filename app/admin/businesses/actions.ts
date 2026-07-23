"use server"

import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const BILLING_BLOCKED_STATUSES = new Set([
  "cancelled",
  "expired",
  "suspended",
  "payment_due",
  "past_due",
])

const OVERRIDE_PLANS = new Set([
  "starter",
  "pro",
  "business",
])

const OVERRIDE_DURATIONS = new Set([
  "7",
  "30",
  "90",
  "365",
  "never",
])

export type AdminBusinessActionResult = {
  success: boolean
  message: string
}

export async function suspendBusinessAI(
  businessId: string
): Promise<AdminBusinessActionResult> {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    }
  }

  if (!UUID_PATTERN.test(businessId)) {
    return {
      success: false,
      message: "The business ID is invalid.",
    }
  }

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({ ai_suspended_at: new Date().toISOString() })
    .eq("id", businessId)

  if (error) {
    console.error("ADMIN SUSPEND BUSINESS ERROR:", error)

    return {
      success: false,
      message: "The business could not be suspended.",
    }
  }

  revalidateAdminPages(businessId)

  return {
    success: true,
    message: "AI replies have been suspended for this business.",
  }
}

export async function restoreBusinessAI(
  businessId: string
): Promise<AdminBusinessActionResult> {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    }
  }

  if (!UUID_PATTERN.test(businessId)) {
    return {
      success: false,
      message: "The business ID is invalid.",
    }
  }

  const { data: business, error: loadError } =
    await supabaseAdmin
      .from("businesses")
      .select("subscription_status")
      .eq("id", businessId)
      .maybeSingle()

  if (loadError || !business) {
    console.error("ADMIN RESTORE BUSINESS LOAD ERROR:", loadError)

    return {
      success: false,
      message: "The business account could not be found.",
    }
  }

  const subscriptionStatus = String(
    business.subscription_status || "inactive"
  ).toLowerCase()

  if (BILLING_BLOCKED_STATUSES.has(subscriptionStatus)) {
    return {
      success: false,
      message:
        "Resolve this business's billing status before restoring AI replies.",
    }
  }

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({ ai_suspended_at: null })
    .eq("id", businessId)

  if (error) {
    console.error("ADMIN RESTORE BUSINESS ERROR:", error)

    return {
      success: false,
      message: "The business could not be restored.",
    }
  }

  revalidateAdminPages(businessId)

  return {
    success: true,
    message: "AI replies have been restored for this business.",
  }
}

export async function setBusinessPlanOverride(
  formData: FormData
): Promise<void> {
  const admin = await getCurrentAdmin()

  if (!admin) {
    throw new Error("You are not authorized to perform this action.")
  }

  const businessId = String(formData.get("businessId") || "").trim()
  const plan = String(formData.get("plan") || "").trim().toLowerCase()
  const duration = String(formData.get("duration") || "30").trim()
  const reason = String(formData.get("reason") || "").trim().slice(0, 300)

  if (!UUID_PATTERN.test(businessId)) {
    throw new Error("The business ID is invalid.")
  }

  if (!OVERRIDE_PLANS.has(plan)) {
    throw new Error("Choose a valid override plan.")
  }

  if (!OVERRIDE_DURATIONS.has(duration)) {
    throw new Error("Choose a valid override duration.")
  }

  if (!reason) {
    throw new Error("Enter a reason for this internal override.")
  }

  const { data: business, error: loadError } =
    await supabaseAdmin
      .from("businesses")
      .select("id, billing_business_id")
      .eq("id", businessId)
      .maybeSingle()

  if (loadError || !business) {
    console.error("ADMIN OVERRIDE BUSINESS LOAD ERROR:", loadError)
    throw new Error("The business could not be found.")
  }

  const billingBusinessId = business.billing_business_id || business.id
  const now = new Date()
  const expiresAt =
    duration === "never"
      ? null
      : new Date(
          now.getTime() + Number(duration) * 24 * 60 * 60 * 1000
        ).toISOString()

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({
      plan_override: plan,
      plan_override_reason: reason,
      plan_override_expires_at: expiresAt,
      plan_override_set_at: now.toISOString(),
      plan_override_set_by: admin.id,
    })
    .eq("id", billingBusinessId)

  if (error) {
    console.error("ADMIN SET PLAN OVERRIDE ERROR:", error)
    throw new Error("The plan override could not be saved.")
  }

  revalidateAdminPages(businessId)
}

export async function clearBusinessPlanOverride(
  formData: FormData
): Promise<void> {
  const admin = await getCurrentAdmin()

  if (!admin) {
    throw new Error("You are not authorized to perform this action.")
  }

  const businessId = String(formData.get("businessId") || "").trim()

  if (!UUID_PATTERN.test(businessId)) {
    throw new Error("The business ID is invalid.")
  }

  const { data: business, error: loadError } =
    await supabaseAdmin
      .from("businesses")
      .select("id, billing_business_id")
      .eq("id", businessId)
      .maybeSingle()

  if (loadError || !business) {
    console.error("ADMIN CLEAR OVERRIDE LOAD ERROR:", loadError)
    throw new Error("The business could not be found.")
  }

  const billingBusinessId = business.billing_business_id || business.id

  const { error } = await supabaseAdmin
    .from("businesses")
    .update({
      plan_override: null,
      plan_override_reason: null,
      plan_override_expires_at: null,
      plan_override_set_at: null,
      plan_override_set_by: null,
    })
    .eq("id", billingBusinessId)

  if (error) {
    console.error("ADMIN CLEAR PLAN OVERRIDE ERROR:", error)
    throw new Error("The plan override could not be removed.")
  }

  revalidateAdminPages(businessId)
}

function revalidateAdminPages(businessId?: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/businesses")
  revalidatePath("/dashboard", "layout")

  if (businessId) {
    revalidatePath(`/admin/businesses/${businessId}`)
  }
}