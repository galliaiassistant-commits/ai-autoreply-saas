import Link from "next/link"
import { getCurrentBusiness } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/PageHeader"
import IntegrationGrid from "@/components/integrations/IntegrationGrid"
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  PlugZap,
} from "lucide-react"

type IntegrationRecord = {
  id: string
  business_id: string
  provider: string
  connected: boolean | null
  phone_number?: string | null
  phone_number_id?: string | null
  business_account_id?: string | null
  display_phone_number?: string | null
  connection_method?: string | null
  verify_token?: string | null
  metadata?: any
  created_at?: string | null
  updated_at?: string | null
  last_connected_at?: string | null
  disconnected_at?: string | null
  human_takeover_enabled?: boolean | null
  human_takeover_until?: string | null
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
      display_phone_number,
      connection_method,
      verify_token,
      metadata,
      created_at,
      updated_at,
      last_connected_at,
      disconnected_at,
      human_takeover_enabled,
      human_takeover_until
    `)
    .eq("business_id", business.id)

  if (error) {
    console.error("INTEGRATIONS LOAD ERROR:", error)
  }

  const safeIntegrations =
    integrations?.map(normalizeIntegration) || []

  const connectedCount =
    safeIntegrations.filter((item) => item.connected).length

  const whatsappIntegration = safeIntegrations.find(
    (item) => item.provider === "whatsapp"
  )

  const whatsappConnected =
    whatsappIntegration?.connected === true

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

      <section className="mt-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
              <MessageCircle size={28} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  WhatsApp Business
                </h2>

                <span
                  className={
                    whatsappConnected
                      ? "inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400"
                      : "inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400"
                  }
                >
                  {whatsappConnected ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <PlugZap size={14} />
                  )}

                  {whatsappConnected
                    ? "Connected"
                    : "Setup needed"}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
  Connect a business WhatsApp number to Jhyro AI. Since Meta Embedded
  Signup is paused until business verification, you can use manual setup
  for now.
</p>

<Link
  href="/dashboard/integrations/whatsapp/manual"
  className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
>
  Use manual WhatsApp setup
</Link>

              {whatsappIntegration?.display_phone_number && (
                <p className="mt-3 text-sm font-semibold text-slate-300">
                  Connected number:{" "}
                  {whatsappIntegration.display_phone_number}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/integrations/whatsapp"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
          >
            {whatsappConnected
              ? "Manage WhatsApp"
              : "Connect WhatsApp"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

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