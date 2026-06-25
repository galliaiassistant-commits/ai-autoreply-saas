import OpenAI from "openai"

export async function generateReply(
  openai: OpenAI,
  messages: any[]
) {
  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  })

  return (
    ai.choices?.[0]?.message?.content ||
    "Sorry, I couldn't process that."
  )
}