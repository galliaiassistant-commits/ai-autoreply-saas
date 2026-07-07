import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { SchedulerService } from "./types"

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export async function getBusinessServices(
  businessId: string
): Promise<SchedulerService[]> {
  const { data, error } = await supabase
    .from("business_services")
    .select("*")
    .eq("business_id", businessId)
    .neq("is_active", false)
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
  const services = await getBusinessServices(businessId)

  const wanted = normalize(serviceName)

  const exactMatch = services.find(
    (service) => normalize(service.name) === wanted
  )

  if (exactMatch) {
    return exactMatch
  }

  const partialMatch = services.find((service) => {
    const serviceNameClean = normalize(service.name)

    return (
      serviceNameClean.includes(wanted) ||
      wanted.includes(serviceNameClean)
    )
  })

  if (partialMatch) {
    return partialMatch
  }

  console.log("SERVICE NOT FOUND:", serviceName)
  console.log(
    "AVAILABLE SERVICES:",
    services.map((service) => service.name)
  )

  return null
}