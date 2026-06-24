"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsForm() {
  const [businessId, setBusinessId] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [hours, setHours] = useState("")
  const [services, setServices] = useState("")
  const [bookingPolicy, setBookingPolicy] = useState("")
  const [personality, setPersonality] = useState("friendly")
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
      setPersonality(data.personality || "friendly")
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
      personality,
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

    alert("Settings saved")
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Business Settings
      </h1>

      <form
        onSubmit={saveSettings}
        className="bg-slate-900 p-6 rounded-2xl max-w-3xl"
      >
        <label className="block mb-4">
          <span className="text-slate-400">Business Name</span>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            placeholder="Jhyro AI Demo"
          />
        </label>

        <label className="block mb-4">
          <span className="text-slate-400">Phone Number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            placeholder="876-000-0000"
          />
        </label>

        <label className="block mb-4">
          <span className="text-slate-400">Address</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            placeholder="May Pen, Clarendon"
          />
        </label>

        <label className="block mb-4">
          <span className="text-slate-400">Opening Hours</span>
          <textarea
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            placeholder="Monday to Saturday, 9 AM to 6 PM"
          />
        </label>

        <label className="block mb-4">
          <span className="text-slate-400">Services and Prices</span>
          <textarea
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            placeholder="Haircut - $25&#10;Beard trim - $10"
          />
        </label>

        <label className="block mb-4">
          <span className="text-slate-400">Booking Policy</span>
          <textarea
            value={bookingPolicy}
            onChange={(e) => setBookingPolicy(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
            placeholder="Appointments every 30 minutes. Walk-ins accepted if available."
          />
        </label>

        <label className="block mb-6">
          <span className="text-slate-400">AI Personality</span>
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="w-full mt-2 p-3 rounded bg-slate-800 text-white"
          >
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="sales-focused">Sales-focused</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>

        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </main>
  )
}