import IntegrationCard from "./IntegrationCard"
import {
  IntegrationDefinition,
  IntegrationRecord,
} from "./types"

const integrations: IntegrationDefinition[] = [
  {
    provider: "whatsapp",
    name: "WhatsApp",
    category: "Communication",
    icon: "💬",
    statusLabel: "Customer messaging",
    description:
      "Receive and reply to WhatsApp customers using Jhyro AI.",
  },
  {
    provider: "instagram",
    name: "Instagram",
    category: "Communication",
    icon: "📸",
    statusLabel: "DM automation",
    description:
      "Reply to Instagram DMs and convert followers into bookings.",
    comingSoon: true,
  },
  {
    provider: "messenger",
    name: "Messenger",
    category: "Communication",
    icon: "📘",
    statusLabel: "Facebook chat",
    description:
      "Automate Facebook Messenger conversations for your business.",
    comingSoon: true,
  },
  {
    provider: "google_calendar",
    name: "Google Calendar",
    category: "Scheduling",
    icon: "📅",
    statusLabel: "Calendar sync",
    description:
      "Sync Jhyro AI bookings with your Google Calendar.",
    comingSoon: true,
  },
  {
    provider: "gmail",
    name: "Gmail",
    category: "Email",
    icon: "📧",
    statusLabel: "Email assistant",
    description:
      "Let Jhyro AI help reply to customer emails and inquiries.",
    comingSoon: true,
  },
  {
    provider: "stripe",
    name: "Stripe",
    category: "Payments",
    icon: "💳",
    statusLabel: "Subscriptions",
    description:
      "Accept payments, subscriptions, invoices, and plan upgrades.",
    comingSoon: true,
  },
  {
    provider: "shopify",
    name: "Shopify",
    category: "Commerce",
    icon: "🛒",
    statusLabel: "Store automation",
    description:
      "Answer product questions and assist customers from your store.",
    comingSoon: true,
  },
  {
    provider: "openai",
    name: "OpenAI",
    category: "AI",
    icon: "🤖",
    statusLabel: "AI engine",
    description:
      "Power intelligent replies, memory, booking extraction, and automation.",
    comingSoon: true,
  },
]

export default function IntegrationGrid({
  records,
  businessId,
}: {
  records: IntegrationRecord[]
  businessId: string
}) {
  const categories = Array.from(
    new Set(integrations.map((item) => item.category))
  )

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const categoryItems = integrations.filter(
          (item) => item.category === category
        )

        return (
          <section key={category}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {category}
              </h2>

              <span className="text-sm text-slate-500">
                {categoryItems.length} integrations
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {categoryItems.map((definition) => {
                const record = records.find(
                  (item) => item.provider === definition.provider
                )

                return (
                  <IntegrationCard
                    key={definition.provider}
                    definition={definition}
                    record={record}
                    businessId={businessId}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}