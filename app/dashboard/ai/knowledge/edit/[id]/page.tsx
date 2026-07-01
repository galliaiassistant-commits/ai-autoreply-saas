import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import KnowledgeForm from "../../KnowledgeForm"

export default async function EditKnowledgePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: knowledge } = await supabase
    .from("business_knowledge")
    .select("*")
    .eq("id", id)
    .single()

  return (
    <div>
      <PageHeader
        title="Edit Knowledge"
        description="Update what Jhyro AI knows."
      />

      <KnowledgeForm knowledge={knowledge} />
    </div>
  )
}