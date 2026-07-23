"use client"

import {
  useMemo,
  useState,
} from "react"
import { LockKeyhole } from "lucide-react"
import { supabase } from "@/lib/supabase"
import IntegrationStatus from "./IntegrationStatus"
import {
  IntegrationDefinition,
  IntegrationRecord,
} from "./types"

export default function IntegrationCard({
  definition,
  record,
  businessId,
  canUseGoogleCalendar = true,
}: {
  definition: IntegrationDefinition
  record?: IntegrationRecord
  businessId: string
  canUseGoogleCalendar?: boolean
}) {
  const isWhatsApp =
    definition.provider === "whatsapp"

  const isGoogleCalendar =
    definition.provider ===
    "google_calendar"

  const googleCalendarLocked =
    isGoogleCalendar &&
    !canUseGoogleCalendar

  const realConnected =
    useMemo(() => {
      if (isWhatsApp) {
        return (
          record?.connected === true &&
          Boolean(
            record?.phone_number_id
          ) &&
          Boolean(
            record?.business_account_id
          )
        )
      }

      return (
        record?.connected === true
      )
    }, [record, isWhatsApp])

  const [loading, setLoading] =
    useState(false)

  const [connected, setConnected] =
    useState(realConnected)

  async function toggleConnection() {
    if (definition.comingSoon) {
      return
    }

    if (googleCalendarLocked) {
      window.location.assign(
        "/dashboard/billing"
      )

      return
    }

    if (isGoogleCalendar) {
      setLoading(true)

      window.location.assign(
        "/api/integrations/google-calendar/connect"
      )

      return
    }

    if (
      isWhatsApp &&
      !connected
    ) {
      alert(
        "WhatsApp needs setup first. Add the Phone Number ID and WABA ID before marking it connected."
      )

      return
    }

    setLoading(true)

    const nextConnected =
      !connected

    const { error } =
      await supabase
        .from(
          "business_integrations"
        )
        .upsert(
          {
            business_id:
              businessId,
            provider:
              definition.provider,
            connected:
              nextConnected,
            metadata:
              record?.metadata || {},
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "business_id,provider",
          }
        )

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setConnected(nextConnected)
  }

  function manageIntegration() {
    if (googleCalendarLocked) {
      window.location.assign(
        "/dashboard/billing"
      )

      return
    }

    if (isGoogleCalendar) {
      window.open(
        "https://calendar.google.com/",
        "_blank",
        "noopener,noreferrer"
      )

      return
    }

    if (isWhatsApp) {
      window.location.assign(
        "/dashboard/integrations/whatsapp"
      )
    }
  }

  const lastUpdated =
    record?.updated_at
      ? new Date(
          record.updated_at
        ).toLocaleString()
      : "Never"

  const healthText =
    googleCalendarLocked
      ? "Upgrade required"
      : connected
        ? "Healthy"
        : isWhatsApp
          ? "Setup required"
          : "Inactive"

  const googleAccountEmail =
    record?.metadata
      ?.google_account_email

  const googleCalendarName =
    record?.metadata
      ?.calendar_name ||
    "Primary calendar"

  return (
    <div className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
            {definition.icon}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {definition.name}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {definition.category}
            </p>
          </div>
        </div>

        {googleCalendarLocked ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
            <LockKeyhole size={13} />
            Pro feature
          </span>
        ) : (
          <IntegrationStatus
            connected={connected}
            comingSoon={
              definition.comingSoon
            }
          />
        )}
      </div>

      <p className="mt-5 min-h-12 text-sm leading-relaxed text-slate-400">
        {definition.description}
      </p>

      {isWhatsApp &&
        !connected && (
          <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            WhatsApp is not fully
            connected. Add your Phone
            Number ID and WhatsApp
            Business Account ID before
            enabling it.
          </div>
        )}

      {googleCalendarLocked && (
        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          Google Calendar is available
          on the Pro and Business plans.
          Upgrade to synchronize bookings
          and prevent scheduling conflicts.
        </div>
      )}

      {isGoogleCalendar &&
        !googleCalendarLocked &&
        connected &&
        googleAccountEmail && (
          <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm">
            <p className="font-semibold text-blue-200">
              {googleAccountEmail}
            </p>

            <p className="mt-1 text-blue-300/70">
              {googleCalendarName}
            </p>
          </div>
        )}

      <div className="mt-5 rounded-2xl bg-slate-950 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Health
          </span>

          <span
            className={
              googleCalendarLocked
                ? "font-semibold text-cyan-300"
                : connected
                  ? "font-semibold text-green-400"
                  : isWhatsApp
                    ? "font-semibold text-yellow-400"
                    : "font-semibold text-slate-500"
            }
          >
            {healthText}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Last Updated
          </span>

          <span className="text-slate-300">
            {lastUpdated}
          </span>
        </div>
      </div>

      {record?.phone_number && (
        <div className="mt-4 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
          Number:{" "}
          {record.phone_number}
        </div>
      )}

      {isWhatsApp &&
        record?.phone_number_id && (
          <div className="mt-4 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
            Phone Number ID:{" "}
            {record.phone_number_id}
          </div>
        )}

      {isWhatsApp &&
        record?.business_account_id && (
          <div className="mt-3 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
            WABA ID:{" "}
            {
              record.business_account_id
            }
          </div>
        )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={toggleConnection}
          disabled={
            loading ||
            definition.comingSoon
          }
          className={
            googleCalendarLocked
              ? "flex-1 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
              : isGoogleCalendar
                ? "flex-1 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
                : connected
                  ? "flex-1 rounded-xl border border-red-500 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  : "flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
          }
        >
          {definition.comingSoon
            ? "Coming Soon"
            : loading
              ? "Connecting..."
              : googleCalendarLocked
                ? "Upgrade to Pro"
                : isGoogleCalendar
                  ? connected
                    ? "Reconnect"
                    : "Connect"
                  : connected
                    ? "Disconnect"
                    : isWhatsApp
                      ? "Setup Required"
                      : "Connect"}
        </button>

        {!googleCalendarLocked && (
          <button
            type="button"
            onClick={
              manageIntegration
            }
            disabled={
              !connected &&
              !isWhatsApp
            }
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
          >
            {isGoogleCalendar
              ? "Open Calendar"
              : "Manage"}
          </button>
        )}
      </div>
    </div>
  )
}