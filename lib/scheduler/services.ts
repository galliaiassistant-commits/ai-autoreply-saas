import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { SchedulerService } from "./types"

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(
      /\b(a|an|the|appointment|booking|book|service)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim()
}

export async function getBusinessServices(
  businessId: string
): Promise<SchedulerService[]> {
  const { data, error } =
    await supabase
      .from("business_services")
      .select("*")
      .eq(
        "business_id",
        businessId
      )
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      })

  if (error) {
    console.error(
      "GET BUSINESS SERVICES ERROR:",
      error
    )

    return []
  }

  console.log(
    "LOADED BUSINESS SERVICES:",
    {
      businessId,
      services:
        data?.map(
          (service) =>
            service.name
        ) || [],
    }
  )

  return data || []
}

export async function findServiceByName(
  businessId: string,
  serviceName: string
): Promise<SchedulerService | null> {
  const services =
    await getBusinessServices(
      businessId
    )

  const wanted =
    normalize(serviceName)

  if (!wanted) {
    console.log(
      "EMPTY SERVICE NAME:",
      serviceName
    )

    return null
  }

  const exactMatch =
    services.find(
      (service) =>
        normalize(
          service.name
        ) === wanted
    )

  if (exactMatch) {
    console.log(
      "EXACT SERVICE MATCH:",
      exactMatch.name
    )

    return exactMatch
  }

  const partialMatch =
    services.find(
      (service) => {
        const savedName =
          normalize(
            service.name
          )

        return (
          savedName.includes(
            wanted
          ) ||
          wanted.includes(
            savedName
          )
        )
      }
    )

  if (partialMatch) {
    console.log(
      "PARTIAL SERVICE MATCH:",
      partialMatch.name
    )

    return partialMatch
  }

  console.log(
    "SERVICE NOT FOUND:",
    serviceName
  )

  console.log(
    "NORMALIZED SERVICE:",
    wanted
  )

  console.log(
    "BUSINESS ID:",
    businessId
  )

  console.log(
    "AVAILABLE SERVICES:",
    services.map(
      (service) =>
        service.name
    )
  )

  return null
}