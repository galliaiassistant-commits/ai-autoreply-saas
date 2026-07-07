import OpenAI from "openai"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export async function updateCustomerSummary(
  openai: OpenAI,
  customerId: string,
  userText: string,
  memoryText: string
) {
  const { data: existingSummary } = await supabase
    .from("customer_summaries")
    .select("summary")
    .eq("customer_id", customerId)
    .maybeSingle()

  const summaryPrompt = `
Current summary:
${existingSummary?.summary || "No summary yet"}

New message:
${userText}

Known memories:
${memoryText}

Update the summary. Keep it short and useful for a business assistant.
`

  const summaryResponse =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Create a concise customer summary for future conversations.",
        },
        {
          role: "user",
          content: summaryPrompt,
        },
      ],
    })

  const updatedSummary =
    summaryResponse.choices[0].message.content || ""

  await supabase.from("customer_summaries").upsert({
    customer_id: customerId,
    summary: updatedSummary,
    updated_at: new Date().toISOString(),
  })
}