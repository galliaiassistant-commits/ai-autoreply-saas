"use client"

import { Menu, X } from "lucide-react"
import AccountMenu from "@/components/dashboard/AccountMenu"
import NotificationsMenu from "@/components/dashboard/NotificationsMenu"

type TopbarProps = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Topbar({
  sidebarOpen,
  setSidebarOpen,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden md:block">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600">
              Jhyro AI
            </p>

            <h1 className="text-xl font-bold text-white">
              Business Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsMenu />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}