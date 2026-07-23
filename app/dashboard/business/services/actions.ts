"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { createClient } from "@/lib/supabase/server"

type ServiceInput = {
  name: string
  price: string
  duration: string
}

export async function saveDashboardServices({
  services,
}: {
  services: ServiceInput[]
}) {
  const business =
    await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
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

  const cleanServices = services
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
        business_id: business.id,
        name: service.name.trim(),
        price:
          parsedPrice !== null &&
          Number.isFinite(parsedPrice) &&
          parsedPrice >= 0
            ? parsedPrice
            : null,
        duration_minutes:
          Number.isFinite(
            parsedDuration
          ) &&
          parsedDuration > 0
            ? parsedDuration
            : 30,
        is_active: true,
      }
    })

  if (cleanServices.length === 0) {
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
      "DELETE DASHBOARD SERVICES ERROR:",
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
      .insert(cleanServices)

  if (insertError) {
    console.error(
      "INSERT DASHBOARD SERVICES ERROR:",
      insertError
    )

    return {
      ok: false,
      error:
        insertError.message,
    }
  }

  revalidatePath(
    "/dashboard/business"
  )

  revalidatePath(
    "/dashboard/business/services"
  )

  revalidatePath("/dashboard")

  revalidatePath(
    "/dashboard/bookings"
  )

  return {
    ok: true,
  }
}