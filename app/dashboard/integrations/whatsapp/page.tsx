import Link from "next/link"
import { getCurrentBusiness } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PlugZap,
  Phone,
  ArrowLeft,
} from "lucide-react"

export default async function WhatsAppConnectionPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Connect WhatsApp"
          description="Connect a business WhatsApp number to Jhyro AI."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No business found for this account.
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: integration } = await supabase
    .from("business_integrations")
    .select(
      "id, provider, connected, phone_number_id, business_account_id, display_phone_number, connection_method, last_connected_at, disconnected_at, human_takeover_enabled, human_takeover_until"
    )
    .eq("business_id", business.id)
    .eq("provider", "whatsapp")
    .maybeSingle()

  const isConnected =
    integration?.connected === true &&
    Boolean(integration.phone_number_id) &&
    Boolean(integration.business_account_id)

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/integrations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to integrations
        </Link>
      </div>

      <PageHeader
        title="Connect WhatsApp"
        description="Let a business connect its own WhatsApp number to Jhyro AI."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
                <MessageCircle size={30} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  WhatsApp Business
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Connect a customer’s WhatsApp Business account securely.
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-slate-400">
              Businesses should not send you permanent access tokens manually.
              They will authorize Jhyro AI through Meta Embedded Signup, and
              Jhyro AI will store the connection securely for routing messages.
            </p>
          </div>

          <div
            className={
              isConnected
                ? "rounded-2xl border border-green-500/30 bg-green-500/10 p-5"
                : "rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5"
            }
          >
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle2 className="text-green-400" size={24} />
              ) : (
                <AlertCircle className="text-yellow-400" size={24} />
              )}

              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p
                  className={
                    isConnected
                      ? "font-bold text-green-400"
                      : "font-bold text-yellow-400"
                  }
                >
                  {isConnected ? "Connected" : "Not Connected"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatusCard
          title="Connection"
          value={isConnected ? "Ready" : "Setup Needed"}
          icon={<PlugZap size={20} />}
        />

        <StatusCard
          title="Phone Number ID"
          value={integration?.phone_number_id || "Missing"}
          icon={<Phone size={20} />}
        />

        <StatusCard
          title="Security"
          value="Token hidden"
          icon={<ShieldCheck size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Connection Details
          </h2>

          <div className="mt-6 space-y-4">
            <InfoRow
              label="Business"
              value={
                business.business_name ||
                business.name ||
                "Unnamed Business"
              }
            />

            <InfoRow
              label="Display Phone"
              value={integration?.display_phone_number || "Not connected"}
            />

            <InfoRow
              label="Phone Number ID"
              value={integration?.phone_number_id || "Not connected"}
            />

            <InfoRow
              label="WhatsApp Business Account ID"
              value={integration?.business_account_id || "Not connected"}
            />

            <InfoRow
              label="Connection Method"
              value={integration?.connection_method || "Not connected"}
            />

            <InfoRow
              label="Last Connected"
              value={
                integration?.last_connected_at
                  ? new Date(
                      integration.last_connected_at
                    ).toLocaleString("en-US", {
                      timeZone: "America/Jamaica",
                    })
                  : "Never"
              }
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Embedded Signup
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Next we will add the Meta Embedded Signup button here. After a
              business authorizes Jhyro AI, this page will save their WABA ID,
              phone-number ID, and connection status.
            </p>

            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black opacity-60"
            >
              Meta Setup Coming Next
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Human Takeover
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Human takeover protection will let a business pause AI replies
              when a real staff member is handling the conversation.
            </p>

            <div className="mt-5 rounded-xl bg-slate-800 p-4 text-sm text-slate-300">
              Status:{" "}
              {integration?.human_takeover_enabled
                ? "Enabled"
                : "Disabled"}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function StatusCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>

      <p className="mt-4 break-all text-xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  )
}