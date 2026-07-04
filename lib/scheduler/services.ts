import { supabase } from "@/lib/supabase"
import { SchedulerService } from "./types"

export async function getBusinessServices(
  businessId: string
): Promise<SchedulerService[]> {
  const { data, error } = await supabase
    .from("business_services")
    .select("id, business_id, name, price, duration_minutes, is_active")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("GET BUSINESS SERVICES ERROR:", error)
    return []
  }

  return data || []
}

export async function findServiceByName(
  businessId: string,
  serviceName: string
): Promise<SchedulerService | null> {
  const cleanName = serviceName.trim().toLowerCase()

  const services = await getBusinessServices(businessId)

  const exactMatch = services.find(
    (service) => service.name.trim().toLowerCase() === cleanName
  )

  if (exactMatch) {
    return exactMatch
  }

  const partialMatch = services.find((service) => {
    const serviceLower = service.name.trim().toLowerCase()

    return (
      serviceLower.includes(cleanName) ||
      cleanName.includes(serviceLower)
    )
  })

  return partialMatch || null
}