"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"


const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Conversations", href: "/dashboard/conversations", icon: "💬" },
  { label: "Customers", href: "/dashboard/customers", icon: "👥" },
  { label: "Bookings", href: "/dashboard/bookings", icon: "📅" },
  { label: "Business", href: "/dashboard/business", icon: "🏢" },
  { label: "AI Knowledge", href: "/dashboard/ai/knowledge", icon: "🧠" },
  { label: "AI Personality", href: "/dashboard/ai/personality", icon: "🤖" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { label: "Integrations", href: "/dashboard/integrations", icon: "🔗" },
  { label: "Billing", href: "/dashboard/billing", icon: "💳" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-72 flex-col border-r border-gray-800 bg-gray-950 text-white">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            J
          </div>

          <div>
            <h1 className="font-bold text-xl">Jhyro AI</h1>
            <p className="text-xs text-gray-400">Business Assistant</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-white text-black font-semibold"
                  : "text-gray-300 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
          <p className="text-sm font-semibold">Sanjay</p>
          <p className="text-xs text-gray-400 mt-1">
            Admin Account
          </p>
        </div>
      </div>
    </aside>
  )
}