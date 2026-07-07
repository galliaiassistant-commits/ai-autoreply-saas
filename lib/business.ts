import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

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
    .select("category, question, answer")
    .order("category")

  if (error) {
    console.error("BUSINESS KNOWLEDGE ERROR:", error)
    return "No business knowledge available."
  }

  if (!data || data.length === 0) {
    return "No business knowledge added yet."
  }

  return data
    .map(
      (item) => `
Category: ${item.category || "General"}
Question: ${item.question}
Answer: ${item.answer}
`
    )
    .join("\n----------------------\n")
}