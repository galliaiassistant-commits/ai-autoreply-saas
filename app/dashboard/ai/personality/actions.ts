"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"

type SavePersonalityInput = {
  personality: string
  goals?: string[]
}

export async function saveBusinessPersonality({
  personality,
  goals,
}: SavePersonalityInput) {
  const business = await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
  }

  const supabase = await createClient()

  const cleanPersonality = personality.trim()

  if (!cleanPersonality) {
    return {
      ok: false,
      error: "Personality cannot be empty.",
    }
  }

  const updateData: {
    personality: string
    ai_goals?: string[]
  } = {
    personality: cleanPersonality,
  }

  if (goals) {
    updateData.ai_goals = goals
  }

  const { error } = await supabase
    .from("businesses")
    .update(updateData)
    .eq("id", business.id)
    .eq("owner_id", business.owner_id)

  if (error) {
    console.error("SAVE PERSONALITY ERROR:", error)

    return {
      ok: false,
      error: error.message,
    }
  }

  revalidatePath("/dashboard/ai/personality")

  return {
    ok: true,
  }
}