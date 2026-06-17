import OpenAI from "openai"

console.log(
  "OPENAI KEY EXISTS:",
  !!process.env.OPENAI_API_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

console.log("MODE:", mode)
console.log("TOKEN FROM META:", token)
console.log(
  "TOKEN FROM VERCEL:",
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
    {
      status: 403,
    }
  )
}
export async function POST(req: Request) {
  const body =
    await req.json()

console.log("WEBHOOK RECEIVED")
console.log(JSON.stringify(body, null, 2))
console.log("WHATSAPP BODY:", JSON.stringify(body))


  try {
    const message =
  body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

if (!message) {
  return Response.json({ ok: true })
}

const userText = (message as any).text?.body
const from = (message as any).from

console.log("MESSAGE EXTRACTED:", message)
console.log("INCOMING MESSAGE TYPE:", message?.type)

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
  ai.choices?.[0]?.message?.content || "Sorry, I couldn't process that."

console.log("PHONE ID:", process.env.WHATSAPP_PHONE_NUMBER_ID)
console.log("TOKEN EXISTS:", !!process.env.WHATSAPP_ACCESS_TOKEN)
console.log("REPLYING TO:", from)
console.log("AI REPLY:", reply)


   const res = await fetch(
  `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: from,
      text: { body: reply },
    }),
  }
)

const data = await res.json()

console.log("WHATSAPP API RESPONSE:", data)

    return Response.json({
      success: true,
    })
  } catch (err) {
    console.error("POST ERROR:", err)
    return Response.json({
      error:
        "Something went wrong",
    })
  }
}