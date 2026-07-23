import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Globe2,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react"
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Jhyro AI",
  applicationName: "Jhyro AI",
  description:
    "Jhyro AI is an AI business assistant that automates WhatsApp customer service, appointment booking, and Google Calendar scheduling.",
  keywords: [
    "AI business assistant",
    "WhatsApp automation",
    "AI receptionist",
    "appointment booking",
    "Jhyro AI",
  ],
  openGraph: {
    title: "Jhyro AI | Smarter Conversations. Better Business.",
    description:
      "Turn customer messages into helpful answers, qualified leads, and confirmed bookings.",
    url: "https://jhyroai.com",
    siteName: "Jhyro AI",
    type: "website",
  },
}

const features = [
  {
    title: "WhatsApp AI Assistant",
    description:
      "Reply to customer questions naturally and consistently through WhatsApp.",
    icon: MessageCircle,
    color: "text-green-400",
  },
  {
    title: "Automated Bookings",
    description:
      "Turn conversations into appointments while checking hours, availability, and conflicts.",
    icon: CalendarDays,
    color: "text-cyan-400",
  },
  {
    title: "Business Knowledge",
    description:
      "Teach Jhyro about services, prices, policies, locations, and common questions.",
    icon: Brain,
    color: "text-purple-400",
  },
  {
    title: "Customer Profiles",
    description:
      "Organize customer details and provide more relevant service across conversations.",
    icon: Users,
    color: "text-orange-400",
  },
  {
    title: "Google Calendar",
    description:
      "Create calendar events and prevent bookings during existing busy times.",
    icon: Clock3,
    color: "text-blue-400",
  },
  {
    title: "Business Analytics",
    description:
      "Monitor conversations, customers, bookings, integrations, and business activity.",
    icon: BarChart3,
    color: "text-pink-400",
  },
]

const integrations = [
  ["WhatsApp", "💬", "Available", true],
  ["Google Calendar", "📅", "Available", true],
  ["Instagram", "📸", "Coming Soon", false],
  ["Messenger", "📘", "Coming Soon", false],
  ["Gmail", "📧", "Coming Soon", false],
  ["Shopify", "🛍️", "Coming Soon", false],
] as const

const plans = [
  {
    name: "Starter",
    price: "29.00",
    description: "Essential AI messaging for a growing business.",
    features: [
      "WhatsApp AI replies",
      "Conversation dashboard",
      "Customer profiles",
      "Business dashboard",
      "One business workspace",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "49.99",
    description: "Advanced automation, knowledge, and bookings.",
    features: [
      "Everything in Starter",
      "Automated appointments",
      "Google Calendar integration",
      "Customer memory",
      "AI business knowledge",
      "Service management",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "99.99",
    description: "Multi-business control and advanced automation.",
    features: [
      "Everything in Pro",
      "Up to five business workspaces",
      "Separate data per workspace",
      "Advanced automation controls",
      "Shared subscription management",
      "Business-level administration",
    ],
    featured: false,
  },
]

const industries = [
  "Healthcare",
  "Beauty & Wellness",
  "Professional Services",
  "Automotive",
  "Hospitality",
  "Retail",
]

export default async function Home() {
  const user = await getCurrentUser()
  const admin = user ? await getCurrentAdmin() : null
  const primaryAction = user ? "/dashboard" : "/auth/sign-up"

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute right-[-15rem] top-[30rem] h-[35rem] w-[35rem] rounded-full bg-purple-500/10 blur-[140px]" />
        <div className="absolute bottom-[-20rem] left-[-15rem] h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/75 px-5 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6">
          <Brand />

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-400 lg:flex">
            <Link href="#about" className="transition hover:text-white">About</Link>
            <Link href="#features" className="transition hover:text-white">Features</Link>
            <Link href="#how-it-works" className="transition hover:text-white">How It Works</Link>
            <Link href="#integrations" className="transition hover:text-white">Integrations</Link>
            <Link href="#pricing" className="transition hover:text-white">Pricing</Link>
            <Link href="/help/setup" className="transition hover:text-white">Setup Guide</Link>
            <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
            <Link href="/chat" className="transition hover:text-white">AI Chat</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {admin && (
              <Link
                href="/admin"
                className="hidden rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-400/20 sm:inline-flex"
              >
                Admin
              </Link>
            )}

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
              >
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="hidden px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white sm:inline-flex"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
                >
                  Start Free <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative px-5 pb-24 pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              <Sparkles size={15} /> AI-powered customer conversations
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Jhyro AI turns every message into a{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                business opportunity.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-400 sm:text-xl">
              Jhyro AI is an AI business assistant that answers customer
              questions through WhatsApp, manages appointment requests,
              checks availability, and creates confirmed bookings in the
              business&apos;s connected Google Calendar.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={primaryAction}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-7 py-4 font-black text-slate-950 shadow-2xl shadow-blue-500/20 transition hover:scale-[1.02] sm:w-auto"
              >
                {user ? "Open Dashboard" : "Start Your Free Month"}
                <ArrowRight size={19} className="transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-7 py-4 font-bold transition hover:border-slate-600 hover:bg-slate-800 sm:w-auto"
              >
                <Bot size={19} /> Open AI Chat
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <TrustItem text="First month free" />
              <TrustItem text="PayPal subscription" />
              <TrustItem text="Cancel from Billing" />
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      <section
        id="about"
        aria-labelledby="about-jhyro-title"
        className="border-y border-white/10 bg-slate-900/40 px-5 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              About the application
            </p>
            <h2
              id="about-jhyro-title"
              className="mt-4 text-4xl font-black tracking-tight sm:text-5xl"
            >
              What is Jhyro AI?
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-300">
              Jhyro AI is a customer communication and appointment scheduling
              application for businesses. It helps businesses answer customer
              questions through WhatsApp, provide information about services,
              prices and opening hours, collect appointment details, check
              availability, and confirm valid bookings.
            </p>
            <p className="mx-auto mt-5 max-w-4xl leading-8 text-slate-400">
              When a business chooses to connect Google Calendar, Jhyro AI uses
              the authorized Calendar access to identify the selected calendar,
              check free and busy periods to prevent scheduling conflicts, and
              create appointment events after a booking is confirmed. Jhyro AI
              does not require the user&apos;s Google password, and users can
              disconnect Google Calendar from the Integrations page.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <PurposeCard
              icon={<Building2 size={23} />}
              title="Who it serves"
              description="Businesses that receive customer enquiries and appointment requests through WhatsApp."
            />
            <PurposeCard
              icon={<MessageCircle size={23} />}
              title="What it does"
              description="Answers business questions and turns complete, valid customer requests into appointments."
            />
            <PurposeCard
              icon={<CalendarDays size={23} />}
              title="Why Calendar access is used"
              description="Checks availability and creates confirmed appointment events in the calendar selected by the business."
            />
          </div>

          <div className="mt-8 rounded-3xl border border-blue-400/20 bg-blue-400/5 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                <LockKeyhole size={23} />
              </div>
              <div>
                <h3 className="text-xl font-black">
                  How Jhyro AI uses Google user data
                </h3>
                <p className="mt-3 leading-8 text-slate-400">
                  Jhyro AI requests Google account identity and Calendar
                  permissions only after the user chooses to connect Google
                  Calendar. The account email is used to identify the connected
                  account. Calendar-list access identifies the selected calendar,
                  free/busy access checks appointment availability, and event
                  access creates and manages confirmed booking events. This data
                  is used only to provide Jhyro&apos;s calendar integration and is
                  not used for advertising.
                </p>
                <p className="mt-3 leading-8 text-slate-400">
                  Users can disconnect Google Calendar from Jhyro or revoke
                  access through their Google Account. Details about collection,
                  use, storage, deletion, and user choices are provided in the
                  Jhyro AI Privacy Policy.
                </p>
                <Link
                  href="/privacy"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-4 py-2.5 text-sm font-black text-blue-200 transition hover:bg-blue-400/20"
                >
                  Read the Privacy Policy <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-slate-900/30 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 lg:flex-row">
          <p className="shrink-0 text-sm font-semibold text-slate-500">
            Built for modern businesses across industries
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {industries.map((industry) => (
              <span key={industry} className="text-sm font-bold text-slate-300">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Powerful automation"
            title="One intelligent system for customer service and growth."
            description="Respond faster, stay organized, and convert more conversations into results."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-7 transition duration-300 hover:-translate-y-1 hover:border-slate-700"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-950">
                    <Icon size={25} className={feature.color} />
                  </div>
                  <h3 className="mt-6 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-24">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-slate-800 bg-slate-900/60 p-7 sm:p-12">
          <SectionHeading
            eyebrow="Simple setup"
            title="From account creation to automated conversations."
            description="Jhyro guides each business through setup and securely separates its data."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-4">
            <ProcessStep number="01" title="Create your account" description="Add your business details and complete guided onboarding." icon={<Building2 />} />
            <ProcessStep number="02" title="Connect WhatsApp" description="Securely connect the business number and messaging account." icon={<MessageCircle />} />
            <ProcessStep number="03" title="Teach Jhyro" description="Add services, hours, knowledge, and your AI personality." icon={<Brain />} />
            <ProcessStep number="04" title="Start automating" description="Let Jhyro answer questions and manage booking requests." icon={<Zap />} />
          </div>
        </div>
      </section>

      <section id="integrations" className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Connected business"
            title="Your conversations and schedule, working together."
            description="Connect today's essential services and expand into more channels as Jhyro grows."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map(([name, icon, status, active]) => (
              <article key={name} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-2xl">{icon}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black">{name}</h3>
                    <span className={active ? "rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-400" : "rounded-full bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-500"}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Business integration</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-purple-500/10 p-8 lg:grid-cols-[1fr_0.9fr] lg:p-14">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              <ShieldCheck size={18} /> Built with security in mind
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Business data stays within its business.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Jhyro separates customer information, conversations, bookings,
              integrations, and AI settings by business. Private administration
              does not expose customer conversation or booking content.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SecurityCard icon={<LockKeyhole />} title="Protected access" description="Private routes verify the signed-in account." />
            <SecurityCard icon={<Building2 />} title="Separate workspaces" description="Each workspace keeps its operational data separate." />
            <SecurityCard icon={<Globe2 />} title="Secure domain" description="Jhyro runs through its HTTPS production domain." />
            <SecurityCard icon={<ShieldCheck />} title="Privacy controls" description="Legal and data-deletion information is public." />
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Straightforward pricing"
            title="Choose the automation level your business needs."
            description="Every plan begins with the free first month configured through PayPal."
          />
          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={plan.featured
                  ? "relative rounded-[2rem] border border-cyan-400/50 bg-gradient-to-b from-cyan-400/10 to-slate-900 p-7 shadow-2xl shadow-cyan-500/10"
                  : "relative rounded-[2rem] border border-slate-800 bg-slate-900/60 p-7"}
              >
                {plan.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">MOST POPULAR</span>
                )}
                <p className="text-lg font-black">{plan.name}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-lg font-bold text-slate-500">$</span>
                  <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                  <span className="pb-1 text-slate-500">/month</span>
                </div>
                <p className="mt-5 min-h-14 leading-7 text-slate-400">{plan.description}</p>
                <Link
                  href={user ? "/dashboard/billing" : `/auth/sign-up?plan=${plan.name.toLowerCase()}`}
                  className={plan.featured
                    ? "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 font-black text-slate-950 transition hover:bg-cyan-200"
                    : "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-5 py-3.5 font-black transition hover:bg-slate-800"}
                >
                  Start Free Month <ArrowRight size={17} />
                </Link>
                <div className="mt-7 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400"><Check size={13} /></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Subscription billing and the free trial are processed securely through PayPal.
          </p>
        </div>
      </section>

      <section className="px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow="Questions" title="Frequently asked questions" description="Important details before getting started." />
          <div className="mt-12 space-y-4">
            <Faq question="Does Jhyro replace my business WhatsApp?" answer="Jhyro connects business messaging to AI automation. The exact connection method depends on the business's existing WhatsApp and Meta setup." />
            <Faq question="Can Jhyro prevent double bookings?" answer="Pro and Business plans can check hours, bookings, breaks, closures, past times, and connected Google Calendar availability." />
            <Faq question="Can I manage more than one business?" answer="The Business plan supports up to five separate workspaces under one shared subscription." />
            <Faq question="Is the first month free?" answer="Yes. PayPal displays the trial and future billing terms before the subscription is approved." />
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 pt-12">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-16 text-center shadow-2xl shadow-blue-500/20 sm:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_35%)]" />
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Sparkles size={28} /></div>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Give your business a faster, smarter way to respond.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">Set up Jhyro AI, connect your business, and begin your free first month.</p>
            <Link href={primaryAction} className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-black text-slate-950 transition hover:scale-[1.02]">
              {user ? "Open Your Dashboard" : "Create Your Account"} <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950/80 px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Brand />
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">Smarter conversations. Better business.</p>
            </div>
            <div className="grid gap-8 text-sm sm:grid-cols-3">
              <FooterGroup title="Product" links={[["Features", "#features"], ["Integrations", "#integrations"], ["Pricing", "#pricing"], ["Setup Guide", "/help/setup"], ["AI Chat", "/chat"]]} />
              <FooterGroup title="Account" links={[["Sign In", "/auth/sign-in"], ["Create Account", "/auth/sign-up"], ["Dashboard", "/dashboard"], ["Billing", "/dashboard/billing"]]} />
              <FooterGroup title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Data Deletion", "/data-deletion"]]} />
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Jhyro AI. All rights reserved.</p>
            <p>Customer communication automation for modern businesses.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 font-black text-slate-950 shadow-lg shadow-blue-500/20">J</div>
      <div>
        <p className="text-lg font-black tracking-tight">Jhyro AI</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Business Assistant</p>
      </div>
    </Link>
  )
}

function TrustItem({ text }: { text: string }) {
  return <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" />{text}</span>
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-20 max-w-6xl">
      <div className="absolute inset-0 translate-y-12 rounded-[3rem] bg-blue-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-400" /></div>
          <div className="rounded-full border border-slate-800 bg-slate-950 px-4 py-1.5 text-xs text-slate-500">jhyroai.com/dashboard</div>
          <div className="h-6 w-14" />
        </div>
        <div className="grid min-h-[30rem] lg:grid-cols-[15rem_1fr]">
          <aside className="hidden border-r border-slate-800 bg-slate-950/60 p-5 lg:block">
            <Brand />
            <div className="mt-8 space-y-2 text-sm">
              {["Overview", "Conversations", "Customers", "Bookings", "AI Knowledge", "Integrations"].map((item, index) => (
                <div key={item} className={index === 0 ? "rounded-xl bg-white px-4 py-3 font-semibold text-black" : "rounded-xl px-4 py-3 text-slate-500"}>{item}</div>
              ))}
            </div>
          </aside>
          <div className="p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Business overview</p><h2 className="mt-1 text-2xl font-black">Good morning</h2></div>
              <span className="rounded-full bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400">● AI Active</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <PreviewStat title="Conversations" value="Active" icon={<MessagesSquare size={19} />} />
              <PreviewStat title="Bookings" value="Organized" icon={<CalendarDays size={19} />} />
              <PreviewStat title="Integrations" value="Connected" icon={<Workflow size={19} />} />
            </div>
            <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between"><p className="font-bold">AI activity</p><Zap size={20} className="text-cyan-400" /></div>
                <div className="mt-8 flex h-40 items-end gap-2">
                  {[35, 55, 42, 78, 58, 92, 68, 83, 64, 96, 74, 88].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-300 opacity-80" style={{ height: `${height}%` }} />)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="font-bold">Recent conversation</p>
                <div className="mt-5 space-y-4 text-sm"><div className="mr-8 rounded-2xl bg-slate-800 p-3 text-slate-300">What time are you available tomorrow?</div><div className="ml-8 rounded-2xl bg-blue-500/15 p-3 text-blue-200">We have openings tomorrow. What service would you like?</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewStat({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{title}</span><span className="text-cyan-400">{icon}</span></div><p className="mt-4 text-xl font-black">{value}</p></div>
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-400">{eyebrow}</p><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{title}</h2><p className="mt-5 text-lg leading-8 text-slate-400">{description}</p></div>
}

function ProcessStep({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400">{icon}</div><span className="text-sm font-black text-slate-700">{number}</span></div><h3 className="mt-6 text-lg font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></article>
}

function SecurityCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-5"><div className="text-cyan-400">{icon}</div><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></article>
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return <details className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">{question}<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg text-slate-400 transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl leading-7 text-slate-400">{answer}</p></details>
}

function PurposeCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-black">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>
    </article>
  ) 
}

function FooterGroup({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return <div className="min-w-36"><p className="font-black">{title}</p><div className="mt-4 flex flex-col gap-3">{links.map(([label, href]) => <Link key={`${href}-${label}`} href={href} className="text-slate-500 transition hover:text-white">{label}</Link>)}</div></div>
}