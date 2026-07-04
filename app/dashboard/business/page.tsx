import Link from "next/link"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  Scissors,
  Plug,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default async function BusinessPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Business"
          description="Manage your business profile, services, hours, and setup."
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

  const [
    { data: services },
    { data: availability },
    { data: breaks },
    { data: closures },
    { data: integrations },
  ] = await Promise.all([
    supabase
      .from("business_services")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_availability")
      .select("*")
      .eq("business_id", business.id),

    supabase
      .from("business_breaks")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("business_closures")
      .select("*")
      .eq("business_id", business.id)
      .order("closure_date", { ascending: true }),

    supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", business.id),
  ])

  const safeServices = services || []
  const safeAvailability = availability || []
  const safeBreaks = breaks || []
  const safeClosures = closures || []
  const safeIntegrations = integrations || []

  const activeServices = safeServices.filter(
    (service) => service.is_active !== false
  )

  const connectedIntegrations = safeIntegrations.filter(
    (integration) => integration.connected
  )

  const openDays = safeAvailability.filter(
    (day) => !day.is_closed
  )

  return (
    <div>
      <PageHeader
        title="Business"
        description="Manage the business profile and setup data used by Jhyro AI."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
                <Building2 size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {business.name ||
                    business.business_name ||
                    "Unnamed Business"}
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Business ID: {business.id}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-slate-400">
              This is the business record connected to your signed-in account.
              All services, hours, bookings, customers, messages, and integrations
              should be filtered through this business ID.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Security Scope
                </p>

                <p className="font-bold text-green-400">
                  Owner Filtered
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Services"
          value={activeServices.length}
          icon={<Scissors size={20} />}
        />

        <StatCard
          title="Open Days"
          value={openDays.length}
          icon={<Clock size={20} />}
        />

        <StatCard
          title="Connected Apps"
          value={connectedIntegrations.length}
          icon={<Plug size={20} />}
        />

        <StatCard
          title="Closures"
          value={safeClosures.length}
          icon={<CalendarDays size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Business Profile
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Information Jhyro AI can use when replying to customers.
              </p>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200"
            >
              Edit
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Business Name"
              value={
                business.name ||
                business.business_name ||
                "Not provided"
              }
              icon={<Building2 size={16} />}
            />

            <InfoCard
              label="Phone"
              value={business.phone || "Not provided"}
              icon={<Phone size={16} />}
            />

            <InfoCard
              label="Email"
              value={business.email || "Not provided"}
              icon={<Mail size={16} />}
            />

            <InfoCard
              label="Address"
              value={
                business.address ||
                business.location ||
                "Not provided"
              }
              icon={<MapPin size={16} />}
            />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5">
            <p className="text-sm font-semibold text-slate-300">
              AI Personality
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
              {business.ai_personality ||
                business.personality ||
                "No custom AI personality saved yet."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Setup Health
            </h2>

            <div className="mt-5 space-y-3">
              <HealthRow
                label="Business Profile"
                ok={Boolean(
                  business.name ||
                    business.business_name
                )}
              />

              <HealthRow
                label="Services Added"
                ok={activeServices.length > 0}
              />

              <HealthRow
                label="Hours Added"
                ok={safeAvailability.length > 0}
              />

              <HealthRow
                label="WhatsApp Connected"
                ok={connectedIntegrations.some(
                  (integration) =>
                    integration.provider === "whatsapp"
                )}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Integrations
              </h2>

              <Link
                href="/dashboard/integrations"
                className="text-sm font-semibold text-slate-400 hover:text-white"
              >
                Manage
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {safeIntegrations.length > 0 ? (
                safeIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between rounded-xl bg-slate-800 p-4"
                  >
                    <p className="font-semibold capitalize text-white">
                      {integration.provider?.replace("_", " ")}
                    </p>

                    <span
                      className={
                        integration.connected
                          ? "rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400"
                          : "rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400"
                      }
                    >
                      {integration.connected
                        ? "Connected"
                        : "Inactive"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No integrations saved yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Services
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Services customers can book through Jhyro AI.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Edit Services
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {safeServices.length > 0 ? (
            safeServices.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl bg-slate-800 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {service.name || "Unnamed Service"}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {service.duration_minutes || 30} minutes
                      {service.price
                        ? ` • $${service.price}`
                        : ""}
                    </p>
                  </div>

                  <span
                    className={
                      service.is_active === false
                        ? "rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400"
                        : "rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400"
                    }
                  >
                    {service.is_active === false
                      ? "Inactive"
                      : "Active"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyPanel message="No services added yet." />
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Business Hours
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Availability used by the booking scheduler.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {safeAvailability.length > 0 ? (
            safeAvailability.map((day) => (
              <div
                key={day.id}
                className="rounded-2xl bg-slate-800 p-5"
              >
                <p className="font-bold text-white">
                  {day.day_of_week}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {day.is_closed
                    ? "Closed"
                    : `${day.open_time || "--"} - ${
                        day.close_time || "--"
                      }`}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Slot duration: {day.slot_duration || 30} mins
                </p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-4">
              <EmptyPanel message="No business hours added yet." />
            </div>
          )}
        </div>
      </section>

      {(safeBreaks.length > 0 || safeClosures.length > 0) && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <SchedulePanel
            title="Breaks"
            items={safeBreaks.map((item) => ({
              id: item.id,
              title: item.reason || "Break",
              description: `${item.day_of_week}: ${item.start_time} - ${item.end_time}`,
            }))}
          />

          <SchedulePanel
            title="Closures"
            items={safeClosures.map((item) => ({
              id: item.id,
              title: item.reason || "Closed",
              description: item.closure_date || "No date",
            }))}
          />
        </section>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
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

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>

      <p className="mt-3 text-sm font-semibold text-white">
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

function SchedulePanel({
  title,
  items,
}: {
  title: string
  items: {
    id: string
    title: string
    description: string
  }[]
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-slate-800 p-4"
          >
            <p className="font-semibold text-white">
              {item.title}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
      {message}
    </div>
  )
}