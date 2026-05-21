import OpenAI from "openai"

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

Speak naturally, intelligently, and conversationally like ChatGPT.

- Be helpful and clear.
- Avoid robotic wording.
- Adapt to the user's tone.
- Give modern and concise answers.
- Never say "As an AI language model".
`,
      },

      ...(body.history || []),

      {
        role: "user",
        content: body.message,
      },
    ]

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
        temperature: 0.8,
      })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const text =
            chunk.choices[0]?.delta?.content || ""

          controller.enqueue(
            encoder.encode(text)
          )
        }

        controller.close()
      },
    })

    return new Response(readableStream)
  } catch (error: any) {
    console.error(error)

    return new Response(
      error?.message ||
        "Something went wrong",
      {
        status: 500,
      }
    )
  }
}