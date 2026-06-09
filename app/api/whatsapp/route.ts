import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("MODE:", mode)
  console.log("TOKEN:", token)
  console.log(
    "EXPECTED:",
    process.env.WHATSAPP_VERIFY_TOKEN
  )

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(challenge)
  }

  return new Response(
    "Verification failed",
    { status: 403 }
  )
}

  return new Response(
    "Verification failed",
    {
      status: 403,
    }
  )
}

export async function POST(req: Request) {
  const body =
    await req.json()

  try {
    const message =
      body.entry?.[0]
        ?.changes?.[0]
        ?.value?.messages?.[0]

    if (!message)
      return Response.json({
        ok: true,
      })

    const userText =
      message.text?.body

    const from =
      message.from

    const ai =
      await openai.chat.completions.create(
        {
          model:
            "gpt-4o-mini",

          messages: [
            {
              role:
                "system",

              content:
                "You are GalliAssist, a helpful AI assistant on WhatsApp.",
            },

            {
              role:
                "user",

              content:
                userText,
            },
          ],
        }
      )

    const reply =
      ai.choices[0]
        .message.content

    await fetch(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          messaging_product:
            "whatsapp",

          to: from,

          text: {
            body: reply,
          },
        }),
      }
    )

    return Response.json({
      success: true,
    })
  } catch (err) {
    console.log(err)

    return Response.json({
      error:
        "Something went wrong",
    })
  }
}