import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are GalliAssist AI, a professional business assistant.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      })

    return NextResponse.json({
      reply:
        completion.choices[0].message.content,
    })
  } catch (error: any) {
    return NextResponse.json({
      reply:
        "Server error: " + error.message,
    })
  }
}