"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"

type Actions = {
  bookings: boolean
  cancelBookings: boolean
  rescheduleBookings: boolean
  businessQuestions: boolean
  pricing: boolean
  openingHours: boolean
  address: boolean
  phone: boolean
  recommendServices: boolean
  upsell: boolean
  collectLeads: boolean
  humanHandoff: boolean
  followUps: boolean
  faq: boolean
  complaints: boolean
}

const defaultActions: Actions = {
  bookings: true,
  cancelBookings: true,
  rescheduleBookings: true,
  businessQuestions: true,
  pricing: true,
  openingHours: true,
  address: true,
  phone: true,
  recommendServices: true,
  upsell: true,
  collectLeads: true,
  humanHandoff: true,
  followUps: true,
  faq: true,
  complaints: true,
}

const actionLabels: {
  key: keyof Actions
  title: string
  description: string
}[] = [
  {
    key: "bookings",
    title: "Accept Bookings",
    description: "Allow Jhyro AI to create appointment requests.",
  },
  {
    key: "cancelBookings",
    title: "Cancel Bookings",
    description: "Allow customers to cancel existing booking requests.",
  },
  {
    key: "rescheduleBookings",
    title: "Reschedule Bookings",
    description: "Allow customers to change booking dates and times.",
  },
  {
    key: "businessQuestions",
    title: "Answer Business Questions",
    description: "Allow Jhyro AI to answer general business questions.",
  },
  {
    key: "pricing",
    title: "Answer Pricing",
    description: "Allow Jhyro AI to answer pricing-related questions.",
  },
  {
    key: "openingHours",
    title: "Share Opening Hours",
    description: "Allow Jhyro AI to answer when the business is open.",
  },
  {
    key: "address",
    title: "Share Address",
    description: "Allow Jhyro AI to share the business location.",
  },
  {
    key: "phone",
    title: "Share Phone Number",
    description: "Allow Jhyro AI to share business contact numbers.",
  },
  {
    key: "recommendServices",
    title: "Recommend Services",
    description: "Allow Jhyro AI to suggest relevant services.",
  },
  {
    key: "upsell",
    title: "Upsell Services",
    description: "Allow Jhyro AI to softly suggest upgrades or add-ons.",
  },
  {
    key: "collectLeads",
    title: "Collect Leads",
    description: "Allow Jhyro AI to collect names, numbers, or interest.",
  },
  {
    key: "humanHandoff",
    title: "Human Handoff",
    description: "Allow Jhyro AI to offer escalation to a human.",
  },
  {
    key: "followUps",
    title: "Follow-ups",
    description: "Allow Jhyro AI to suggest follow-up actions.",
  },
  {
    key: "faq",
    title: "Answer FAQs",
    description: "Allow Jhyro AI to use the knowledge base for FAQs.",
  },
  {
    key: "complaints",
    title: "Handle Complaints",
    description: "Allow Jhyro AI to respond politely to complaints.",
  },
]

export default function AIActionsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [actions, setActions] = useState<Actions>(defaultActions)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadActions()
  }, [])

  async function loadActions() {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, ai_actions")
      .limit(1)
      .maybeSingle()

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setBusinessId(data.id)
      setActions({
        ...defaultActions,
        ...(data.ai_actions || {}),
      })
    }

    setLoading(false)
  }

  function toggleAction(key: keyof Actions) {
    setActions((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  async function saveActions() {
    if (!businessId) {
      alert("No business found.")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("businesses")
      .update({
        ai_actions: actions,
      })
      .eq("id", businessId)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("AI actions saved!")
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title="AI Actions"
          description="Control what Jhyro AI is allowed to do."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          Loading actions...
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="AI Actions"
        description="Control what Jhyro AI is allowed to do."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {actionLabels.map((action) => (
          <div
            key={action.key}
            className="flex items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div>
              <h3 className="font-semibold text-white">
                {action.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {action.description}
              </p>
            </div>

            <button
              onClick={() => toggleAction(action.key)}
              className={
                actions[action.key]
                  ? "rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black"
                  : "rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white"
              }
            >
              {actions[action.key] ? "On" : "Off"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={saveActions}
        disabled={saving}
        className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Actions"}
      </button>
    </div>
  )
}