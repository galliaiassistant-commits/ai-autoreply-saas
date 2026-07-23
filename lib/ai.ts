import OpenAI from "openai"

export async function generateReply(
  openai: OpenAI,
  messages: any[]
) {
  const startedAt = Date.now()

  const ai = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages,
    temperature: 0.3,
    max_completion_tokens: 120,
  })

  console.log(
    "MAIN AI GENERATION TIME:",
    `${Date.now() - startedAt}ms`
  )

  return (
    ai.choices?.[0]?.message?.content?.trim() ||
    "Sorry, I couldn't process that."
  )
}