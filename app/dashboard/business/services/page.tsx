import { redirect } from "next/navigation"
import { getCurrentBusiness } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/PageHeader"
import ServicesEditor from "./ServicesEditor"

type ServiceRow = {
  name: string
  price: string
  duration: string
}

export default async function BusinessServicesPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
  }

  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from("business_services")
    .select("name, price, duration_minutes")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("LOAD BUSINESS SERVICES ERROR:", error)
  }

  const initialServices: ServiceRow[] =
    services?.map((service) => ({
      name: service.name || "",
      price:
        service.price === null || service.price === undefined
          ? ""
          : String(service.price),
      duration: service.duration_minutes
        ? String(service.duration_minutes)
        : "30",
    })) || []

  return (
    <div>
      <PageHeader
        title="Business Services"
        description={`Edit services for ${
          business.business_name || "this business"
        }.`}
      />

      <ServicesEditor initialServices={initialServices} />
    </div>
  )
}