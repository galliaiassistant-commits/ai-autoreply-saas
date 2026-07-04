import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import IntegrationGrid from "@/components/integrations/IntegrationGrid"
import { supabase } from "@/lib/supabase"

export default async function IntegrationsPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Integrations"
          description="Connect and manage the services that power Jhyro AI."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No business found for this account.
        </div>
      </div>
    )
  }

  const { data: integrations } = await supabase
    .from("business_integrations")
    .select("*")
    .eq("business_id", business.id)

  const connectedCount =
    integrations?.filter((item) => item.connected).length || 0

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect and manage the services that power Jhyro AI."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Stat label="Connected" value={connectedCount} />
        <Stat label="Available" value={8} />
        <Stat label="Health" value={connectedCount > 0 ? "Good" : "Setup"} />
      </div>

      <div className="mt-10">
        <IntegrationGrid
          businessId={business.id}
          records={integrations || []}
        />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}