"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Bot,
  ChevronDown,
  Globe,
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
  setSidebarOpen: (
    open: boolean
  ) => void
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
  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true

    async function checkAdmin() {
      try {
        const response = await fetch(
          "/api/admin/status",
          {
            cache: "no-store",
          }
        )

        if (!response.ok) {
          return
        }

        const data =
          (await response.json()) as {
            isAdmin?: boolean
          }

        if (active) {
          setIsAdmin(
            data.isAdmin === true
          )
        }
      } catch {
        if (active) {
          setIsAdmin(false)
        }
      }
    }

    checkAdmin()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">

        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            aria-label={
              sidebarOpen
                ? "Close sidebar"
                : "Open sidebar"
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
          >
            {sidebarOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
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

          {canManageWorkspaces &&
            businesses.length > 0 && (
              <div className="hidden sm:block">
                <WorkspaceSwitcher
                  businesses={businesses}
                  currentBusinessId={
                    currentBusinessId
                  }
                />
              </div>
            )}


          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Jhyro
              <ChevronDown
                size={16}
                className={
                  menuOpen
                    ? "rotate-180 transition"
                    : "transition"
                }
              />
            </button>


            {menuOpen && (
              <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">

                <Link
                  href="https://jhyroai.com"
                  target="_blank"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-900"
                >
                  <Globe
                    size={18}
                    className="text-green-400"
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Visit Website
                    </p>
                    <p className="text-xs text-slate-500">
                      Open Jhyro AI website
                    </p>
                  </div>
                </Link>


                <Link
                  href="/chat"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-900"
                >
                  <Bot
                    size={18}
                    className="text-blue-400"
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI Chat
                    </p>
                    <p className="text-xs text-slate-500">
                      Test your AI assistant
                    </p>
                  </div>
                </Link>


                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-900"
                  >
                    <ShieldCheck
                      size={18}
                      className="text-purple-400"
                    />

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Admin Dashboard
                      </p>
                      <p className="text-xs text-slate-500">
                        Manage system
                      </p>
                    </div>
                  </Link>
                )}

              </div>
            )}
          </div>


          <Link
            href="/dashboard"
            title="Business Dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800 md:hidden"
          >
            <LayoutDashboard
              size={18}
            />
          </Link>

          <NotificationsMenu />

          <AccountMenu />

        </div>
      </div>


      {canManageWorkspaces &&
        businesses.length > 0 && (
          <div className="mt-3 sm:hidden">
            <WorkspaceSwitcher
              businesses={businesses}
              currentBusinessId={
                currentBusinessId
              }
            />
          </div>
        )}

    </header>
  )
}