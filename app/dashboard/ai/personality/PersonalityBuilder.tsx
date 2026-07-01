"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Props = {
  businessId: string
  initialPersonality: string
}

export default function PersonalityBuilder({
  businessId,
  initialPersonality,
}: Props) {
  const router = useRouter()

  const [tone, setTone] = useState("Friendly")
  const [length, setLength] = useState("Short")
  const [emoji, setEmoji] = useState("Light")
  const [salesStyle, setSalesStyle] = useState("Balanced")
  const [customInstructions, setCustomInstructions] =
    useState(initialPersonality)

  const [loading, setLoading] = useState(false)

  const generatedPersonality = `
Tone: ${tone}
Response Length: ${length}
Emoji Usage: ${emoji}
Sales Style: ${salesStyle}

Custom Instructions:
${customInstructions}
`

  async function savePersonality() {
    setLoading(true)

    const { error } = await supabase
      .from("businesses")
      .update({
        personality: generatedPersonality,
      })
      .eq("id", businessId)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
    alert("AI personality updated!")
  }

const presets = {
  Friendly: {
    tone: "Friendly",
    length: "Short",
    emoji: "Light",
    salesStyle: "Balanced",
    instructions:
      "Be friendly, warm and conversational. Make customers feel welcome.",
  },

  Professional: {
    tone: "Professional",
    length: "Medium",
    emoji: "None",
    salesStyle: "Balanced",
    instructions:
      "Be professional, polite and clear. Prioritize accuracy.",
  },

  Sales: {
    tone: "Friendly",
    length: "Short",
    emoji: "Light",
    salesStyle: "Direct",
    instructions:
      "Focus on converting conversations into bookings and sales without being pushy.",
  },

  Luxury: {
    tone: "Professional",
    length: "Detailed",
    emoji: "None",
    salesStyle: "Soft",
    instructions:
      "Sound elegant, premium and attentive. Make every customer feel valued.",
  },
}

function loadPreset(name: keyof typeof presets) {
  const preset = presets[name]

  setTone(preset.tone)
  setLength(preset.length)
  setEmoji(preset.emoji)
  setSalesStyle(preset.salesStyle)
  setCustomInstructions(preset.instructions)
}

  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-white">
        Personality Builder
      </h2>

<div className="mt-6">
  <h3 className="mb-3 text-lg font-semibold text-white">
    Quick Presets
  </h3>

  <div className="flex flex-wrap gap-3">
    <button
      type="button"
      onClick={() => loadPreset("Friendly")}
      className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
    >
      😊 Friendly
    </button>

    <button
      type="button"
      onClick={() => loadPreset("Professional")}
      className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
    >
      💼 Professional
    </button>

    <button
      type="button"
      onClick={() => loadPreset("Sales")}
      className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
    >
      💰 Sales
    </button>

    <button
      type="button"
      onClick={() => loadPreset("Luxury")}
      className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
    >
      👑 Luxury
    </button>
  </div>
</div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SelectBox
          label="Tone"
          value={tone}
          onChange={setTone}
          options={["Friendly", "Professional", "Casual", "Luxury", "Playful"]}
        />

        <SelectBox
          label="Response Length"
          value={length}
          onChange={setLength}
          options={["Short", "Medium", "Detailed"]}
        />

        <SelectBox
          label="Emoji Usage"
          value={emoji}
          onChange={setEmoji}
          options={["None", "Light", "Frequent"]}
        />

        <SelectBox
          label="Sales Style"
          value={salesStyle}
          onChange={setSalesStyle}
          options={["Soft", "Balanced", "Direct"]}
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm text-slate-400">
          Custom Instructions
        </label>

        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          className="min-h-40 w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
        />
      </div>

      <div className="mt-6 rounded-xl bg-slate-800 p-4">
        <p className="mb-2 text-sm font-semibold text-slate-400">
          Preview Prompt
        </p>

        <pre className="whitespace-pre-wrap text-sm text-slate-200">
          {generatedPersonality}
        </pre>
      </div>

      <button
        onClick={savePersonality}
        disabled={loading}
        className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Personality"}
      </button>
    </div>
  )
}

function SelectBox({
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
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}