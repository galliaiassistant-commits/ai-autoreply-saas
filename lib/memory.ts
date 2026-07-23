import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { businessCanUseFeature } from "@/lib/plans"

async function canUseCustomerMemory(
  customerId: string
) {
  const {
    data: customer,
    error: customerError,
  } = await supabase
    .from("customers")
    .select("business_id")
    .eq("id", customerId)
    .maybeSingle()

  if (customerError) {
    console.error(
      "CUSTOMER MEMORY BUSINESS LOOKUP ERROR:",
      customerError
    )

    return false
  }

  if (!customer?.business_id) {
    return false
  }

  const {
    data: business,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(`
      subscription_plan,
      subscription_status
    `)
    .eq(
      "id",
      customer.business_id
    )
    .maybeSingle()

  if (businessError) {
    console.error(
      "CUSTOMER MEMORY PLAN ACCESS ERROR:",
      businessError
    )

    return false
  }

  if (!business) {
    return false
  }

  return businessCanUseFeature(
    business,
    "customer_memory"
  )
}

export async function getCustomerMemoryText(
  customerId: string
) {
  const canUseMemory =
    await canUseCustomerMemory(
      customerId
    )

  if (!canUseMemory) {
    return ""
  }

  const { data, error } =
    await supabase
      .from("customer_memory")
      .select("type, content")
      .eq(
        "customer_id",
        customerId
      )

  if (error) {
    console.error(
      "CUSTOMER MEMORY ERROR:",
      error
    )

    return ""
  }

  return (
    data
      ?.map(
        (memory) =>
          `${memory.type}: ${memory.content}`
      )
      .join("\n") || ""
  )
}