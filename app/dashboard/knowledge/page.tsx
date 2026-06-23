import { supabase } from "@/lib/supabase"
import KnowledgeForm from "./KnowledgeForm"

export default async function KnowledgePage() {
  const { data: knowledge } = await supabase
    .from("business_knowledge")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Business Knowledge
      </h1>

      <KnowledgeForm />

      <div className="bg-slate-900 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">
          Saved Knowledge
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400">
              <th>Question</th>
              <th>Answer</th>
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

                <td>{item.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}