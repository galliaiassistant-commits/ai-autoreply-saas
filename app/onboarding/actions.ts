"use server"

import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { createClient } from "@/lib/supabase/server"

type ServiceInput = {
  name: string
  price: string
  duration: string
}

type BusinessHourInput = {
  day: string
  openTime: string
  closeTime: string
  closed: boolean
}


export async function saveBusinessHours({
  hours,
}: {
  hours: BusinessHourInput[]
}) {
  const business =
    await getCurrentBusiness()

  if (!business) {
    return {
      ok: false,
      error: "Business not found.",
    }
  }


  if (!hours || hours.length === 0) {
    return {
      ok: false,
      error: "No business hours provided.",
    }
  }


  const supabase =
    await createClient()



  const { error: deleteError } =
    await supabase
      .from("business_availability")
      .delete()
      .eq(
        "business_id",
        business.id
      )


  if (deleteError) {
    console.error(
      "DELETE HOURS ERROR:",
      deleteError
    )

    return {
      ok: false,
      error: deleteError.message,
    }
  }



  const rows =
    hours.map((item) => ({
      business_id:
        business.id,

      day_of_week:
        item.day,

      open_time:
        item.closed
          ? null
          : item.openTime,

      close_time:
        item.closed
          ? null
          : item.closeTime,

      is_closed:
        item.closed,

      slot_duration: 30,
    }))



  const { error: insertError } =
    await supabase
      .from("business_availability")
      .insert(rows)



  if (insertError) {
    console.error(
      "INSERT HOURS ERROR:",
      insertError
    )

    return {
      ok: false,
      error: insertError.message,
    }
  }



  const summary =
    hours
      .map((item) =>
        item.closed
          ? `${item.day}: Closed`
          : `${item.day}: ${item.openTime} - ${item.closeTime}`
      )
      .join("\n")



  const { error: businessUpdateError } =
    await supabase
      .from("businesses")
      .update({
        hours: summary,
      })
      .eq(
        "id",
        business.id
      )



  if (businessUpdateError) {
    console.error(
      "UPDATE BUSINESS HOURS ERROR:",
      businessUpdateError
    )

    return {
      ok: false,
      error: businessUpdateError.message,
    }
  }



  return {
    ok: true,
  }
}





export async function saveBusinessServices({
  services,
}: {
  services: ServiceInput[]
}) {
  const business =
    await getCurrentBusiness()


  if (!business) {
    return {
      ok: false,
      error:
        "Business not found.",
    }
  }



  const canManageServices =
    businessCanUseFeature(
      business,
      "service_management"
    )


  if (!canManageServices) {
    return {
      ok: false,
      error:
        "Service Management requires the Pro or Business plan.",
    }
  }



  const cleanServices =
    services
      .filter(
        (service) =>
          service.name.trim()
      )
      .map((service) => {

        const parsedPrice =
          service.price
            ? Number(service.price)
            : null


        const parsedDuration =
          Number(
            service.duration || 30
          )


        return {
          business_id:
            business.id,

          name:
            service.name.trim(),

          price:
            parsedPrice !== null &&
            Number.isFinite(parsedPrice) &&
            parsedPrice >= 0
              ? parsedPrice
              : null,

          duration_minutes:
            Number.isFinite(parsedDuration) &&
            parsedDuration > 0
              ? parsedDuration
              : 30,

          is_active: true,
        }
      })



  if (
    cleanServices.length === 0
  ) {
    return {
      ok: false,
      error:
        "Add at least one service.",
    }
  }



  const supabase =
    await createClient()



  const { error: deleteError } =
    await supabase
      .from("business_services")
      .delete()
      .eq(
        "business_id",
        business.id
      )


  if (deleteError) {
    console.error(
      "DELETE SERVICES ERROR:",
      deleteError
    )

    return {
      ok: false,
      error:
        deleteError.message,
    }
  }



  const { error: insertError } =
    await supabase
      .from("business_services")
      .insert(
        cleanServices
      )



  if (insertError) {
    console.error(
      "INSERT SERVICES ERROR:",
      insertError
    )

    return {
      ok: false,
      error:
        insertError.message,
    }
  }



  return {
    ok: true,
  }
}