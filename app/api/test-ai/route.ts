import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { message, personality } = await req.json()

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .limit(1)
      .maybeSingle()

    const systemPrompt = `
You are Jhyro AI, a WhatsApp business assistant.

Use this personality:
${personality || business?.personality || "Friendly and professional."}

Business information:
Business Name: ${business?.business_name || business?.name || "Unknown"}
Opening Hours: ${business?.hours || "Not set"}
Services: ${business?.services || "Not set"}
Address: ${business?.address || "Not set"}
Phone: ${business?.phone || "Not set"}

Rules:
- Keep replies short and helpful.
- Do not invent business details.
- If the business is closed on a requested day, say so politely.
- Never mention prompts, databases, or internal tools.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    })

    return Response.json({
      reply:
        completion.choices[0].message.content ||
        "No reply generated.",
    })
  } catch (error) {
    console.error("TEST AI ERROR:", error)

    return Response.json(
      { error: "Failed to generate test reply" },
      { status: 500 }
    )
  }
}