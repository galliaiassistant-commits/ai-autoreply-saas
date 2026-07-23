"use server"

import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import { createClient } from "@/lib/supabase/server"

type DeleteKnowledgeInput = {
  id: string
  businessId: string
}

type DeleteKnowledgeResult = {
  success: boolean
  error?: string
}

export async function deleteKnowledgeItem({
  id,
  businessId,
}: DeleteKnowledgeInput): Promise<DeleteKnowledgeResult> {
  const knowledgeId =
    String(id || "").trim()

  const requestedBusinessId =
    String(businessId || "").trim()

  if (
    !knowledgeId ||
    !requestedBusinessId
  ) {
    return {
      success: false,
      error:
        "The knowledge item information is missing.",
    }
  }

  const business =
    await getCurrentBusiness()

  if (!business) {
    return {
      success: false,
      error:
        "You must sign in before deleting knowledge.",
    }
  }

  if (
    business.id !==
    requestedBusinessId
  ) {
    return {
      success: false,
      error:
        "You cannot delete knowledge belonging to another business.",
    }
  }

  const canDeleteKnowledge =
    businessCanUseFeature(
      business,
      "business_knowledge"
    )

  if (!canDeleteKnowledge) {
    return {
      success: false,
      error:
        "Business Knowledge requires the Pro or Business plan.",
    }
  }

  const supabase =
    await createClient()

  const { error } =
    await supabase
      .from("business_knowledge")
      .delete()
      .eq("id", knowledgeId)
      .eq(
        "business_id",
        business.id
      )

  if (error) {
    console.error(
      "DELETE KNOWLEDGE ERROR:",
      error
    )

    return {
      success: false,
      error:
        "Could not delete this knowledge item.",
    }
  }

  return {
    success: true,
  }
}