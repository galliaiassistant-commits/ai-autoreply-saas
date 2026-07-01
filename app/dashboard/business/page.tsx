"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"

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

    if (error) alert(error.message)

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
        email: business.email,
        website: business.website,
        country: business.country,
        city: business.city,
        currency: business.currency,
      })
      .eq("id", business.id)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Business settings saved!")
  }

  if (loading) {
    return <div className="text-slate-400">Loading business settings...</div>
  }

  if (!business) {
    return <div className="text-slate-400">No business found.</div>
  }

  return (
    <div>
      <PageHeader
        title="Business"
        description="Manage your business profile, contact details, services, and booking rules."
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Business Profile">
          <Input label="Business Name" value={business.business_name || business.name || ""} onChange={(v) => setBusiness({ ...business, business_name: v })} />
          <Input label="Phone Number" value={business.phone || ""} onChange={(v) => setBusiness({ ...business, phone: v })} />
          <Input label="Email" value={business.email || ""} onChange={(v) => setBusiness({ ...business, email: v })} />
          <Input label="Website" value={business.website || ""} onChange={(v) => setBusiness({ ...business, website: v })} />
        </Card>

        <Card title="Location">
          <Input label="Address" value={business.address || ""} onChange={(v) => setBusiness({ ...business, address: v })} />
          <Input label="City" value={business.city || ""} onChange={(v) => setBusiness({ ...business, city: v })} />
          <Input label="Country" value={business.country || "Jamaica"} onChange={(v) => setBusiness({ ...business, country: v })} />
          <Input label="Currency" value={business.currency || "JMD"} onChange={(v) => setBusiness({ ...business, currency: v })} />
        </Card>

        <Card title="Operations">
          <Textarea label="Opening Hours" value={business.hours || ""} placeholder="Monday to Saturday, 9 AM to 6 PM" onChange={(v) => setBusiness({ ...business, hours: v })} />
          <Textarea label="Services and Prices" value={business.services || ""} placeholder={"Haircut - $2500\nBeard trim - $1000"} onChange={(v) => setBusiness({ ...business, services: v })} />
        </Card>

        <Card title="Booking Rules">
          <Textarea label="Booking Policy" value={business.booking_policy || ""} placeholder="Appointments require a service, date, and time. Closed on Sundays." onChange={(v) => setBusiness({ ...business, booking_policy: v })} />
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={saveBusiness}
          disabled={saving}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Business"}
        </button>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-5 text-xl font-bold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
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
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />
    </label>
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
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="mt-2 w-full resize-none rounded-xl bg-slate-800 p-3 text-white outline-none"
      />
    </label>
  )
}