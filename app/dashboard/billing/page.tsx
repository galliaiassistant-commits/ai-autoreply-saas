import Link from "next/link"
import type { ReactNode } from "react"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
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
  ArrowRight,
  Lock,
} from "lucide-react"

export default async function BillingPage() {
  const business = await getCurrentBusiness()

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

  const plan =
    business.plan ||
    business.subscription_plan ||
    "Starter"

  const subscriptionStatus =
    business.subscription_status ||
    business.billing_status ||
    "Setup Required"

  const isActive =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing"

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage plans, subscriptions, invoices, and payment setup."
      />

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
              Billing is scoped to the signed-in business account. This page is
              ready for Stripe subscriptions, invoices, plan upgrades, and usage
              tracking.
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
          value={plan}
          icon={<Zap size={20} />}
        />

        <StatCard
          title="Business Scope"
          value="Secured"
          icon={<ShieldCheck size={20} />}
        />

        <StatCard
          title="Payments"
          value="Stripe Next"
          icon={<Lock size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Plans
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            These plans are ready for Stripe checkout integration.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <PlanCard
              name="Starter"
              price="$19"
              description="For small businesses testing AI replies."
              features={[
                "1 business workspace",
                "WhatsApp AI replies",
                "Basic booking capture",
                "Customer memory",
              ]}
              active={plan.toLowerCase() === "starter"}
            />

            <PlanCard
              name="Pro"
              price="$49"
              description="For businesses that want full automation."
              features={[
                "Everything in Starter",
                "Advanced booking calendar",
                "Integrations dashboard",
                "Analytics",
                "Priority AI responses",
              ]}
              active={plan.toLowerCase() === "pro"}
              highlighted
            />

            <PlanCard
              name="Agency"
              price="$149"
              description="For managing multiple client businesses."
              features={[
                "Multiple businesses",
                "Team access",
                "Advanced reporting",
                "White-label ready",
                "Priority support",
              ]}
              active={plan.toLowerCase() === "agency"}
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
                value={plan}
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
                ok={false}
              />

              <SetupRow
                label="Customer portal"
                ok={false}
              />

              <SetupRow
                label="Webhook handling"
                ok={false}
              />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              We will connect Stripe after the dashboard security pass is done.
              That way payments are added on top of a safe multi-business system.
            </p>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Usage Included
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Usage cards are scoped to this business and ready to connect to real
          counters later.
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
            value="1 workspace"
            icon={<Building2 size={20} />}
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Next Billing Steps
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <NextStep
            title="Create Stripe account"
            description="Connect Jhyro AI to Stripe so users can subscribe."
          />

          <NextStep
            title="Add checkout route"
            description="Create an API route that starts a Stripe checkout session."
          />

          <NextStep
            title="Add webhook route"
            description="Listen for subscription changes and update the business plan."
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
  price,
  description,
  features,
  active,
  highlighted,
}: {
  name: string
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

      <button
        type="button"
        disabled
        className={
          highlighted
            ? "mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white opacity-70"
            : "mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 opacity-70"
        }
      >
        Stripe Coming Next
        <ArrowRight size={16} />
      </button>
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