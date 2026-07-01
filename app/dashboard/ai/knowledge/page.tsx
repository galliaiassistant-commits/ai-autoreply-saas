import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import DeleteKnowledgeButton from "./DeleteKnowledgeButton"

export default async function AIKnowledgePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params?.q || ""

  let query = supabase
    .from("business_knowledge")
    .select("*")
    .order("created_at", { ascending: false })

  if (q) {
    query = query.or(`question.ilike.%${q}%,answer.ilike.%${q}%`)
  }

  const { data: knowledge } = await query

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeader
          title="AI Knowledge"
          description="Manage what Jhyro AI knows about the business."
        />

        <Link
          href="/dashboard/ai/knowledge/new"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
        >
          + Add Knowledge
        </Link>
      </div>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search knowledge..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-white outline-none"
        />
      </form>

      <div className="mt-6 space-y-4">
        {knowledge && knowledge.length > 0 ? (
          knowledge.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-400">
                    Question
                  </p>

                  <h2 className="text-lg font-bold text-white">
                    {item.question}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    href={`/dashboard/ai/knowledge/edit/${item.id}`}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700"
                  >
                    ✏ Edit
                  </Link>

                  <DeleteKnowledgeButton id={item.id} />
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-slate-400">
                  Answer
                </p>

                <p className="whitespace-pre-wrap text-slate-200">
                  {item.answer}
                </p>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Created {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
            No knowledge found.
          </div>
        )}
      </div>
    </div>
  )
}