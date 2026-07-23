import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Bot,
  Building2,
  ChevronRight,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { getCurrentAdmin } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Admin | Jhyro AI",
  description: "Private Jhyro AI platform administration.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect("/auth/sign-in?next=/admin")
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/8 bg-[#090e19] lg:flex">
        <div className="border-b border-white/8 px-6 py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20">
              <ShieldCheck size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold tracking-tight">Jhyro</p>
                <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Platform control center
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Management
          </p>

          <AdminNavItem
            href="/admin"
            icon={<LayoutDashboard size={19} />}
            label="Overview"
            active
          />
          <AdminNavItem
            href="/admin/businesses"
            icon={<Building2 size={19} />}
            label="Businesses"
          />
          <AdminNavItem
            href="/admin/payments"
            icon={<CreditCard size={19} />}
            label="Payments"
          />
          <AdminNavItem
            href="/admin#privacy"
            icon={<LockKeyhole size={19} />}
            label="Privacy controls"
          />

          <p className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Switch area
          </p>

          <AdminNavItem
            href="/dashboard"
            icon={<LayoutDashboard size={19} />}
            label="Business Dashboard"
          />
          <AdminNavItem
            href="/chat"
            icon={<Bot size={19} />}
            label="Jhyro AI Chat"
          />
          <AdminNavItem
            href="/"
            icon={<Globe2 size={19} />}
            label="Public Website"
          />
        </nav>

        <div className="m-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">
              Private access
            </p>
          </div>
          <p className="mt-3 truncate text-sm font-medium text-slate-300">
            {admin.email || "Jhyro administrator"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Protected by server-side account verification.
          </p>
        </div>

        <div className="border-t border-white/8 p-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Business Dashboard
            <ChevronRight size={17} />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#070b14]/85 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950">
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">Jhyro Admin</p>
                <p className="text-xs text-slate-500">Control center</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/chat"
                aria-label="Open AI Chat"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-200"
              >
                <Bot size={17} />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="min-h-screen px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>

        <footer className="border-t border-white/8 px-6 py-5 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Jhyro AI · Private administration
        </footer>
      </div>
    </div>
  )
}

function AdminNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex items-center gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/10 px-3 py-3 text-sm font-semibold text-cyan-200"
          : "flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
      }
    >
      {icon}
      {label}
    </Link>
  )
}