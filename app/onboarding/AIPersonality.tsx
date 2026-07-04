"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AIPersonality({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [tone, setTone] = useState("Friendly")
  const [length, setLength] = useState("Short")
  const [salesStyle, setSalesStyle] = useState("Balanced")
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      alert("You must be signed in.")
      return
    }

    const personality = `
Tone: ${tone}
Response Length: ${length}
Sales Style: ${salesStyle}

Instructions:
Be helpful, accurate, professional, and focused on helping customers book appointments or get business information.
`

    const { error } = await supabase
      .from("businesses")
      .update({ personality })
      .eq("owner_id", user.id)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold">AI Personality</h2>
      <p className="mt-2 text-slate-400">
        Choose how your AI receptionist should sound.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Select label="Tone" value={tone} setValue={setTone} options={["Friendly", "Professional", "Luxury", "Casual"]} />
        <Select label="Reply Length" value={length} setValue={setLength} options={["Short", "Medium", "Detailed"]} />
        <Select label="Sales Style" value={salesStyle} setValue={setSalesStyle} options={["Soft", "Balanced", "Direct"]} />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>

        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  )
}

function Select({
  label,
  value,
  setValue,
  options,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
}) {
  return (
    <label>
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}