"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveBusinessPersonality } from "./actions"

export default function PersonalityForm({
  initialPersonality,
}: {
  initialPersonality: string
}) {
  const router = useRouter()

  const [personality, setPersonality] =
    useState(initialPersonality)

  const [loading, setLoading] = useState(false)

  async function savePersonality() {
    setLoading(true)

    const result = await saveBusinessPersonality({
      personality,
    })

    setLoading(false)

    if (!result.ok) {
      alert(result.error)
      return
    }

    router.refresh()
    alert("Personality updated!")
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">
        AI Personality
      </h2>

      <textarea
        value={personality}
        onChange={(e) => setPersonality(e.target.value)}
        className="min-h-48 w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
      />

      <button
        type="button"
        onClick={savePersonality}
        disabled={loading}
        className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Personality"}
      </button>
    </div>
  )
}