import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Data Deletion | Jhyro AI",
  description:
    "Instructions for requesting deletion of your Jhyro AI account and associated business data.",
  alternates: {
    canonical: "https://jhyroai.com/data-deletion",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const deletionItems = [
  "Business profile and configuration",
  "Customer profiles and conversation records",
  "Bookings and appointment information",
  "Business knowledge and AI settings",
  "Integration records and stored connection credentials",
  "Customer memory and conversation summaries",
]

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Jhyro AI
        </Link>

        <header className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-7 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
            <Trash2 size={27} />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            Privacy control
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Jhyro AI Data Deletion
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
            You may request deletion of your Jhyro AI account and the personal or business data associated with it. This page explains how to submit a request and what happens next.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <Mail size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold">Request deletion by email</h2>
              <p className="mt-3 leading-7 text-slate-400">
                Send your request from the email address associated with your Jhyro AI account. This allows us to verify that you are authorized to delete the account and its business data.
              </p>

              <a
                href="mailto:galli.aiassistant@gmail.com?subject=Jhyro%20AI%20Data%20Deletion%20Request"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-slate-200"
              >
                Email galli.aiassistant@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <p className="font-bold">Include the following information:</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={17} />Your full name</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={17} />Your business name</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={17} />The email address associated with your Jhyro account</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={17} />A clear statement that you want your account and associated data deleted</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoCard
            icon={<Database size={23} />}
            title="Data included"
          >
            <ul className="space-y-3 text-sm leading-6 text-slate-400">
              {deletionItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-green-400" size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard
            icon={<Clock3 size={23} />}
            title="What happens next"
          >
            <p className="text-sm leading-7 text-slate-400">
              We may contact you to verify account ownership. After verification, we will process the request and confirm completion by email. Requests are normally completed within 30 days.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Certain transaction, security, tax, fraud-prevention, or legal records may be retained when required by law or necessary to establish or defend legal claims.
            </p>
          </InfoCard>
        </section>

        <section className="mt-8 rounded-3xl border border-blue-400/20 bg-blue-400/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-400/10 p-3 text-blue-300">
              <ShieldCheck size={23} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Disconnect connected services</h2>
              <p className="mt-3 leading-7 text-slate-400">
                You may disconnect WhatsApp or Google Calendar from the Jhyro Integrations page before requesting deletion. You can also revoke Jhyro&apos;s access directly from your Google Account security settings or Meta business settings.
              </p>
              <Link
                href="/dashboard/integrations"
                className="mt-5 inline-flex rounded-xl border border-blue-400/20 px-4 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-400/10"
              >
                Open Integrations
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-800 pt-7 text-sm text-slate-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Jhyro AI</p>
            <nav className="flex flex-wrap gap-5">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/help/setup" className="hover:text-white">Setup Guide</Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  )
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-800 p-3 text-cyan-300">
          {icon}
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}