import { supabase } from "@/lib/supabase"

export async function getCustomerMemoryText(
  customerId: string
) {
  const { data, error } = await supabase
    .from("customer_memory")
    .select("type, content")
    .eq("customer_id", customerId)

  if (error) {
    console.error("CUSTOMER MEMORY ERROR:", error)
  }

  return (
    data
      ?.map((m) => `${m.type}: ${m.content}`)
      .join("\n") || ""
  )
}