"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type SidebarProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Conversations", href: "/dashboard/conversations", icon: "💬" },
  { label: "Customers", href: "/dashboard/customers", icon: "👥" },
  { label: "Bookings", href: "/dashboard/bookings", icon: "📅" },
  { label: "Business", href: "/dashboard/business", icon: "🏢" },
  { label: "AI Knowledge", href: "/dashboard/ai/knowledge", icon: "🧠" },
  { label: "AI Personality", href: "/dashboard/ai/personality", icon: "🤖" },
  { label: "AI Actions", href: "/dashboard/ai/actions", icon: "⚡" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { label: "Integrations", href: "/dashboard/integrations", icon: "🔗" },
  { label: "Billing", href: "/dashboard/billing", icon: "💳" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
]

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-gray-800 bg-gray-950 text-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white font-bold text-black">
                J
              </div>

              <div>
                <h1 className="text-xl font-bold">Jhyro AI</h1>
                <p className="text-xs text-gray-400">
                  Business Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-gray-400 hover:bg-gray-900 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="h-[calc(100vh-168px)] space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setOpen(false)
                  }
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white font-semibold text-black"
                    : "text-gray-300 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm font-semibold">Sanjay</p>
            <p className="mt-1 text-xs text-gray-400">
              Admin Account
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}