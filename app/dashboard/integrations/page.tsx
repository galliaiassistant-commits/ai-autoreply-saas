import { PageHeader } from "@/components/dashboard/PageHeader"
import { CheckCircle2, Clock3 } from "lucide-react"

const integrations = [
  {
    name: "WhatsApp Business",
    status: "Connected",
    description:
      "Receive messages, reply with AI, and manage bookings.",
    connected: true,
  },
  {
    name: "Instagram",
    status: "Coming Soon",
    description:
      "Automatically reply to Instagram DMs and comments.",
    connected: false,
  },
  {
    name: "Facebook Messenger",
    status: "Coming Soon",
    description:
      "Handle Messenger conversations with Jhyro AI.",
    connected: false,
  },
  {
    name: "Website Chat",
    status: "Coming Soon",
    description:
      "Add a live AI chat widget to your website.",
    connected: false,
  },
  {
    name: "Email",
    status: "Coming Soon",
    description:
      "Reply to customer emails using AI.",
    connected: false,
  },
  {
    name: "Google Calendar",
    status: "Coming Soon",
    description:
      "Sync bookings directly with your calendar.",
    connected: false,
  },
  {
    name: "Stripe",
    status: "Coming Soon",
    description:
      "Accept payments and manage subscriptions.",
    connected: false,
  },
  {
    name: "SMS",
    status: "Coming Soon",
    description:
      "Respond to SMS messages with AI.",
    connected: false,
  },
]

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect Jhyro AI to your business channels and services."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {integration.name}
              </h2>

              {integration.connected ? (
                <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                  <CheckCircle2 size={16} />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400">
                  <Clock3 size={16} />
                  Coming Soon
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {integration.description}
            </p>

            <button
              disabled={!integration.connected}
              className={`mt-6 w-full rounded-xl py-3 font-semibold ${
                integration.connected
                  ? "bg-white text-black hover:bg-slate-200"
                  : "cursor-not-allowed bg-slate-800 text-slate-500"
              }`}
            >
              {integration.connected
                ? "Manage Integration"
                : "Not Available Yet"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}