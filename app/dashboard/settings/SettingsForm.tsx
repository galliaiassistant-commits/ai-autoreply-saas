"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"

export default function SettingsForm() {
  const [businessId, setBusinessId] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [hours, setHours] = useState("")
  const [services, setServices] = useState("")
  const [bookingPolicy, setBookingPolicy] = useState("")
  const [timezone, setTimezone] = useState("America/Jamaica")
  const [language, setLanguage] = useState("English")
  const [notifications, setNotifications] = useState("enabled")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadBusiness() {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (!data) return

      setBusinessId(data.id)
      setBusinessName(data.business_name || data.name || "")
      setPhone(data.phone || "")
      setAddress(data.address || "")
      setHours(data.hours || "")
      setServices(data.services || "")
      setBookingPolicy(data.booking_policy || "")
      setTimezone(data.timezone || "America/Jamaica")
      setLanguage(data.language || "English")
      setNotifications(data.notifications || "enabled")
    }

    loadBusiness()
  }, [])

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      business_name: businessName,
      phone,
      address,
      hours,
      services,
      booking_policy: bookingPolicy,
      timezone,
      language,
      notifications,
    }

    let error

    if (businessId) {
      const res = await supabase
        .from("businesses")
        .update(payload)
        .eq("id", businessId)

      error = res.error
    } else {
      const res = await supabase
        .from("businesses")
        .insert(payload)
        .select()
        .single()

      error = res.error
      if (res.data) setBusinessId(res.data.id)
    }

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Settings saved!")
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your business profile, defaults, and preferences."
      />

      <form onSubmit={saveSettings} className="mt-6 space-y-6">
        <SettingsCard title="Business Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Jhyro AI Demo" />
            <InputField label="Phone Number" value={phone} onChange={setPhone} placeholder="876-000-0000" />
          </div>

          <InputField label="Address" value={address} onChange={setAddress} placeholder="May Pen, Clarendon" />
        </SettingsCard>

        <SettingsCard title="Business Operations">
          <TextAreaField label="Opening Hours" value={hours} onChange={setHours} placeholder="Monday to Saturday, 9 AM to 6 PM" />
          <TextAreaField label="Services and Prices" value={services} onChange={setServices} placeholder={"Haircut - $25\nBeard trim - $10"} />
          <TextAreaField label="Booking Policy" value={bookingPolicy} onChange={setBookingPolicy} placeholder="Appointments every 30 minutes. Walk-ins accepted if available." />
        </SettingsCard>

        <SettingsCard title="Preferences">
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField label="Timezone" value={timezone} onChange={setTimezone} options={["America/Jamaica", "America/New_York", "America/Toronto", "Europe/London"]} />
            <SelectField label="Language" value={language} onChange={setLanguage} options={["English", "Jamaican Patois", "Spanish", "French"]} />
            <SelectField label="Notifications" value={notifications} onChange={setNotifications} options={["enabled", "disabled"]} />
          </div>
        </SettingsCard>

        <SettingsCard title="Security">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoBox title="Account Security" value="Password and account controls coming soon." />
            <InfoBox title="Team Access" value="Team members and roles coming soon." />
          </div>
        </SettingsCard>

        <button
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-slate-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  )
}

function SettingsCard({
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

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
        placeholder={placeholder}
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 min-h-28 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
        placeholder={placeholder}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function InfoBox({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{value}</p>
    </div>
  )
}