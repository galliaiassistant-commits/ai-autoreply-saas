"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Bot,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react"
import AccountMenu from "@/components/dashboard/AccountMenu"
import NotificationsMenu from "@/components/dashboard/NotificationsMenu"
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher"

type Workspace = {
  id: string
  business_name: string | null
}

type TopbarProps = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  businesses?: Workspace[]
  currentBusinessId?: string | null
  canManageWorkspaces?: boolean
}

export function Topbar({
  sidebarOpen,
  setSidebarOpen,
  businesses = [],
  currentBusinessId = null,
  canManageWorkspaces = false,
}: TopbarProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true

    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin/status", {
          cache: "no-store",
        })

        if (!response.ok) return

        const data = (await response.json()) as {
          isAdmin?: boolean
        }

        if (active) {
          setIsAdmin(data.isAdmin === true)
        }
      } catch {
        if (active) setIsAdmin(false)
      }
    }

    checkAdmin()

    return () => {
      active = false
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
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

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {canManageWorkspaces && businesses.length > 0 && (
            <div className="hidden sm:block">
              <WorkspaceSwitcher
                businesses={businesses}
                currentBusinessId={currentBusinessId}
              />
            </div>
          )}

          <Link
            href="/chat"
            title="Open Jhyro AI Chat"
            className="hidden h-11 items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-400/10 px-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-400/20 md:inline-flex"
          >
            <Bot size={17} />
            AI Chat
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              title="Open Admin Dashboard"
              className="hidden h-11 items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-400/20 md:inline-flex"
            >
              <ShieldCheck size={17} />
              Admin
            </Link>
          )}

          <Link
            href="/dashboard"
            title="Business Dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800 md:hidden"
          >
            <LayoutDashboard size={18} />
          </Link>

          <NotificationsMenu />
          <AccountMenu />
        </div>
      </div>

      {canManageWorkspaces && businesses.length > 0 && (
        <div className="mt-3 sm:hidden">
          <WorkspaceSwitcher
            businesses={businesses}
            currentBusinessId={currentBusinessId}
          />
        </div>
      )}

      <div className="mt-3 flex gap-2 md:hidden">
        <Link
          href="/chat"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-xs font-semibold text-blue-200"
        >
          <Bot size={15} /> AI Chat
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-xs font-semibold text-purple-200"
          >
            <ShieldCheck size={15} /> Admin
          </Link>
        )}
      </div>
    </header>
  )
}