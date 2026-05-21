import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const messages = [
      {
        role: "system",
        content: `
You are GalliAssist, an advanced AI assistant.

Your personality should feel natural, intelligent, modern, and conversational like ChatGPT.

Rules:
- Speak naturally and clearly.
- Give smart and helpful answers.
- Avoid robotic wording.
- Be friendly and confident.
- Adapt to the user's tone.
- Remember the ongoing conversation.
- Help with coding, business, productivity, and general questions.
- Explain things simply when needed.
- Keep responses concise unless detail is needed.
- Never say "As an AI language model".
`,
      },

      // PREVIOUS CHAT HISTORY
      ...(body.history || []),

      // CURRENT USER MESSAGE
      {
        role: "user",
        content: body.message,
      },
    ]

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens: 500,
      })

    return NextResponse.json({
      reply:
        completion.choices[0].message.content,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong",
      },
      { status: 500 }
    )
  }
}