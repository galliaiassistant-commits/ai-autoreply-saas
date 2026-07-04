"use client"

import { useState } from "react"
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
}: {
  definition: IntegrationDefinition
  record?: IntegrationRecord
  businessId: string
}) {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(record?.connected || false)

  async function toggleConnection() {
    if (definition.comingSoon) return

    setLoading(true)

    const nextConnected = !connected

    const { error } = await supabase
      .from("business_integrations")
      .upsert(
        {
          business_id: businessId,
          provider: definition.provider,
          connected: nextConnected,
          metadata: record?.metadata || {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "business_id,provider",
        }
      )

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setConnected(nextConnected)
  }

  const lastUpdated = record?.updated_at
    ? new Date(record.updated_at).toLocaleString()
    : "Never"

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

        <IntegrationStatus
          connected={connected}
          comingSoon={definition.comingSoon}
        />
      </div>

      <p className="mt-5 min-h-12 text-sm leading-relaxed text-slate-400">
        {definition.description}
      </p>

      <div className="mt-5 rounded-2xl bg-slate-950 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Health</span>
          <span
            className={
              connected
                ? "font-semibold text-green-400"
                : "font-semibold text-slate-500"
            }
          >
            {connected ? "Healthy" : "Inactive"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Last Updated</span>
          <span className="text-slate-300">{lastUpdated}</span>
        </div>
      </div>

      {record?.phone_number && (
        <div className="mt-4 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
          Number: {record.phone_number}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={toggleConnection}
          disabled={loading || definition.comingSoon}
          className={
            connected
              ? "flex-1 rounded-xl border border-red-500 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              : "flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
          }
        >
          {definition.comingSoon
            ? "Coming Soon"
            : loading
            ? "Saving..."
            : connected
            ? "Disconnect"
            : "Connect"}
        </button>

        <button
          type="button"
          disabled={!connected}
          className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          Manage
        </button>
      </div>
    </div>
  )
}