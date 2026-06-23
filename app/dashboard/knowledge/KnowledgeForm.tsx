"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function KnowledgeForm() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  async function saveKnowledge(e: React.FormEvent) {
    e.preventDefault()
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
      .from("business_knowledge")
      .insert({
        business_id: business.id,
        question,
        answer,
      })

    if (error) {
      alert(error.message)
    } else {
      setQuestion("")
      setAnswer("")
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <form
      onSubmit={saveKnowledge}
      className="bg-slate-900 p-6 rounded-2xl mb-8"
    >
      <h2 className="text-2xl font-bold mb-4">
        Add Knowledge
      </h2>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question e.g. Opening hours"
        className="w-full mb-4 p-3 rounded bg-slate-800 text-white"
        required
      />

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer e.g. We are open Monday to Saturday, 9 AM to 6 PM."
        className="w-full mb-4 p-3 rounded bg-slate-800 text-white"
        required
      />

      <button
        disabled={loading}
        className="bg-blue-600 px-5 py-3 rounded font-bold"
      >
        {loading ? "Saving..." : "Save Knowledge"}
      </button>
    </form>
  )
}