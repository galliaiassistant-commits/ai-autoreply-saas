import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock3,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Setup Guide | Jhyro AI",
  description:
    "Step-by-step instructions for connecting WhatsApp Business and Google Calendar to Jhyro AI.",
  alternates: {
    canonical: "https://jhyroai.com/help/setup",
  },
}

const whatsappSteps = [
  {
    title: "Prepare your Meta business account",
    description:
      "Sign in to Meta Business Suite and make sure you have administrator access to the business and its WhatsApp Business account.",
  },
  {
    title: "Open WhatsApp setup in Jhyro",
    description:
      "Sign in to Jhyro, open Integrations, select WhatsApp, and choose the available connection method.",
  },
  {
    title: "Enter the WhatsApp details",
    description:
      "For manual setup, copy the Phone Number ID and WhatsApp Business Account ID from Meta into Jhyro. Add the access token only in Jhyro's protected token field.",
  },
  {
    title: "Configure the Meta webhook",
    description:
      "In Meta, set the callback URL to https://jhyroai.com/api/whatsapp, enter the same verify token shown in Jhyro, and subscribe the WhatsApp account to message events.",
  },
  {
    title: "Save and test the connection",
    description:
      "Send a message to the connected WhatsApp number from a different phone. Confirm that Jhyro replies and that the conversation appears in the business dashboard.",
  },
]

const calendarSteps = [
  {
    title: "Open the Integrations page",
    description:
      "Sign in to Jhyro, go to Integrations, find Google Calendar, and select Connect.",
  },
  {
    title: "Choose the correct Google account",
    description:
      "Select the Google account that owns the calendar the business uses for appointments.",
  },
  {
    title: "Review and approve access",
    description:
      "Approve the requested Calendar permissions. Jhyro uses them to check busy times and create appointment events; it never needs your Google password.",
  },
  {
    title: "Return to Jhyro",
    description:
      "After approval, Google redirects you to Jhyro. The Google Calendar card should show Connected and display the selected account.",
  },
  {
    title: "Create a test booking",
    description:
      "Book an available appointment through WhatsApp. Confirm that it appears in both the Jhyro Bookings page and the connected Google Calendar.",
  },
]

export default function SetupGuidePage() {
  return (
    <main className="min-h-screen bg-[#060a13] text-white">
      <header className="border-b border-white/10 bg-[#060a13]/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 font-black text-slate-950">
              J
            </div>
            <div>
              <p className="font-bold">Jhyro AI</p>
              <p className="text-xs text-slate-500">Client setup guide</p>
            </div>
          </Link>

          <Link
            href="/auth/sign-in"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <Sparkles size={15} />
            Guided setup
          </div>
          <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl">
            Connect your business to Jhyro
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Follow these steps to connect WhatsApp Business and Google Calendar. Most businesses finish setup in about 15 minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#whatsapp"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-green-300"
            >
              <MessageCircle size={19} /> WhatsApp setup
            </a>
            <a
              href="#calendar"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400"
            >
              <CalendarDays size={19} /> Calendar setup
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-5 py-16">
        <SetupSection
          id="whatsapp"
          number="01"
          title="Connect WhatsApp Business"
          description="Let Jhyro receive customer messages and reply from the business's WhatsApp number."
          accent="green"
          icon={<MessageCircle size={28} />}
          steps={whatsappSteps}
        >
          <InfoPanel
            icon={<Phone size={20} />}
            title="What you need"
            text="A Meta business account, administrator access, a WhatsApp Business phone number, its Phone Number ID, its WhatsApp Business Account ID, and a valid access token."
          />
          <InfoPanel
            icon={<KeyRound size={20} />}
            title="Keep the access token private"
            text="Never send the token by WhatsApp, email, or screenshot. Enter it only inside Jhyro's protected setup form. Jhyro support will never ask you to post it publicly."
          />
        </SetupSection>

        <SetupSection
          id="calendar"
          number="02"
          title="Connect Google Calendar"
          description="Allow Jhyro to avoid busy times and add confirmed appointments to the business calendar."
          accent="blue"
          icon={<CalendarDays size={28} />}
          steps={calendarSteps}
        >
          <InfoPanel
            icon={<ShieldCheck size={20} />}
            title="You stay in control"
            text="Google shows every permission before connection. You can disconnect Jhyro later from the Integrations page or revoke access from your Google Account security settings."
          />
          <InfoPanel
            icon={<Clock3 size={20} />}
            title="Check the timezone"
            text="Before testing, confirm that the business timezone in Jhyro is correct. Appointment times are displayed and synchronized using that timezone."
          />
        </SetupSection>

        <section className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
              <CircleHelp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Having trouble?</h2>
              <p className="mt-2 max-w-3xl leading-7 text-slate-400">
                Confirm that you selected the correct business and Google account, then reconnect once. If the issue continues, record the exact error message and contact Jhyro support without including passwords or access tokens.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 p-8 text-center sm:p-12">
          <LockKeyhole className="mx-auto text-cyan-300" size={32} />
          <h2 className="mt-5 text-3xl font-black">Ready to connect?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Sign in to your business dashboard and open Integrations to begin.
          </p>
          <Link
            href="/dashboard/integrations"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:bg-slate-200"
          >
            Open Integrations <ArrowRight size={18} />
          </Link>
        </section>
      </div>

      <footer className="border-t border-white/10 px-5 py-7 text-center text-xs text-slate-600">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5">
          <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          <Link href="/data-deletion" className="hover:text-slate-300">Data Deletion</Link>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-300">
            jhyroai.com <ExternalLink size={12} />
          </Link>
        </div>
      </footer>
    </main>
  )
}

function SetupSection({
  id,
  number,
  title,
  description,
  icon,
  steps,
  accent,
  children,
}: {
  id: string
  number: string
  title: string
  description: string
  icon: React.ReactNode
  steps: Array<{ title: string; description: string }>
  accent: "green" | "blue"
  children: React.ReactNode
}) {
  const color =
    accent === "green"
      ? "bg-green-400/10 text-green-300 border-green-400/20"
      : "bg-blue-500/10 text-blue-300 border-blue-400/20"

  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">Step {number}</p>
          <h2 className="mt-1 text-3xl font-black">{title}</h2>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {steps.map((step, index) => (
          <article key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
              {index + 1}
            </div>
            <div>
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{step.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

function InfoPanel({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center gap-3 text-cyan-300">
        {icon}
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-300">
        <CheckCircle2 size={15} /> Secure setup recommended
      </div>
    </div>
  )
}