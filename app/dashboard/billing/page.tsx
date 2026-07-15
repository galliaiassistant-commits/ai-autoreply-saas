import Link from "next/link"
import type { ReactNode } from "react"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import PayPalSubscriptionButton from "./PayPalSubscriptionButton"
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Building2,
  MessageCircle,
  CalendarDays,
  Bot,
  Lock,
  Clock3,
} from "lucide-react"

export default async function BillingPage() {
  const business = await getCurrentBusiness()

  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const starterPlanId =
    process.env.NEXT_PUBLIC_PAYPAL_STARTER_PLAN_ID

  const proPlanId =
    process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID

  const businessPlanId =
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_PLAN_ID

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Billing"
          description="Manage your Jhyro AI plan and subscription."
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

  const planRaw =
    business.subscription_plan ||
    business.plan ||
    "free"

  const plan = String(planRaw).toLowerCase()

  const planLabel =
    plan === "starter"
      ? "Starter"
      : plan === "pro"
        ? "Pro"
        : plan === "business"
          ? "Business"
          : "Free"

  const subscriptionStatus =
    business.subscription_status ||
    business.billing_status ||
    "inactive"

  const paymentProvider =
    business.payment_provider || "none"

  const normalizedStatus =
    String(subscriptionStatus).toLowerCase()

  const isActive =
    normalizedStatus === "active" ||
    normalizedStatus === "trialing"

  const isPaymentDue =
    normalizedStatus === "payment_due" ||
    normalizedStatus === "past_due"

  const isStopped =
    normalizedStatus === "cancelled" ||
    normalizedStatus === "expired" ||
    normalizedStatus === "suspended"

  const paymentDueAt = business.payment_due_at || null
  const billingGraceEndsAt =
    business.billing_grace_ends_at || null
  const aiSuspendedAt =
    business.ai_suspended_at || null

  const graceEndDate = billingGraceEndsAt
    ? new Date(billingGraceEndsAt)
    : null

  const graceEndIsValid =
    Boolean(graceEndDate && !Number.isNaN(graceEndDate.getTime()))

  const graceHasEnded =
    Boolean(
      graceEndIsValid &&
      graceEndDate &&
      Date.now() >= graceEndDate.getTime()
    )

  const aiIsSuspended =
    Boolean(aiSuspendedAt) ||
    isStopped ||
    (isPaymentDue && graceHasEnded)

  const millisecondsPerDay = 1000 * 60 * 60 * 24

  const graceDaysRemaining =
    graceEndIsValid && graceEndDate && !graceHasEnded
      ? Math.max(
          1,
          Math.ceil(
            (graceEndDate.getTime() - Date.now()) /
              millisecondsPerDay
          )
        )
      : 0

  const formattedPaymentDueAt =
    formatBillingDate(paymentDueAt)

  const formattedGraceEndsAt =
    formatBillingDate(billingGraceEndsAt)

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage plans, subscriptions, invoices, and payment setup."
      />

      {(isPaymentDue || aiIsSuspended) && (
        <BillingAlert
          aiIsSuspended={aiIsSuspended}
          isPaymentDue={isPaymentDue}
          isStopped={isStopped}
          paymentDueAt={formattedPaymentDueAt}
          graceEndsAt={formattedGraceEndsAt}
          graceDaysRemaining={graceDaysRemaining}
          status={normalizedStatus}
        />
      )}

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
                <CreditCard size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  Billing Center
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  {business.name ||
                    business.business_name ||
                    "Unnamed Business"}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-slate-400">
              Billing is scoped to the signed-in business account. Choose a Jhyro AI plan and subscribe securely with PayPal.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div
                className={
                  aiIsSuspended
                    ? "rounded-xl bg-red-500/20 p-3 text-red-400"
                    : isActive
                      ? "rounded-xl bg-green-500/20 p-3 text-green-400"
                      : "rounded-xl bg-yellow-500/20 p-3 text-yellow-400"
                }
              >
                {aiIsSuspended ? (
                  <Lock size={22} />
                ) : isActive ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <AlertCircle size={22} />
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Subscription
                </p>

                <p
                  className={
                    aiIsSuspended
                      ? "font-bold capitalize text-red-400"
                      : isActive
                        ? "font-bold capitalize text-green-400"
                        : "font-bold capitalize text-yellow-400"
                  }
                >
                  {aiIsSuspended
                    ? "AI replies suspended"
                    : normalizedStatus.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatCard
          title="Current Plan"
          value={planLabel}
          icon={<Zap size={20} />}
        />

        <StatCard
          title="Business Scope"
          value="Secured"
          icon={<ShieldCheck size={20} />}
        />

        <StatCard
          title="Payments"
          value={
            paymentProvider === "paypal"
              ? "PayPal Active"
              : "PayPal Ready"
          }
          icon={<Lock size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section id="plans" className="scroll-mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Plans
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Choose a monthly plan. Subscriptions are handled by PayPal.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <PlanCard
              name="Starter"
              price="$29.99"
              description="For small businesses getting started with AI customer support."
              features={[
                "1 business workspace",
                "WhatsApp AI replies",
                "Customer conversations",
                "Customer profiles",
                "Basic dashboard",
              ]}
              active={plan === "starter" && isActive}
            >
              <PayPalSubscriptionButton
                plan="starter"
                planId={starterPlanId}
                clientId={paypalClientId}
                active={plan === "starter" && isActive}
              />
            </PlanCard>

            <PlanCard
              name="Pro"
              price="$49.99"
              description="For growing businesses that need smarter automation."
              features={[
                "Everything in Starter",
                "Appointment bookings",
                "Customer memory",
                "Business knowledge replies",
                "Service management",
              ]}
              active={plan === "pro" && isActive}
              highlighted
            >
              <PayPalSubscriptionButton
                plan="pro"
                planId={proPlanId}
                clientId={paypalClientId}
                active={plan === "pro" && isActive}
              />
            </PlanCard>

            <PlanCard
              name="Business"
              price="$99.99"
              description="For businesses that need advanced AI automation and scaling."
              features={[
                "Everything in Pro",
                "Multiple businesses",
                "Advanced setup options",
                "Priority improvements",
                "Expanded automation",
              ]}
              active={plan === "business" && isActive}
            >
              <PayPalSubscriptionButton
                plan="business"
                planId={businessPlanId}
                clientId={paypalClientId}
                active={plan === "business" && isActive}
              />
            </PlanCard>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Billing Profile
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Business"
                value={
                  business.name ||
                  business.business_name ||
                  "Unnamed Business"
                }
                icon={<Building2 size={16} />}
              />

              <InfoRow
                label="Business ID"
                value={business.id}
                icon={<ShieldCheck size={16} />}
              />

              <InfoRow
                label="Plan"
                value={planLabel}
                icon={<Zap size={16} />}
              />

              <InfoRow
                label="Status"
                value={subscriptionStatus}
                icon={<CreditCard size={16} />}
              />

              <InfoRow
                label="Provider"
                value={paymentProvider}
                icon={<Lock size={16} />}
              />

              <InfoRow
                label="Payment Due"
                value={formattedPaymentDueAt}
                icon={<AlertCircle size={16} />}
              />

              <InfoRow
                label="Grace Period Ends"
                value={formattedGraceEndsAt}
                icon={<Clock3 size={16} />}
              />

              <InfoRow
                label="AI Replies"
                value={
                  aiIsSuspended
                    ? "Suspended"
                    : isPaymentDue
                      ? `${graceDaysRemaining} day${
                          graceDaysRemaining === 1 ? "" : "s"
                        } remaining`
                      : "Enabled"
                }
                icon={<Bot size={16} />}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              PayPal Setup
            </h2>

            <div className="mt-5 space-y-3">
              <SetupRow
                label="Business scoped billing"
                ok
              />

              <SetupRow
                label="PayPal client ID"
                ok={Boolean(paypalClientId)}
              />

              <SetupRow
                label="Starter plan"
                ok={Boolean(starterPlanId)}
              />

              <SetupRow
                label="Pro plan"
                ok={Boolean(proPlanId)}
              />

              <SetupRow
                label="Business plan"
                ok={Boolean(businessPlanId)}
              />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              PayPal subscriptions and webhook billing updates are connected. Failed payments trigger a 7-day grace period before AI replies are suspended.
            </p>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Usage Included
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Usage cards are scoped to this business and ready to connect to real counters later.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <UsageCard
            title="AI Replies"
            value="Unlimited beta"
            icon={<Bot size={20} />}
          />

          <UsageCard
            title="Messages"
            value="Tracked soon"
            icon={<MessageCircle size={20} />}
          />

          <UsageCard
            title="Bookings"
            value="Tracked soon"
            icon={<CalendarDays size={20} />}
          />

          <UsageCard
            title="Businesses"
            value={
              plan === "business"
                ? "Multiple workspaces"
                : "1 workspace"
            }
            icon={<Building2 size={20} />}
          />
        </div>
      </section>
    </div>
  )
}


function formatBillingDate(
  value: string | null | undefined
) {
  if (!value) return "Not set"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-JM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(date)
}

function BillingAlert({
  aiIsSuspended,
  isPaymentDue,
  isStopped,
  paymentDueAt,
  graceEndsAt,
  graceDaysRemaining,
  status,
}: {
  aiIsSuspended: boolean
  isPaymentDue: boolean
  isStopped: boolean
  paymentDueAt: string
  graceEndsAt: string
  graceDaysRemaining: number
  status: string
}) {
  return (
    <section
      className={
        aiIsSuspended
          ? "mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-6"
          : "mt-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-6"
      }
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div
            className={
              aiIsSuspended
                ? "h-fit rounded-xl bg-red-500/20 p-3 text-red-400"
                : "h-fit rounded-xl bg-yellow-500/20 p-3 text-yellow-400"
            }
          >
            {aiIsSuspended ? (
              <Lock size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
          </div>

          <div>
            <h2
              className={
                aiIsSuspended
                  ? "text-xl font-bold text-red-300"
                  : "text-xl font-bold text-yellow-300"
              }
            >
              {aiIsSuspended
                ? "AI replies are suspended"
                : "Payment is due"}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              {aiIsSuspended
                ? isStopped
                  ? `Your subscription is ${status.replaceAll("_", " ")}. Choose a PayPal plan below to restore Jhyro AI.`
                  : "The 7-day payment grace period has ended. Customer messages will still reach Jhyro AI, but automatic WhatsApp replies are paused until PayPal confirms payment."
                : `PayPal reported a missed or unsuccessful payment. Jhyro AI remains active during the grace period, with ${graceDaysRemaining} day${graceDaysRemaining === 1 ? "" : "s"} remaining.`}
            </p>
          </div>
        </div>

        <Link
          href="#plans"
          className={
            aiIsSuspended
              ? "inline-flex shrink-0 items-center justify-center rounded-xl bg-red-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-red-300"
              : "inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-yellow-200"
          }
        >
          Pay with PayPal
        </Link>
      </div>

      {isPaymentDue && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payment due
            </p>
            <p className="mt-2 font-semibold text-white">
              {paymentDueAt}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Grace period ends
            </p>
            <p className="mt-2 font-semibold text-white">
              {graceEndsAt}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
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

function PlanCard({
  name,
  price,
  description,
  features,
  active,
  highlighted,
  children,
}: {
  name: string
  price: string
  description: string
  features: string[]
  active?: boolean
  highlighted?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={
        highlighted
          ? "rounded-3xl border border-white bg-white p-6 text-black"
          : "rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">
            {name}
          </h3>

          <p
            className={
              highlighted
                ? "mt-2 text-sm text-slate-700"
                : "mt-2 text-sm text-slate-400"
            }
          >
            {description}
          </p>
        </div>

        {active && (
          <span
            className={
              highlighted
                ? "rounded-full bg-black px-3 py-1 text-xs font-bold text-white"
                : "rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400"
            }
          >
            Current
          </span>
        )}
      </div>

      <p className="mt-6 text-4xl font-bold">
        {price}
        <span
          className={
            highlighted
              ? "text-base font-semibold text-slate-700"
              : "text-base font-semibold text-slate-500"
          }
        >
          /mo
        </span>
      </p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-3"
          >
            <CheckCircle2 size={17} />

            <span
              className={
                highlighted
                  ? "text-sm font-medium text-slate-800"
                  : "text-sm font-medium text-slate-300"
              }
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {children}
    </div>
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

function SetupRow({
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
          {ok ? "Ready" : "Missing"}
        </span>
      </div>
    </div>
  )
}

function UsageCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div className="text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        {value}
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