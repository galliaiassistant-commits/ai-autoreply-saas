import { PageHeader } from "@/components/dashboard/PageHeader"
import { CheckCircle2 } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small businesses.",
    features: [
      "1 Business",
      "WhatsApp AI",
      "Unlimited Messages",
      "Basic Analytics",
      "Customer Memory",
    ],
    current: true,
  },
  {
    name: "Professional",
    price: "$79",
    description: "For growing businesses.",
    features: [
      "3 Businesses",
      "WhatsApp + Instagram",
      "Advanced Analytics",
      "Bookings",
      "AI Knowledge",
      "AI Personality",
      "Priority Support",
    ],
    current: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations.",
    features: [
      "Unlimited Businesses",
      "All Integrations",
      "Team Members",
      "API Access",
      "Dedicated Support",
      "Custom AI Training",
    ],
    current: false,
  },
]

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage your subscription, plans, and future invoices."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 ${
              plan.current
                ? "border-blue-500 bg-slate-900"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {plan.name}
              </h2>

              {plan.current && (
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                  Current Plan
                </span>
              )}
            </div>

            <p className="mt-4 text-4xl font-bold text-white">
              {plan.price}
              {plan.price !== "Custom" && (
                <span className="text-base font-normal text-slate-400">
                  /month
                </span>
              )}
            </p>

            <p className="mt-2 text-slate-400">
              {plan.description}
            </p>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={18}
                    className="text-green-400"
                  />

                  <span className="text-slate-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button
              className={`mt-8 w-full rounded-xl py-3 font-semibold ${
                plan.current
                  ? "bg-slate-800 text-white"
                  : "bg-white text-black hover:bg-slate-200"
              }`}
            >
              {plan.current
                ? "Current Plan"
                : "Upgrade"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Billing Status
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Subscription"
            value="Active"
          />

          <InfoCard
            title="Next Payment"
            value="Coming Soon"
          />

          <InfoCard
            title="Invoices"
            value="Stripe Integration"
          />
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  )
}