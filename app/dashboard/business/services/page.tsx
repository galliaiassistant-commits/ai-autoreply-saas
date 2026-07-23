import Link from "next/link"
import { redirect } from "next/navigation"
import { LockKeyhole } from "lucide-react"
import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/PageHeader"
import ServicesEditor from "./ServicesEditor"

type ServiceRow = {
  name: string
  price: string
  duration: string
}

export default async function BusinessServicesPage() {
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
    return (
      <div>
        <PageHeader
          title="Business Services"
          description="Manage the services Jhyro AI can offer to customers."
        />

        <section className="mt-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-950 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
            <LockKeyhole size={26} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            Pro feature
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Unlock Service Management
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Upgrade to Pro or Business
            to create services, set
            prices, configure appointment
            durations, and let Jhyro AI
            use your service catalogue.
          </p>

          <Link
            href="/dashboard/billing"
            className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Upgrade to Pro
          </Link>
        </section>
      </div>
    )
  }

  const supabase =
    await createClient()

  const {
    data: services,
    error,
  } = await supabase
    .from("business_services")
    .select(
      "name, price, duration_minutes"
    )
    .eq(
      "business_id",
      business.id
    )
    .order("created_at", {
      ascending: true,
    })

  if (error) {
    console.error(
      "LOAD BUSINESS SERVICES ERROR:",
      error
    )
  }

  const initialServices:
    ServiceRow[] =
    services?.map((service) => ({
      name: service.name || "",
      price:
        service.price === null ||
        service.price === undefined
          ? ""
          : String(service.price),
      duration:
        service.duration_minutes
          ? String(
              service.duration_minutes
            )
          : "30",
    })) || []

  return (
    <div>
      <PageHeader
        title="Business Services"
        description={`Edit services for ${
          business.business_name ||
          "this business"
        }.`}
      />

      <ServicesEditor
        initialServices={
          initialServices
        }
      />
    </div>
  )
}