import { getCurrentBusiness } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/PageHeader"
import IntegrationGrid from "@/components/integrations/IntegrationGrid"

type IntegrationRecord = {
  id: string
  business_id: string
  provider: string
  connected: boolean | null
  phone_number?: string | null
  phone_number_id?: string | null
  business_account_id?: string | null
  verify_token?: string | null
  metadata?: any
  created_at?: string | null
  updated_at?: string | null
}

function isRealConnected(record: IntegrationRecord) {
  if (record.provider === "whatsapp") {
    return (
      record.connected === true &&
      Boolean(record.phone_number_id) &&
      Boolean(record.business_account_id)
    )
  }

  return record.connected === true
}

function normalizeIntegration(record: IntegrationRecord) {
  return {
    ...record,
    connected: isRealConnected(record),
  }
}

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

  const supabase = await createClient()

  const { data: integrations, error } = await supabase
    .from("business_integrations")
    .select(`
      id,
      business_id,
      provider,
      connected,
      phone_number,
      phone_number_id,
      business_account_id,
      verify_token,
      metadata,
      created_at,
      updated_at
    `)
    .eq("business_id", business.id)

  if (error) {
    console.error("INTEGRATIONS LOAD ERROR:", error)
  }

  const safeIntegrations =
    integrations?.map(normalizeIntegration) || []

  const connectedCount =
    safeIntegrations.filter((item) => item.connected).length

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect and manage the services that power Jhyro AI."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Stat label="Connected" value={connectedCount} />
        <Stat label="Available" value={8} />
        <Stat
          label="Health"
          value={connectedCount > 0 ? "Good" : "Setup"}
        />
      </div>

      <div className="mt-10">
        <IntegrationGrid
          businessId={business.id}
          records={safeIntegrations}
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
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}