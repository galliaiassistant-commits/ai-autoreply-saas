import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  CalendarDays,
  MessageCircle,
  HelpCircle,
  Clock,
  XCircle,
  Repeat2,
  Handshake,
  ShieldCheck,
  ArrowRight,
  Bot,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react"

const actions = [
  {
    key: "greeting",
    title: "Greeting",
    description:
      "When a customer says hi, hello, or hey, Jhyro AI greets them naturally.",
    examples: [
      "hi",
      "hello",
      "hey",
    ],
    icon: MessageCircle,
  },
  {
    key: "business_question",
    title:
      "Business Questions",
    description:
      "When customers ask about services, prices, location, or contact details, Jhyro AI answers using business settings and knowledge.",
    examples: [
      "what services do you offer?",
      "where are you located?",
    ],
    icon: HelpCircle,
  },
  {
    key: "opening_hours",
    title: "Opening Hours",
    description:
      "When customers ask if the business is open, Jhyro AI answers using saved business hours.",
    examples: [
      "are you open today?",
      "what time do you close?",
    ],
    icon: Clock,
  },
  {
    key: "book_appointment",
    title:
      "Book Appointment",
    description:
      "When customers want to book, schedule, reserve, or make an appointment, Jhyro AI starts the booking flow.",
    examples: [
      "I want to book",
      "can I schedule an appointment?",
    ],
    icon: CalendarDays,
  },
  {
    key:
      "reschedule_booking",
    title:
      "Reschedule Booking",
    description:
      "When customers ask to move or change a booking time, Jhyro AI helps update the appointment.",
    examples: [
      "can I change the time?",
      "move my appointment",
    ],
    icon: Repeat2,
  },
  {
    key: "cancel_booking",
    title: "Cancel Booking",
    description:
      "When customers say cancel, never mind, or forget it, Jhyro AI can cancel the open booking request.",
    examples: [
      "cancel it",
      "never mind",
    ],
    icon: XCircle,
  },
  {
    key: "thank_you",
    title: "Thank You",
    description:
      "When customers say thanks, Jhyro AI responds politely without restarting the conversation.",
    examples: [
      "thanks",
      "thank you",
    ],
    icon: Handshake,
  },
]

export default async function AIActionsPage() {
  const business =
    await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
  }

  const canUseAdvancedAutomation =
    businessCanUseFeature(
      business,
      "advanced_automation"
    )

  if (
    !canUseAdvancedAutomation
  ) {
    return (
      <div>
        <PageHeader
          title="AI Actions"
          description="Configure advanced AI routing and automation."
        />

        <section className="mt-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-slate-950 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-400 text-slate-950">
            <LockKeyhole
              size={26}
            />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-purple-300">
            Business feature
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Unlock Advanced
            Automation
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Upgrade to the Business
            plan to access advanced
            intent routing, automation
            controls, and expanded AI
            workflows.
          </p>

          <Link
            href="/dashboard/billing"
            className="mt-6 inline-flex rounded-xl bg-purple-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-purple-300"
          >
            Upgrade to Business
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="AI Actions"
        description="View how Jhyro AI detects customer intent and routes conversations."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
              <Bot size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Action Router
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Active for{" "}
                <span className="font-semibold text-white">
                  {business.business_name ||
                    "this business"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <ShieldCheck
                  size={22}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Security
                </p>

                <p className="font-bold text-green-400">
                  Protected Page
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatCard
          title="Actions"
          value={actions.length}
        />

        <StatCard
          title="Booking Flow"
          value="Enabled"
        />

        <StatCard
          title="Business Scope"
          value="Secured"
        />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Supported Actions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              These are the customer
              intents Jhyro AI
              currently understands.
            </p>
          </div>

          <Link
            href="/dashboard/ai/knowledge"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200"
          >
            Manage Knowledge
            <ArrowRight
              size={15}
            />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {actions.map(
            (action) => {
              const Icon =
                action.icon

              return (
                <div
                  key={action.key}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
                      <Icon
                        size={22}
                      />
                    </div>

                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                      Active
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white">
                    {action.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {
                      action.description
                    }
                  </p>

                  <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Examples
                    </p>

                    {action.examples.map(
                      (example) => (
                        <div
                          key={
                            example
                          }
                          className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-slate-300"
                        >
                          “{example}”
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            }
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          How Jhyro AI Routes
          Messages
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <FlowStep
            number="1"
            title="Customer sends message"
            description="Message comes from WhatsApp."
          />

          <FlowStep
            number="2"
            title="Intent detected"
            description="Jhyro AI classifies the message."
          />

          <FlowStep
            number="3"
            title="Route selected"
            description="Booking, knowledge, or general AI reply."
          />

          <FlowStep
            number="4"
            title="Reply sent"
            description="Response is saved and sent to WhatsApp."
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <CheckCircle2
          size={18}
          className="text-green-400"
        />
      </div>

      <p className="mt-4 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function FlowStep({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-black">
        {number}
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