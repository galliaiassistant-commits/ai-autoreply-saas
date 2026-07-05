"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  Plug,
} from "lucide-react"

type NotificationItem = {
  id: string
  title: string
  description: string
  href: string
  type: "booking" | "message" | "integration" | "setup"
  createdAt?: string | null
}

export default function NotificationsMenu() {
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [readIds, setReadIds] = useState<string[]>([])

  useEffect(() => {
    loadNotifications()
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

  async function loadNotifications() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id, business_name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!business) {
      setNotifications([
        {
          id: "setup-business",
          title: "Finish onboarding",
          description: "No business profile was found for this account.",
          href: "/onboarding",
          type: "setup",
        },
      ])

      setLoading(false)
      return
    }

    const [
      { data: missingBookings },
      { data: recentMessages },
      { data: integrations },
      { data: services },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, service, status, created_at")
        .eq("business_id", business.id)
        .eq("status", "missing_details")
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("messages")
        .select("id, role, message, created_at")
        .eq("business_id", business.id)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("business_integrations")
        .select("id, provider, connected, created_at")
        .eq("business_id", business.id),

      supabase
        .from("business_services")
        .select("id, name, is_active")
        .eq("business_id", business.id)
        .eq("is_active", true),
    ])

    const items: NotificationItem[] = []

    if (!services || services.length === 0) {
      items.push({
        id: "setup-services",
        title: "Add your services",
        description:
          "Jhyro AI needs services before customers can book properly.",
        href: "/dashboard/business",
        type: "setup",
      })
    }

    const whatsapp = integrations?.find(
      (item) => item.provider === "whatsapp"
    )

    if (!whatsapp || !whatsapp.connected) {
      items.push({
        id: "setup-whatsapp",
        title: "WhatsApp is not connected",
        description:
          "Connect WhatsApp so Jhyro AI can reply to customers.",
        href: "/dashboard/integrations",
        type: "integration",
        createdAt: whatsapp?.created_at,
      })
    }

    missingBookings?.forEach((booking) => {
      items.push({
        id: `booking-${booking.id}`,
        title: "Booking needs details",
        description: booking.service
          ? `${booking.service} is missing date or time.`
          : "A customer started a booking but details are missing.",
        href: "/dashboard/bookings",
        type: "booking",
        createdAt: booking.created_at,
      })
    })

    recentMessages?.slice(0, 3).forEach((message) => {
      items.push({
        id: `message-${message.id}`,
        title: "New customer message",
        description:
          message.message?.slice(0, 90) ||
          "A customer sent a message.",
        href: "/dashboard/conversations",
        type: "message",
        createdAt: message.created_at,
      })
    })

    setNotifications(items)
    setLoading(false)
  }

  const unreadNotifications = notifications.filter(
    (item) => !readIds.includes(item.id)
  )

  function markAllRead() {
    setReadIds(notifications.map((item) => item.id))
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
      >
        <Bell size={20} />

        {unreadNotifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadNotifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <div>
              <h3 className="font-bold text-white">
                Notifications
              </h3>

              <p className="text-sm text-slate-500">
                {loading
                  ? "Loading..."
                  : `${unreadNotifications.length} unread`}
              </p>
            </div>

            <button
              type="button"
              onClick={markAllRead}
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => {
                const isRead = readIds.includes(item.id)

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setReadIds((current) => [
                        ...new Set([...current, item.id]),
                      ])
                      setOpen(false)
                    }}
                    className={`flex gap-3 rounded-xl p-4 transition hover:bg-slate-900 ${
                      isRead ? "opacity-60" : ""
                    }`}
                  >
                    <NotificationIcon type={item.type} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>

                        {!isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {item.description}
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Needs attention"}
                      </p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/20 text-green-400">
                  <CheckCircle2 size={22} />
                </div>

                <p className="mt-4 font-semibold text-white">
                  All caught up
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No important alerts right now.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-3">
            <button
              type="button"
              onClick={loadNotifications}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Refresh notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationIcon({
  type,
}: {
  type: NotificationItem["type"]
}) {
  const className =
    "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"

  if (type === "booking") {
    return (
      <div className={`${className} bg-yellow-500/20 text-yellow-400`}>
        <CalendarDays size={18} />
      </div>
    )
  }

  if (type === "message") {
    return (
      <div className={`${className} bg-blue-500/20 text-blue-400`}>
        <MessageCircle size={18} />
      </div>
    )
  }

  if (type === "integration") {
    return (
      <div className={`${className} bg-purple-500/20 text-purple-400`}>
        <Plug size={18} />
      </div>
    )
  }

  return (
    <div className={`${className} bg-red-500/20 text-red-400`}>
      <AlertCircle size={18} />
    </div>
  )
}