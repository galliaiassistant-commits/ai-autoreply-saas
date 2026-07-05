import Link from "next/link"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { ArrowLeft, Brain, Save } from "lucide-react"

type PageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function NewKnowledgePage({
  searchParams,
}: PageProps) {
  const business = await getCurrentBusiness()
  const params = await searchParams
  const error = params?.error

  if (!business) {
    redirect("/auth/sign-in")
  }

  async function createKnowledge(formData: FormData) {
    "use server"

    const business = await getCurrentBusiness()

    if (!business) {
      redirect("/auth/sign-in")
    }

    const question = String(formData.get("question") || "").trim()
    const answer = String(formData.get("answer") || "").trim()

    if (!question || !answer) {
      redirect("/dashboard/ai/knowledge/new?error=missing")
    }

    const { error } = await supabase
      .from("business_knowledge")
      .insert({
        business_id: business.id,
        question,
        answer,
      })

    if (error) {
      console.error("CREATE KNOWLEDGE ERROR:", error)
      redirect("/dashboard/ai/knowledge/new?error=save")
    }

    redirect("/dashboard/ai/knowledge")
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/ai/knowledge"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to AI Knowledge
        </Link>
      </div>

      <PageHeader
        title="Add AI Knowledge"
        description="Teach Jhyro AI a business-specific question and answer."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
            <Brain size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              New Knowledge Item
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              This will be saved only for{" "}
              <span className="font-semibold text-white">
                {business.business_name || "this business"}
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
          {error === "missing"
            ? "Please enter both a question and an answer."
            : "Could not save this knowledge item. Please try again."}
        </div>
      )}

      <form
        action={createKnowledge}
        className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div>
          <label className="text-sm font-semibold text-slate-300">
            Question
          </label>

          <input
            name="question"
            required
            placeholder="Example: What are your opening hours?"
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
          />
        </div>

        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-300">
            Answer
          </label>

          <textarea
            name="answer"
            required
            rows={8}
            placeholder="Example: We are open Monday to Saturday from 9 AM to 6 PM."
            className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Jhyro AI will use this when customers ask related questions.
          </p>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
          >
            <Save size={18} />
            Save Knowledge
          </button>
        </div>
      </form>
    </div>
  )
}