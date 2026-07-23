"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteKnowledgeItem } from "./actions"

export default function DeleteKnowledgeButton({
  id,
  businessId,
}: {
  id: string
  businessId: string
}) {
  const router = useRouter()

  const [deleting, setDeleting] =
    useState(false)

  async function deleteKnowledge() {
    const confirmed = window.confirm(
      "Delete this AI knowledge item?"
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)

    try {
      const result =
        await deleteKnowledgeItem({
          id,
          businessId,
        })

      if (!result.success) {
        alert(
          result.error ||
            "Could not delete this knowledge item."
        )

        return
      }

      router.refresh()
    } catch (error) {
      console.error(
        "DELETE KNOWLEDGE BUTTON ERROR:",
        error
      )

      alert(
        "Could not delete this knowledge item."
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={deleteKnowledge}
      disabled={deleting}
      className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
    >
      {deleting
        ? "Deleting..."
        : "Delete"}
    </button>
  )
}