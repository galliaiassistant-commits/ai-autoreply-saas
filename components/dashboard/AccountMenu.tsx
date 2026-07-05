"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  Building2,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
  Repeat2,
} from "lucide-react"

type Business = {
  id: string
  business_name: string | null
  email?: string | null
}

export default function AccountMenu() {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    async function loadAccount() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setEmail(user.email || null)

      const { data: businessData } = await supabase
        .from("businesses")
        .select("id, business_name, email")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      setBusiness(businessData || null)
      setLoading(false)
    }

    loadAccount()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  async function signOut(redirectTo: string) {
    setSigningOut(true)

    await supabase.auth.signOut()

    setSigningOut(false)
    router.push(redirectTo)
    router.refresh()
  }

  const businessName =
    business?.business_name || "Business"

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left transition hover:bg-slate-800"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
          <Building2 size={18} />
        </div>

        <div className="hidden sm:block">
          <p className="max-w-40 truncate text-sm font-bold text-white">
            {loading ? "Loading..." : businessName}
          </p>

          <p className="max-w-40 truncate text-xs text-slate-500">
            {email || "Signed in"}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
                <UserRound size={20} />
              </div>

              <div>
                <p className="font-bold text-white">
                  {businessName}
                </p>

                <p className="text-sm text-slate-500">
                  {email || "No email found"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <MenuLink
              href="/dashboard/business"
              icon={<Building2 size={17} />}
              title="Business Profile"
              description="View business details"
              onClick={() => setOpen(false)}
            />

            <MenuLink
              href="/dashboard/settings"
              icon={<Settings size={17} />}
              title="Settings"
              description="Account and workspace settings"
              onClick={() => setOpen(false)}
            />

            <button
              type="button"
              onClick={() => signOut("/auth/sign-in")}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-slate-900 disabled:opacity-50"
            >
              <div className="text-slate-400">
                <Repeat2 size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Switch Account
                </p>

                <p className="text-xs text-slate-500">
                  Sign in with a different account
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => signOut("/auth/sign-in")}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <div className="text-red-400">
                <LogOut size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-400">
                  {signingOut ? "Signing out..." : "Sign Out"}
                </p>

                <p className="text-xs text-slate-500">
                  End this dashboard session
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  href,
  icon,
  title,
  description,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-slate-900"
    >
      <div className="text-slate-400">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  )
}