import Link from "next/link"
import type { ReactNode } from "react"

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Conversations", "/dashboard/conversations"],
  ["Customers", "/dashboard/customers"],
  ["Bookings", "/dashboard/bookings"],
  ["Business", "/dashboard/business"],
  ["AI Knowledge", "/dashboard/ai/knowledge"],
  ["AI Personality", "/dashboard/ai/personality"],
  ["Analytics", "/dashboard/analytics"],
  ["Integrations", "/dashboard/integrations"],
  ["Team", "/dashboard/team"],
  ["Billing", "/dashboard/billing"],
  ["Settings", "/dashboard/settings"],
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 border-r border-gray-800 bg-gray-950 p-5 hidden md:block">
        <h1 className="text-2xl font-bold mb-8">Jhyro AI</h1>

        <nav className="space-y-2">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-gray-900 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-6">
          <p className="text-sm text-gray-400">Dashboard</p>

          <div className="flex items-center gap-3">
            <input
              placeholder="Search..."
              className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm outline-none"
            />

            <button className="bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold">
              New
            </button>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}