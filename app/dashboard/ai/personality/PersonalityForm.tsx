"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PersonalityForm({
  initialPersonality,
}: {
  initialPersonality: string
}) {
  const router = useRouter()

  const [personality, setPersonality] = useState(
    initialPersonality
  )

  const [loading, setLoading] = useState(false)

  async function savePersonality() {
    setLoading(true)

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (!business) {
      alert("No business found")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        personality,
      })
      .eq("id", business.id)

    setLoading(false)

    if (error) {
      alert(error.message)
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
        onChange={(e) =>
          setPersonality(e.target.value)
        }
        className="min-h-48 w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
      />

      <button
        onClick={savePersonality}
        disabled={loading}
        className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black"
      >
        {loading ? "Saving..." : "Save Personality"}
      </button>
    </div>
  )
}