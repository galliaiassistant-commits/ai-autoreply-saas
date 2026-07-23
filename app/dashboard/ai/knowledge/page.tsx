import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { PageHeader } from "@/components/dashboard/PageHeader"
import DeleteKnowledgeButton from "./DeleteKnowledgeButton"

type KnowledgeItem = {
  id: string
  business_id: string
  question: string | null
  answer: string | null
  created_at: string | null
}

export default async function AIKnowledgePage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string
  }>
}) {
  const business =
    await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="AI Knowledge"
          description="Manage what Jhyro AI knows about the business."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No business found for this
          account.
        </div>
      </div>
    )
  }

  const canUseBusinessKnowledge =
    businessCanUseFeature(
      business,
      "business_knowledge"
    )

  if (!canUseBusinessKnowledge) {
    return (
      <div>
        <PageHeader
          title="AI Knowledge"
          description="Teach Jhyro AI accurate information about your business."
        />

        <section className="mt-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-950 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
            <LockKeyhole size={26} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            Pro feature
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Unlock Business Knowledge
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Upgrade to Pro or Business
            to add business facts,
            policies, frequently asked
            questions, and approved
            answers that Jhyro AI can use
            when replying to customers.
          </p>

          <Link
            href="/dashboard/billing"
            className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Upgrade to Pro
          </Link>
        </section>
      </div>
    )
  }

  const supabase =
    await createClient()

  const params =
    await searchParams

  const q =
    params?.q?.trim() || ""

  let query = supabase
    .from("business_knowledge")
    .select(
      "id, business_id, question, answer, created_at"
    )
    .eq(
      "business_id",
      business.id
    )
    .order("created_at", {
      ascending: false,
    })

  if (q) {
    query = query.or(
      `question.ilike.%${q}%,answer.ilike.%${q}%`
    )
  }

  const {
    data: knowledge,
    error,
  } =
    await query.returns<
      KnowledgeItem[]
    >()

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="AI Knowledge"
          description="Manage what Jhyro AI knows about this business."
        />

        <Link
          href="/dashboard/ai/knowledge/new"
          className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
        >
          + Add Knowledge
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm font-semibold text-slate-300">
          Business scope
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Showing knowledge only for{" "}
          <span className="font-semibold text-white">
            {business.business_name ||
              "Current Business"}
          </span>
        </p>
      </div>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search knowledge..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none placeholder:text-slate-600"
        />
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
          {error.message}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {knowledge &&
        knowledge.length > 0 ? (
          knowledge.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-400">
                    Question
                  </p>

                  <h2 className="text-lg font-bold text-white">
                    {item.question ||
                      "Untitled question"}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href={`/dashboard/ai/knowledge/edit/${item.id}`}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700"
                  >
                    ✏ Edit
                  </Link>

                  <DeleteKnowledgeButton
                    id={item.id}
                    businessId={
                      business.id
                    }
                  />
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-400">
                  Answer
                </p>

                <p className="whitespace-pre-wrap text-slate-200">
                  {item.answer ||
                    "No answer saved."}
                </p>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Created{" "}
                {item.created_at
                  ? new Date(
                      item.created_at
                    ).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
            No knowledge found for this
            business.
          </div>
        )}
      </div>
    </div>
  )
}