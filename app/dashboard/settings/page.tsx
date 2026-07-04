import Link from "next/link"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Settings,
  ShieldCheck,
  User,
  Building2,
  Bell,
  KeyRound,
  Bot,
  Plug,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default async function SettingsPage() {
  const business = await getCurrentBusiness()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Settings"
          description="Manage your account and business preferences."
        />

        <EmptyPanel message="No business found for this account. Complete onboarding first." />

        <Link
          href="/onboarding"
          className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
        >
          Start Onboarding
        </Link>
      </div>
    )
  }

  const { data: integrations } = await supabase
    .from("business_integrations")
    .select("*")
    .eq("business_id", business.id)

  const { data: services } = await supabase
    .from("business_services")
    .select("*")
    .eq("business_id", business.id)

  const connectedIntegrations =
    integrations?.filter((item) => item.connected).length || 0

  const activeServices =
    services?.filter((service) => service.is_active !== false).length || 0

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Control account, security, business, AI, and billing settings."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
                <Settings size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  Workspace Settings
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  {business.name ||
                    business.business_name ||
                    "Unnamed Business"}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-slate-400">
              These settings are scoped to the business owned by your signed-in
              account. This keeps one business from changing another business’s
              profile, services, integrations, or AI behavior.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Security
                </p>

                <p className="font-bold text-green-400">
                  Account Scoped
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatCard
          title="Active Services"
          value={activeServices}
          icon={<Bot size={20} />}
        />

        <StatCard
          title="Connected Apps"
          value={connectedIntegrations}
          icon={<Plug size={20} />}
        />

        <StatCard
          title="Account"
          value={user?.email ? "Signed In" : "Unknown"}
          icon={<User size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Settings Center
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Manage the main areas of your Jhyro AI workspace.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <SettingsLink
              title="Business Profile"
              description="Update your business name, phone, address, and profile details."
              href="/dashboard/business"
              icon={<Building2 size={20} />}
            />

            <SettingsLink
              title="AI Personality"
              description="Control how Jhyro AI speaks to your customers."
              href="/onboarding"
              icon={<Bot size={20} />}
            />

            <SettingsLink
              title="Integrations"
              description="Connect WhatsApp and future channels like Instagram, Gmail, and Stripe."
              href="/dashboard/integrations"
              icon={<Plug size={20} />}
            />

            <SettingsLink
              title="Billing"
              description="Manage plans, payments, invoices, and subscription status."
              href="/dashboard/billing"
              icon={<CreditCard size={20} />}
            />

            <SettingsLink
              title="Security"
              description="Review account access and workspace protection."
              href="/dashboard/settings"
              icon={<ShieldCheck size={20} />}
            />

            <SettingsLink
              title="Notifications"
              description="Control future alerts for bookings, messages, and system health."
              href="/dashboard/settings"
              icon={<Bell size={20} />}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Account
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Email"
                value={user?.email || "Not available"}
                icon={<User size={16} />}
              />

              <InfoRow
                label="User ID"
                value={user?.id || "Not available"}
                icon={<KeyRound size={16} />}
              />

              <InfoRow
                label="Business ID"
                value={business.id}
                icon={<Building2 size={16} />}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Setup Checklist
            </h2>

            <div className="mt-5 space-y-3">
              <HealthRow
                label="Business profile"
                ok={Boolean(
                  business.name ||
                    business.business_name
                )}
              />

              <HealthRow
                label="Services added"
                ok={activeServices > 0}
              />

              <HealthRow
                label="Integration connected"
                ok={connectedIntegrations > 0}
              />

              <HealthRow
                label="AI personality"
                ok={Boolean(
                  business.ai_personality ||
                    business.personality
                )}
              />
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Security Notes
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SecurityNote
            title="Business scoped"
            description="Settings are loaded from the business linked to the signed-in user."
            ok
          />

          <SecurityNote
            title="No global business lookup"
            description="This page does not use unsafe .limit(1) business fetching."
            ok
          />

          <SecurityNote
            title="RLS next"
            description="After all pages are scoped, enable Row Level Security table by table."
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function SettingsLink({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: ReactNode
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-slate-800 p-5 transition hover:bg-slate-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-950 p-3 text-slate-300">
              {icon}
            </div>

            <h3 className="font-bold text-white">
              {title}
            </h3>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="mt-3 text-slate-500 transition group-hover:text-white"
        />
      </div>
    </Link>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-all text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  )
}

function HealthRow({
  label,
  ok,
}: {
  label: string
  ok: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
      <p className="text-sm font-semibold text-slate-300">
        {label}
      </p>

      <div
        className={
          ok
            ? "flex items-center gap-2 text-green-400"
            : "flex items-center gap-2 text-yellow-400"
        }
      >
        {ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}

        <span className="text-xs font-bold">
          {ok ? "OK" : "Needs Setup"}
        </span>
      </div>
    </div>
  )
}

function SecurityNote({
  title,
  description,
  ok,
}: {
  title: string
  description: string
  ok?: boolean
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div
        className={
          ok
            ? "text-green-400"
            : "text-slate-400"
        }
      >
        {ok ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
      </div>

      <h3 className="mt-4 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
      {message}
    </div>
  )
}