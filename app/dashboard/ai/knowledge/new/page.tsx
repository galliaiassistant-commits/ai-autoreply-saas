import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DataTable } from "@/components/dashboard/DataTable"

export default async function AIKnowledgePage() {
  const { data: knowledge } = await supabase
    .from("business_knowledge")
    .select("*")
    .order("created_at", { ascending: false })

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

      <DataTable title="Knowledge Base">
  <thead>
    <tr className="text-slate-400">
      <th>Question</th>
      <th>Answer</th>
      <th>Created</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {knowledge?.map((item) => (
      <tr
        key={item.id}
        className="border-t border-slate-800"
      >
        <td className="py-3">
          {item.question}
        </td>

        <td>
          {item.answer}
        </td>

        <td>
          {new Date(item.created_at).toLocaleDateString()}
        </td>

        <td>
          <Link
            href={`/dashboard/ai/knowledge/edit/${item.id}`}
            className="text-blue-400 hover:text-blue-300"
          >
            Edit
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</DataTable>
    </div>
  )
}