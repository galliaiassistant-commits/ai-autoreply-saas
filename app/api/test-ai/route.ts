import OpenAI from "openai"
import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const business = await getCurrentBusiness()

    if (!business) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : ""

    const previewPersonality =
      typeof body.personality === "string"
        ? body.personality.trim()
        : ""

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const personality =
      previewPersonality ||
      business.personality ||
      `You are Jhyro AI, a friendly and professional business assistant.

Rules:
- Keep replies short and natural.
- Ask one question at a time.
- Never invent business information.
- Help customers clearly.`

    const businessName =
      business.business_name || "this business"

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are testing the AI personality for ${businessName}.

Use this personality:
${personality}

This is only a dashboard preview.
Do not claim that a real booking was created.
Do not send external messages.
Keep the reply short and realistic.
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      })

    const reply =
      completion.choices[0]?.message?.content ||
      "I could not generate a reply."

    return NextResponse.json({
      reply,
    })
  } catch (error) {
    console.error("TEST AI ERROR:", error)

    return NextResponse.json(
      { error: "Failed to test AI reply" },
      { status: 500 }
    )
  }
}