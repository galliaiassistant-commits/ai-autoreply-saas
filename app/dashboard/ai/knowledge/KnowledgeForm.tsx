"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Knowledge = {
  id: string
  question: string
  answer: string
}

type KnowledgeFormProps = {
  knowledge?: Knowledge | null
}

export default function KnowledgeForm({
  knowledge,
}: KnowledgeFormProps) {
  const router = useRouter()

  const [question, setQuestion] = useState(
    knowledge?.question || ""
  )
  const [answer, setAnswer] = useState(
    knowledge?.answer || ""
  )
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(knowledge?.id)

  async function saveKnowledge(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (isEditing && knowledge) {
      const { error } = await supabase
        .from("business_knowledge")
        .update({
          question,
          answer,
        })
        .eq("id", knowledge.id)

      setLoading(false)

      if (error) {
        alert(error.message)
        return
      }

      router.push("/dashboard/ai/knowledge")
      router.refresh()
      return
    }

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

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push("/dashboard/ai/knowledge")
    router.refresh()
  }

  return (
    <form
      onSubmit={saveKnowledge}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <h2 className="mb-6 text-2xl font-bold text-white">
        {isEditing ? "Edit Knowledge" : "Add Knowledge"}
      </h2>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="mb-4 w-full rounded-xl bg-slate-800 p-3 text-white"
        required
      />

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        className="mb-6 min-h-40 w-full rounded-xl bg-slate-800 p-3 text-white"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : isEditing
            ? "Update Knowledge"
            : "Save Knowledge"}
      </button>
    </form>
  )
}