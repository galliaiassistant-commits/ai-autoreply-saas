import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

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
  console.log("TOKEN FROM VERCEL:", process.env.WHATSAPP_VERIFY_TOKEN)

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim()

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WEBHOOK VERIFIED SUCCESSFULLY")
    return new Response(challenge, { status: 200 })
  }

  console.log("WEBHOOK VERIFICATION FAILED")

  return new Response("Verification failed", { status: 403 })
}

export async function POST(req: Request) {
  console.log("🔥 POST HIT")
  console.log("CONTENT-TYPE:", req.headers.get("content-type"))

  let body

  try {
    body = await req.json()
  } catch (err) {
    console.log("FAILED TO PARSE JSON:", err)
    return new Response("Invalid JSON", { status: 400 })
  }

  console.log("WEBHOOK RECEIVED")
  console.log(JSON.stringify(body, null, 2))

  try {
    const value = body.entry?.[0]?.changes?.[0]?.value
    const message = value?.messages?.[0]

    if (!message) {
      console.log("NO MESSAGE FOUND")
      return Response.json({ ok: true })
    }

    const userText =
      (message as any)?.text?.body || "Hello"
    const from = (message as any).from

    console.log("FROM:", from)
    console.log("USER TEXT:", userText)

    // =========================
    // 💾 SAVE USER MESSAGE
    // =========================
    await supabase.from("conversations").insert({
      phone_number: from,
      role: "user",
      message: userText,
    })

    // =========================
    // 🧠 LOAD MEMORY
    // =========================
    const { data: history } = await supabase
      .from("conversations")
      .select("role, message")
      .eq("phone_number", from)
      .order("created_at", { ascending: false })
      .limit(10)

    // =========================
    // 🤖 OPENAI WITH MEMORY
    // =========================
    const messages = [
      {
        role: "system",
        content: `
You are GalliAssist, a friendly and professional AI assistant.
Keep replies concise and helpful.
Remember past conversation context.
        `,
      },

      ...(history || [])
        .reverse()
        .map((msg: any) => ({
          role: msg.role,
          content: msg.message,
        })),

      {
        role: "user",
        content: userText,
      },
    ]

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    })

    const reply =
      ai.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that."

    console.log("REPLY:", reply)

    // =========================
    // 💾 SAVE AI RESPONSE
    // =========================
    await supabase.from("conversations").insert({
      phone_number: from,
      role: "assistant",
      message: reply,
    })

    // =========================
    // 📩 SEND WHATSAPP MESSAGE
    // =========================
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

    console.log("WHATSAPP STATUS:", res.status)

    const data = await res.json()
    console.log("WHATSAPP API RESPONSE:", data)

    return Response.json({ success: true })
  } catch (err) {
    console.error("POST ERROR:", err)
    return Response.json({ error: "Something went wrong" })
  }
}