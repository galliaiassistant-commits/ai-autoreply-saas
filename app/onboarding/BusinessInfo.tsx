"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BusinessInfo({
  onNext,
}: {
  onNext: () => void
}) {
  const [businessId, setBusinessId] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadBusiness() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) return

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (data) {
        setBusinessId(data.id)
        setBusinessName(data.business_name || data.name || "")
        setPhone(data.phone || "")
        setAddress(data.address || "")
        setWebsite(data.website || "")
      }
    }

    loadBusiness()
  }, [])

  async function save() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      alert("You must be signed in.")
      return
    }

    const payload = {
      business_name: businessName,
      phone,
      address,
      website,
      owner_id: user.id,
    }

    if (businessId) {
      const { error } = await supabase
        .from("businesses")
        .update(payload)
        .eq("id", businessId)

      if (error) {
        setLoading(false)
        alert(error.message)
        return
      }
    } else {
      const { data, error } = await supabase
        .from("businesses")
        .insert(payload)
        .select()
        .single()

      if (error) {
        setLoading(false)
        alert(error.message)
        return
      }

      setBusinessId(data.id)
    }

    setLoading(false)
    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold">Business Information</h2>
      <p className="mt-2 text-slate-400">
        Tell Jhyro AI the basics about your business.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Input label="Business Name" value={businessName} setValue={setBusinessName} placeholder="Jhyro Barber Shop" />
        <Input label="Phone Number" value={phone} setValue={setPhone} placeholder="876-000-0000" />
        <Input label="Address" value={address} setValue={setAddress} placeholder="May Pen, Clarendon" />
        <Input label="Website" value={website} setValue={setWebsite} placeholder="https://example.com" />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={loading || !businessName}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  )
}

function Input({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  placeholder: string
}) {
  return (
    <label>
      <span className="text-sm text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />
    </label>
  )
}