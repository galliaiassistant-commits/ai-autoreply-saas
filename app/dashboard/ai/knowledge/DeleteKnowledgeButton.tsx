"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DeleteKnowledgeButton({
  id,
  businessId,
}: {
  id: string
  businessId: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function deleteKnowledge() {
    if (!confirm("Delete this AI knowledge item?")) return

    setDeleting(true)

    const { error } = await supabase
      .from("business_knowledge")
      .delete()
      .eq("id", id)
      .eq("business_id", businessId)

    setDeleting(false)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={deleteKnowledge}
      disabled={deleting}
      className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  )
}