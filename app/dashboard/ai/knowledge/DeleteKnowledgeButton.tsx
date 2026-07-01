"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Props = {
  id: string
}

export default function DeleteKnowledgeButton({
  id,
}: Props) {
  const router = useRouter()

  async function deleteKnowledge() {
    const confirmed = confirm(
      "Are you sure you want to delete this knowledge?"
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("business_knowledge")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={deleteKnowledge}
      className="text-red-400 hover:text-red-300"
    >
      Delete
    </button>
  )
}