import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Bot,
  Building2,
  CalendarCheck2,
  Clock3,
  CreditCard,
  ExternalLink,
  Gift,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  clearBusinessPlanOverride,
  setBusinessPlanOverride,
} from "@/app/admin/businesses/actions"

export const dynamic = "force-dynamic"

type ServiceRecord = {
  name: string
  price: number | string | null
  duration_minutes: number | null
  is_active: boolean | null
}

type AvailabilityRecord = {
  day_of_week: string | number
  open_time: string | null
  close_time: string | null
  is_closed: boolean | null
}

type IntegrationRecord = {
  provider: string
  connected: boolean | null
  phone_number: string | null
  display_phone_number: string | null
  connection_method: string | null
  last_connected_at: string | null
  updated_at: string | null
}

type CalendarRecord = {
  connected: boolean | null
  google_account_email: string | null
  calendar_name: string | null
  last_synced_at: string | null
  updated_at: string | null
}

type PaymentRecord = {
  id: string
  provider: string | null
  status: string | null
  amount: number | string | null
  currency: string | null
  paypal_transaction_id: string | null
  paypal_subscription_id: string | null
  paid_at: string | null
  failed_at: string | null
  created_at: string | null
}

type KnowledgeRecord = {
  question: string
  answer: string
}

export default async function AdminBusinessProfilePage({
  params,
}: {
  params: Promise<{ businessid: string }>
}) {
  const { businessid: businessId } = await params

  const businessResult = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle()

  if (businessResult.error) {
    console.error(
      "ADMIN BUSINESS PROFILE LOAD ERROR:",
      businessResult.error
    )
  }

  if (!businessResult.data) {
    notFound()
  }

  const business = businessResult.data as Record<string, unknown>

  const [
    servicesResult,
    availabilityResult,
    integrationsResult,
    calendarResult,
    paymentsResult,
    knowledgeResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("business_services")
      .select("name, price, duration_minutes, is_active")
      .eq("business_id", businessId)
      .order("name", { ascending: true })
      .returns<ServiceRecord[]>(),
    supabaseAdmin
      .from("business_availability")
      .select("day_of_week, open_time, close_time, is_closed")
      .eq("business_id", businessId)
      .returns<AvailabilityRecord[]>(),
    supabaseAdmin
      .from("business_integrations")
      .select(
        "provider, connected, phone_number, display_phone_number, connection_method, last_connected_at, updated_at"
      )
      .eq("business_id", businessId)
      .returns<IntegrationRecord[]>(),
    supabaseAdmin
      .from("google_calendar_connections")
      .select(
        "connected, google_account_email, calendar_name, last_synced_at, updated_at"
      )
      .eq("business_id", businessId)
      .maybeSingle<CalendarRecord>(),
    supabaseAdmin
      .from("payments")
      .select(
        "id, provider, status, amount, currency, paypal_transaction_id, paypal_subscription_id, paid_at, failed_at, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .returns<PaymentRecord[]>(),
    supabaseAdmin
      .from("business_knowledge")
      .select("question, answer")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .returns<KnowledgeRecord[]>(),
  ])

  const relatedError =
    servicesResult.error ||
    availabilityResult.error ||
    integrationsResult.error ||
    calendarResult.error ||
    paymentsResult.error ||
    knowledgeResult.error

  if (relatedError) {
    console.error(
      "ADMIN BUSINESS PROFILE RELATED DATA ERROR:",
      relatedError
    )
  }

  const services = servicesResult.data || []
  const availability = sortAvailability(
    availabilityResult.data || []
  )
  const integrations = integrationsResult.data || []
  const calendar = calendarResult.data || null
  const payments = paymentsResult.data || []
  const knowledge = knowledgeResult.data || []

  const businessName =
    getText(business, "business_name") || "Unnamed business"
  const subscriptionStatus =
    getText(business, "subscription_status") || "inactive"
  const paypalPlan =
    getText(business, "subscription_plan") || "free"
  const overridePlan = getText(business, "plan_override")
  const overrideExpiresAt = getText(
    business,
    "plan_override_expires_at"
  )
  const overrideIsActive = isActiveOverride(
    overridePlan,
    overrideExpiresAt
  )
  const effectivePlan = overrideIsActive
    ? overridePlan || paypalPlan
    : paypalPlan
  const aiSuspended = Boolean(
    getText(business, "ai_suspended_at")
  )
  const completedPayments = payments.filter(
    (payment) => payment.status?.toLowerCase() === "completed"
  )
  const totalPaid = completedPayments.reduce(
    (total, payment) => total + toNumber(payment.amount),
    0
  )
  const whatsapp = integrations.find(
    (integration) => integration.provider === "whatsapp"
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/businesses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to businesses
        </Link>

        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-blue-400/25 hover:bg-blue-400/5 hover:text-blue-200"
        >
          Payment center
          <ExternalLink size={15} />
        </Link>
      </div>

      <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#101a2c] via-[#0c1524] to-[#080e18] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/15">
              <Building2 size={28} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">
                Business profile
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {businessName}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Joined {formatDate(getText(business, "created_at"))}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ProfileStatus
              label={formatLabel(subscriptionStatus)}
              healthy={["active", "trialing"].includes(
                subscriptionStatus.toLowerCase()
              )}
            />
            <ProfileStatus
              label={aiSuspended ? "AI suspended" : "AI enabled"}
              healthy={!aiSuspended}
            />
            {overrideIsActive && (
              <ProfileStatus
                label={`${formatLabel(effectivePlan)} override`}
                healthy
              />
            )}
          </div>
        </div>
      </section>

      {relatedError && (
        <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
          Some profile sections could not be loaded. Check the server
          logs for details.
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Completed payments"
          value={String(completedPayments.length)}
          icon={<CreditCard size={20} />}
        />
        <MetricCard
          label="Total paid"
          value={formatMoney(totalPaid, "USD")}
          icon={<Sparkles size={20} />}
        />
        <MetricCard
          label="Active services"
          value={String(
            services.filter((service) => service.is_active !== false)
              .length
          )}
          icon={<ShieldCheck size={20} />}
        />
        <MetricCard
          label="Connected integrations"
          value={String(
            integrations.filter(
              (integration) => integration.connected === true
            ).length + (calendar?.connected ? 1 : 0)
          )}
          icon={<MessageCircle size={20} />}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ProfileSection
          title="Business details"
          description="Account and public business information."
          icon={<Building2 size={20} />}
        >
          <DetailGrid>
            <Detail
              icon={<Mail size={16} />}
              label="Email"
              value={getText(business, "email") || "Not provided"}
            />
            <Detail
              icon={<Phone size={16} />}
              label="Phone"
              value={getText(business, "phone") || "Not provided"}
            />
            <Detail
              icon={<MapPin size={16} />}
              label="Address"
              value={
                getText(business, "address") || "Not provided"
              }
            />
            <Detail
              icon={<Clock3 size={16} />}
              label="Timezone"
              value={
                getText(business, "timezone") || "Not provided"
              }
            />
          </DetailGrid>

          <TextBlock
            label="Business description"
            value={
              getText(business, "description") || "Not provided"
            }
          />
        </ProfileSection>

        <ProfileSection
          title="Subscription and billing"
          description="Current PayPal plan and billing health."
          icon={<CreditCard size={20} />}
        >
          <DetailGrid>
            <Detail
              label="PayPal plan"
              value={formatLabel(paypalPlan)}
            />
            <Detail
              label="Effective access"
              value={formatLabel(effectivePlan)}
            />
            <Detail
              label="Status"
              value={formatLabel(subscriptionStatus)}
            />
            <Detail
              label="Provider"
              value={formatLabel(
                getText(business, "payment_provider") || "Not set"
              )}
            />
            <Detail
              label="Last payment"
              value={formatDateTime(
                getText(business, "last_payment_at")
              )}
            />
            <Detail
              label="Current period ends"
              value={formatDateTime(
                getText(
                  business,
                  "subscription_current_period_end"
                )
              )}
            />
            <Detail
              label="Payment due"
              value={formatDateTime(
                getText(business, "payment_due_at")
              )}
            />
            <Detail
              label="Grace period ends"
              value={formatDateTime(
                getText(business, "billing_grace_ends_at")
              )}
            />
            <Detail
              label="PayPal subscription"
              value={
                getText(business, "paypal_subscription_id") ||
                "Not connected"
              }
              mono
            />
          </DetailGrid>
        </ProfileSection>

        <ProfileSection
          title="Internal plan override"
          description="Server-controlled complimentary or testing access. PayPal billing remains unchanged."
          icon={<Gift size={20} />}
        >
          {overrideIsActive ? (
            <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                    Active internal override
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {formatLabel(overridePlan || "business")}
                  </p>
                </div>
                <ProfileStatus label="Active" healthy />
              </div>

              <p className="mt-4 text-sm text-slate-300">
                {getText(business, "plan_override_reason") ||
                  "No reason recorded"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Expires: {overrideExpiresAt
                  ? formatDateTime(overrideExpiresAt)
                  : "Never"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Set: {formatDateTime(
                  getText(business, "plan_override_set_at")
                )}
              </p>

              <form action={clearBusinessPlanOverride} className="mt-4">
                <input type="hidden" name="businessId" value={businessId} />
                <button
                  type="submit"
                  className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
                >
                  Remove override
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-sm text-slate-500">
              No active internal override. Effective access currently follows the PayPal subscription.
            </div>
          )}

          <form
            action={setBusinessPlanOverride}
            className="mt-4 space-y-4 rounded-2xl border border-white/8 bg-slate-950/60 p-4"
          >
            <input type="hidden" name="businessId" value={businessId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">
                  Override plan
                </span>
                <select
                  name="plan"
                  defaultValue="business"
                  className="mt-2 w-full rounded-xl border border-white/8 bg-slate-900 px-3 py-3 text-sm text-white outline-none"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-500">
                  Duration
                </span>
                <select
                  name="duration"
                  defaultValue="never"
                  className="mt-2 w-full rounded-xl border border-white/8 bg-slate-900 px-3 py-3 text-sm text-white outline-none"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">No expiration</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                Internal reason
              </span>
              <input
                name="reason"
                required
                maxLength={300}
                defaultValue="Jhyro internal development and integration testing"
                className="mt-2 w-full rounded-xl border border-white/8 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-700"
                placeholder="Why is this override being granted?"
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-purple-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-purple-200"
            >
              Apply internal override
            </button>
          </form>
        </ProfileSection>

        <ProfileSection
          title="Integration health"
          description="Connection details without credentials or tokens."
          icon={<CalendarCheck2 size={20} />}
        >
          <IntegrationBox
            name="WhatsApp"
            connected={whatsapp?.connected === true}
            detail={
              whatsapp?.display_phone_number ||
              whatsapp?.phone_number ||
              "No number connected"
            }
            updatedAt={
              whatsapp?.last_connected_at || whatsapp?.updated_at || null
            }
          />
          <IntegrationBox
            name="Google Calendar"
            connected={calendar?.connected === true}
            detail={
              calendar?.google_account_email ||
              calendar?.calendar_name ||
              "No Calendar connected"
            }
            updatedAt={
              calendar?.last_synced_at || calendar?.updated_at || null
            }
          />
        </ProfileSection>

        <ProfileSection
          title="AI configuration"
          description="Business-provided assistant settings."
          icon={<Bot size={20} />}
        >
          <TextBlock
            label="Personality"
            value={
              getText(business, "ai_personality") ||
              getText(business, "personality") ||
              "Not configured"
            }
          />
          <TextBlock
            label="Booking policy"
            value={
              getText(business, "booking_policy") ||
              "Not configured"
            }
          />
        </ProfileSection>
      </div>

      <ProfileSection
        title="Business hours"
        description="The schedule used for availability checks."
        icon={<Clock3 size={20} />}
        className="mt-6"
      >
        {availability.length === 0 ? (
          <EmptyText text="No business hours configured." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {availability.map((item) => {
              const day = formatDay(item.day_of_week)
              const closed =
                item.is_closed === true ||
                !item.open_time ||
                !item.close_time

              return (
                <div
                  key={String(item.day_of_week)}
                  className="rounded-2xl border border-white/8 bg-slate-950/60 p-4"
                >
                  <p className="font-semibold text-slate-200">
                    {day}
                  </p>
                  <p
                    className={
                      closed
                        ? "mt-2 text-sm text-red-300"
                        : "mt-2 text-sm text-slate-500"
                    }
                  >
                    {closed
                      ? "Closed"
                      : `${formatTime(item.open_time)} – ${formatTime(
                          item.close_time
                        )}`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Services and prices"
        description="Services configured by the business."
        icon={<Sparkles size={20} />}
        className="mt-6"
      >
        {services.length === 0 ? (
          <EmptyText text="No services configured." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {services.map((service) => (
                  <tr key={service.name}>
                    <td className="py-4 font-semibold text-slate-200">
                      {service.name}
                    </td>
                    <td className="py-4 text-slate-400">
                      {service.price === null
                        ? "Not set"
                        : formatMoney(toNumber(service.price), "USD")}
                    </td>
                    <td className="py-4 text-slate-400">
                      {service.duration_minutes
                        ? `${service.duration_minutes} minutes`
                        : "Not set"}
                    </td>
                    <td className="py-4">
                      <ProfileStatus
                        label={
                          service.is_active === false
                            ? "Inactive"
                            : "Active"
                        }
                        healthy={service.is_active !== false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Payment history"
        description="Verified payment events for this business."
        icon={<CreditCard size={20} />}
        className="mt-6"
      >
        {payments.length === 0 ? (
          <EmptyText text="No payment records found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Provider</th>
                  <th className="pb-3">Transaction</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-4 font-semibold text-slate-200">
                      {payment.amount === null
                        ? "—"
                        : formatMoney(
                            toNumber(payment.amount),
                            payment.currency || "USD"
                          )}
                    </td>
                    <td className="py-4">
                      <ProfileStatus
                        label={formatLabel(
                          payment.status || "unknown"
                        )}
                        healthy={
                          payment.status?.toLowerCase() === "completed"
                        }
                      />
                    </td>
                    <td className="py-4 text-slate-400">
                      {formatLabel(payment.provider || "paypal")}
                    </td>
                    <td className="py-4 font-mono text-xs text-slate-400">
                      {payment.paypal_transaction_id || "—"}
                    </td>
                    <td className="py-4 text-slate-400">
                      {formatDateTime(
                        payment.paid_at ||
                          payment.failed_at ||
                          payment.created_at
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Business knowledge"
        description="Information the business supplied to its assistant."
        icon={<Bot size={20} />}
        className="mt-6"
      >
        {knowledge.length === 0 ? (
          <EmptyText text="No business knowledge entries found." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {knowledge.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className="rounded-2xl border border-white/8 bg-slate-950/60 p-4"
              >
                <p className="font-semibold text-slate-200">
                  {item.question}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4 text-sm text-slate-400">
        Privacy boundary: this profile does not query customers,
        conversations, messages, memories, bookings, credentials,
        access tokens, refresh tokens, or Google Calendar events.
      </div>
    </div>
  )
}

function ProfileSection({
  title,
  description,
  icon,
  className = "",
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={`rounded-3xl border border-white/8 bg-[#0b111d] p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3 border-b border-white/8 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-slate-100">{title}</h2>
          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-[#0d1523] to-[#090f1a] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

function Detail({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {icon}
        {label}
      </div>
      <p
        className={`mt-2 break-words text-sm text-slate-300 ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function TextBlock({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="mt-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4 first:mt-0">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
        {value}
      </p>
    </div>
  )
}

function IntegrationBox({
  name,
  connected,
  detail,
  updatedAt,
}: {
  name: string
  connected: boolean
  detail: string
  updatedAt: string | null
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-slate-950/60 p-4 first:mt-0">
      <div>
        <p className="font-semibold text-slate-200">{name}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
        <p className="mt-1 text-xs text-slate-700">
          Updated {formatDateTime(updatedAt)}
        </p>
      </div>
      <ProfileStatus
        label={connected ? "Connected" : "Not connected"}
        healthy={connected}
      />
    </div>
  )
}

function ProfileStatus({
  label,
  healthy,
}: {
  label: string
  healthy: boolean
}) {
  return (
    <span
      className={
        healthy
          ? "inline-flex shrink-0 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300"
          : "inline-flex shrink-0 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300"
      }
    >
      {label}
    </span>
  )
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/8 p-6 text-center text-sm text-slate-600">
      {text}
    </p>
  )
}

function getText(
  record: Record<string, unknown>,
  key: string
) {
  const value = record[key]
  return typeof value === "string" ? value : null
}

function toNumber(value: number | string | null) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`
  }
}

function formatLabel(value: string) {
  return String(value || "Unknown")
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ")
}

function formatDate(value: string | null) {
  if (!value) return "Unknown"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeZone: "America/Jamaica",
  }).format(date)
}

function formatDateTime(value: string | null) {
  if (!value) return "Not set"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not set"

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(date)
}

function formatTime(value: string | null) {
  if (!value) return "Not set"
  const [hourValue, minuteValue] = value
    .slice(0, 5)
    .split(":")
    .map(Number)
  const period = hourValue >= 12 ? "PM" : "AM"
  const hour = hourValue % 12 || 12
  return `${hour}:${String(minuteValue).padStart(2, "0")} ${period}`
}

function formatDay(value: string | number) {
  const raw = String(value)
  if (!/^\d+$/.test(raw)) {
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  return days[Number(raw)] || raw
}

function sortAvailability(items: AvailabilityRecord[]) {
  const order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  return [...items].sort(
    (a, b) =>
      order.indexOf(formatDay(a.day_of_week)) -
      order.indexOf(formatDay(b.day_of_week))
  )
}

function isActiveOverride(
  plan: string | null,
  expiresAt: string | null
) {
  if (!plan || !["starter", "pro", "business"].includes(plan)) {
    return false
  }

  if (!expiresAt) return true

  const expiration = new Date(expiresAt)

  return (
    !Number.isNaN(expiration.getTime()) &&
    expiration.getTime() > Date.now()
  )
}