import { supabase } from "@/lib/supabase"

export async function getBusiness() {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("BUSINESS ERROR:", error)
  }

  return data
}

export async function getBusinessKnowledgeText() {
  const { data, error } = await supabase
    .from("business_knowledge")
    .select("question, answer")
    .limit(20)

  if (error) {
    console.error("BUSINESS KNOWLEDGE ERROR:", error)
  }

  return (
    data
      ?.map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n") || "No business knowledge added yet."
  )
}