"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  normalizePlan,
  planIncludesFeature,
  PLAN_LABELS,
  type PlanFeature,
  type PlanName,
} from "@/lib/plans"

type SidebarProps = {
  open: boolean
  setOpen: (
    open: boolean
  ) => void
  subscriptionPlan?: string
}

type NavigationItem = {
  label: string
  href: string
  icon: string
  requiredFeature?:
    PlanFeature
  minimumPlan?:
    "Pro" | "Business"
}

const navItems:
  NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    label: "Conversations",
    href:
      "/dashboard/conversations",
    icon: "💬",
  },
  {
    label: "Customers",
    href:
      "/dashboard/customers",
    icon: "👥",
  },
  {
    label: "Bookings",
    href:
      "/dashboard/bookings",
    icon: "📅",
    requiredFeature:
      "appointment_bookings",
    minimumPlan: "Pro",
  },
  {
    label: "Business",
    href:
      "/dashboard/business",
    icon: "🏢",
  },
  {
    label: "AI Knowledge",
    href:
      "/dashboard/ai/knowledge",
    icon: "🧠",
    requiredFeature:
      "business_knowledge",
    minimumPlan: "Pro",
  },
  {
    label: "AI Personality",
    href:
      "/dashboard/ai/personality",
    icon: "🤖",
  },
  {
    label: "AI Actions",
    href:
      "/dashboard/ai/actions",
    icon: "⚡",
    requiredFeature:
      "advanced_automation",
    minimumPlan: "Business",
  },
  {
    label: "Analytics",
    href:
      "/dashboard/analytics",
    icon: "📊",
  },
  {
    label: "Integrations",
    href:
      "/dashboard/integrations",
    icon: "🔗",
  },
  {
    label: "Billing",
    href:
      "/dashboard/billing",
    icon: "💳",
  },
  {
    label: "Settings",
    href:
      "/dashboard/settings",
    icon: "⚙️",
  },
]

export function Sidebar({
  open,
  setOpen,
  subscriptionPlan = "free",
}: SidebarProps) {
  const pathname =
    usePathname()

  const plan =
    normalizePlan(
      subscriptionPlan
    )

  const planLabel =
    PLAN_LABELS[plan]

  function hasFeature(
    feature?: PlanFeature
  ) {
    if (!feature) {
      return true
    }

    return planIncludesFeature(
      plan,
      feature
    )
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setOpen(false)
          }
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-gray-800 bg-gray-950 text-white transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white font-bold text-black">
                J
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  Jhyro AI
                </h1>

                <p className="text-xs text-gray-400">
                  Business Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() =>
                setOpen(false)
              }
              className="rounded-xl px-3 py-2 text-gray-400 hover:bg-gray-900 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="h-[calc(100vh-168px)] space-y-1 overflow-y-auto p-4">
          {navItems.map(
            (item) => {
              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  item.href + "/"
                )

              const available =
                hasFeature(
                  item.requiredFeature
                )

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (
                      window.innerWidth <
                      768
                    ) {
                      setOpen(false)
                    }
                  }}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-white font-semibold text-black"
                      : "text-gray-300 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  <span>
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    {item.label}
                  </span>

                  {!available &&
                    item.minimumPlan && (
                      <span
                        className={
                          active
                            ? "rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black"
                            : "rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-300"
                        }
                      >
                        {
                          item.minimumPlan
                        }
                      </span>
                    )}
                </Link>
              )
            }
          )}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <Link
            href="/dashboard/billing"
            className="block rounded-2xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  Business Workspace
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Current plan
                </p>
              </div>

              <span
                className={
                  plan ===
                  ("business" as PlanName)
                    ? "rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300"
                    : plan ===
                        ("pro" as PlanName)
                      ? "rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300"
                      : "rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300"
                }
              >
                {planLabel}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}