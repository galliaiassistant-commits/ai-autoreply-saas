export type PlanName =
  | "free"
  | "starter"
  | "pro"
  | "business"

export type PaidPlanName = Exclude<PlanName, "free">

export type PlanFeature =
  | "basic_dashboard"
  | "whatsapp_ai"
  | "conversations"
  | "customer_profiles"
  | "appointment_bookings"
  | "customer_memory"
  | "business_knowledge"
  | "service_management"
  | "google_calendar"
  | "multiple_businesses"
  | "advanced_automation"

export type BusinessPlanAccessInput = {
  subscription_plan?: unknown
  plan?: unknown
  subscription_status?: unknown
  billing_status?: unknown
  plan_override?: unknown
  plan_override_expires_at?: unknown
}

export const PLAN_LABELS: Record<PlanName, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
}

export const PLAN_FEATURES: Record<
  PlanName,
  readonly PlanFeature[]
> = {
  free: ["basic_dashboard"],
  starter: [
    "basic_dashboard",
    "whatsapp_ai",
    "conversations",
    "customer_profiles",
  ],
  pro: [
    "basic_dashboard",
    "whatsapp_ai",
    "conversations",
    "customer_profiles",
    "appointment_bookings",
    "customer_memory",
    "business_knowledge",
    "service_management",
    "google_calendar",
  ],
  business: [
    "basic_dashboard",
    "whatsapp_ai",
    "conversations",
    "customer_profiles",
    "appointment_bookings",
    "customer_memory",
    "business_knowledge",
    "service_management",
    "google_calendar",
    "multiple_businesses",
    "advanced_automation",
  ],
}

const USABLE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "payment_due",
  "past_due",
])

const FEATURE_MINIMUM_PLAN: Record<PlanFeature, PlanName> = {
  basic_dashboard: "free",
  whatsapp_ai: "starter",
  conversations: "starter",
  customer_profiles: "starter",
  appointment_bookings: "pro",
  customer_memory: "pro",
  business_knowledge: "pro",
  service_management: "pro",
  google_calendar: "pro",
  multiple_businesses: "business",
  advanced_automation: "business",
}

export function normalizePlan(value: unknown): PlanName {
  const plan = String(value || "free")
    .trim()
    .toLowerCase()

  if (
    plan === "starter" ||
    plan === "pro" ||
    plan === "business"
  ) {
    return plan
  }

  return "free"
}

export function normalizeSubscriptionStatus(value: unknown) {
  return String(value || "trialing")
    .trim()
    .toLowerCase()
}

export function getActivePlanOverride(
  business: BusinessPlanAccessInput
): PaidPlanName | null {
  const rawOverride = String(business.plan_override || "")
    .trim()
    .toLowerCase()

  if (
    rawOverride !== "starter" &&
    rawOverride !== "pro" &&
    rawOverride !== "business"
  ) {
    return null
  }

  const rawExpiration = business.plan_override_expires_at

  if (rawExpiration) {
    const expiration = new Date(String(rawExpiration))

    if (
      Number.isNaN(expiration.getTime()) ||
      expiration.getTime() <= Date.now()
    ) {
      return null
    }
  }

  return rawOverride
}

export function hasActivePlanOverride(
  business: BusinessPlanAccessInput
) {
  return getActivePlanOverride(business) !== null
}

export function getPayPalPlan(
  business: BusinessPlanAccessInput
) {
  return normalizePlan(
    business.subscription_plan || business.plan
  )
}

export function getBusinessPlan(
  business: BusinessPlanAccessInput
) {
  return getActivePlanOverride(business) || getPayPalPlan(business)
}

export function getBusinessSubscriptionStatus(
  business: BusinessPlanAccessInput
) {
  return normalizeSubscriptionStatus(
    business.subscription_status || business.billing_status
  )
}

export function isSubscriptionUsable(status: unknown) {
  return USABLE_SUBSCRIPTION_STATUSES.has(
    normalizeSubscriptionStatus(status)
  )
}

export function planIncludesFeature(
  plan: PlanName,
  feature: PlanFeature
) {
  return PLAN_FEATURES[plan].includes(feature)
}

export function businessCanUseFeature(
  business: BusinessPlanAccessInput,
  feature: PlanFeature
) {
  if (feature === "basic_dashboard") {
    return true
  }

  const override = getActivePlanOverride(business)

  if (override) {
    return planIncludesFeature(override, feature)
  }

  const status = getBusinessSubscriptionStatus(business)

  if (!isSubscriptionUsable(status)) {
    return false
  }

  return planIncludesFeature(getPayPalPlan(business), feature)
}

export function getMinimumPlanForFeature(
  feature: PlanFeature
) {
  return FEATURE_MINIMUM_PLAN[feature]
}

export function getMinimumPlanLabel(
  feature: PlanFeature
) {
  return PLAN_LABELS[getMinimumPlanForFeature(feature)]
}

export function getPlanFeatures(plan: unknown) {
  return PLAN_FEATURES[normalizePlan(plan)]
}