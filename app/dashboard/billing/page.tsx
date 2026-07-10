import Link from "next/link"
import type { ReactNode } from "react"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import BillingCheckoutButton from "./BillingCheckoutButton"
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
} from "lucide-react"

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string
    canceled?: string
  }>
}) {
  const business = await getCurrentBusiness()
  const resolvedSearchParams = searchParams
    ? await searchParams
    : {}

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

  const isActive =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing"

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage plans, subscriptions, invoices, and payment setup."
      />

      {resolvedSearchParams.success === "true" && (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-semibold text-green-300">
          Payment started successfully. Stripe will update your plan once the webhook is received.
        </div>
      )}

      {resolvedSearchParams.canceled === "true" && (
        <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm font-semibold text-yellow-300">
          Checkout was canceled. You can choose a plan anytime.
        </div>
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
              Billing is scoped to the signed-in business account. Choose a Jhyro AI plan and pay securely with Stripe Checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div
                className={
                  isActive
                    ? "rounded-xl bg-green-500/20 p-3 text-green-400"
                    : "rounded-xl bg-yellow-500/20 p-3 text-yellow-400"
                }
              >
                {isActive ? (
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
                    isActive
                      ? "font-bold text-green-400"
                      : "font-bold text-yellow-400"
                  }
                >
                  {subscriptionStatus}
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
          value="Stripe Ready"
          icon={<Lock size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Plans
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Choose a monthly plan. Payments are handled securely by Stripe.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <PlanCard
              name="Starter"
              planId="starter"
              price="$10"
              description="For small businesses getting started with AI customer support."
              features={[
                "1 business workspace",
                "WhatsApp AI replies",
                "Customer conversations",
                "Customer profiles",
                "Basic dashboard",
              ]}
              active={plan === "starter"}
            />

            <PlanCard
              name="Pro"
              planId="pro"
              price="$25"
              description="For growing businesses that need smarter automation."
              features={[
                "Everything in Starter",
                "Appointment bookings",
                "Customer memory",
                "Business knowledge replies",
                "Service management",
              ]}
              active={plan === "pro"}
              highlighted
            />

            <PlanCard
              name="Business"
              planId="business"
              price="$50"
              description="For businesses that need advanced AI automation and scaling."
              features={[
                "Everything in Pro",
                "Multiple businesses",
                "Advanced setup options",
                "Priority improvements",
                "Expanded automation",
              ]}
              active={plan === "business"}
            />
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
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Stripe Setup
            </h2>

            <div className="mt-5 space-y-3">
              <SetupRow
                label="Business scoped billing"
                ok
              />

              <SetupRow
                label="Stripe checkout"
                ok
              />

              <SetupRow
                label="Customer portal"
                ok={false}
              />

              <SetupRow
                label="Webhook handling"
                ok
              />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              Checkout is connected. The customer portal can be added later so users can update cards, cancel plans, and download invoices.
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

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Billing Notes
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <NextStep
            title="Secure checkout"
            description="Customers pay on Stripe’s hosted checkout page."
          />

          <NextStep
            title="Webhook updates"
            description="Stripe updates your business subscription after payment."
          />

          <NextStep
            title="Portal later"
            description="A customer billing portal can be added after checkout is tested."
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
  planId,
  price,
  description,
  features,
  active,
  highlighted,
}: {
  name: string
  planId: "starter" | "pro" | "business"
  price: string
  description: string
  features: string[]
  active?: boolean
  highlighted?: boolean
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

      <BillingCheckoutButton
        plan={planId}
        highlighted={highlighted}
        active={active}
      />
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
          {ok ? "Ready" : "Next"}
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

function NextStep({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <h3 className="font-bold text-white">
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