"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentBusiness } from "@/lib/auth"
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
  const business = await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
  }

  const supabase = await createClient()

  const cleanServices = services
    .filter((service) => service.name.trim())
    .map((service) => ({
      business_id: business.id,
      name: service.name.trim(),
      price: service.price ? Number(service.price) : null,
      duration_minutes: Number(service.duration || 30),
      is_active: true,
    }))

  if (cleanServices.length === 0) {
    return {
      ok: false,
      error: "Add at least one service.",
    }
  }

  const { error: deleteError } = await supabase
    .from("business_services")
    .delete()
    .eq("business_id", business.id)

  if (deleteError) {
    console.error("DELETE DASHBOARD SERVICES ERROR:", deleteError)

    return {
      ok: false,
      error: deleteError.message,
    }
  }

  const { error: insertError } = await supabase
    .from("business_services")
    .insert(cleanServices)

  if (insertError) {
    console.error("INSERT DASHBOARD SERVICES ERROR:", insertError)

    return {
      ok: false,
      error: insertError.message,
    }
  }

  revalidatePath("/dashboard/business")
  revalidatePath("/dashboard/business/services")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")

  return {
    ok: true,
  }
}