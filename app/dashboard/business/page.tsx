"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BusinessSettingsPage() {
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBusiness()
  }, [])

  async function loadBusiness() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("LOAD BUSINESS ERROR:", error)
    }

    setBusiness(data)
    setLoading(false)
  }

  async function saveBusiness() {
    if (!business) return

    setSaving(true)

    const { error } = await supabase
      .from("businesses")
      .update({
        business_name: business.business_name,
        phone: business.phone,
        address: business.address,
        hours: business.hours,
        services: business.services,
        booking_policy: business.booking_policy,
        personality: business.personality,
      })
      .eq("id", business.id)

    if (error) {
      console.error("SAVE BUSINESS ERROR:", error)
      alert("Failed to save settings.")
    } else {
      alert("Business settings saved.")
    }

    setSaving(false)
  }

  if (loading) {
    return <main className="p-6">Loading business settings...</main>
  }

  if (!business) {
    return <main className="p-6">No business found.</main>
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Business Settings</h1>
          <p className="text-gray-400 mt-2">
            Control what Jhyro AI knows about your business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Business Info</h2>

            <Input
              label="Business Name"
              value={business.business_name || business.name || ""}
              onChange={(v) =>
                setBusiness({ ...business, business_name: v })
              }
            />

            <Input
              label="Phone Number"
              value={business.phone || ""}
              onChange={(v) =>
                setBusiness({ ...business, phone: v })
              }
            />

            <Textarea
              label="Address"
              value={business.address || ""}
              onChange={(v) =>
                setBusiness({ ...business, address: v })
              }
            />
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Operations</h2>

            <Textarea
              label="Opening Hours"
              value={business.hours || ""}
              placeholder="Example: Monday to Saturday, 9 AM - 6 PM"
              onChange={(v) =>
                setBusiness({ ...business, hours: v })
              }
            />

            <Textarea
              label="Services"
              value={business.services || ""}
              placeholder="Example: Haircut, shave, beard trim"
              onChange={(v) =>
                setBusiness({ ...business, services: v })
              }
            />
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Policy</h2>

            <Textarea
              label="Booking Rules"
              value={business.booking_policy || ""}
              placeholder="Example: Bookings require date, time, and service. Same-day appointments allowed if available."
              onChange={(v) =>
                setBusiness({ ...business, booking_policy: v })
              }
            />
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">AI Personality</h2>

            <Textarea
              label="Personality"
              value={business.personality || ""}
              placeholder="Example: Friendly, professional, short replies, helpful tone."
              onChange={(v) =>
                setBusiness({ ...business, personality: v })
              }
            />
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={saveBusiness}
            disabled={saving}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </main>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-300 mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-white"
      />
    </div>
  )
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-300 mb-2">
        {label}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-white resize-none"
      />
    </div>
  )
}