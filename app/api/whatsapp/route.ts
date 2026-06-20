import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim()

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }

  return new Response("Verification failed", { status: 403 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const value = body.entry?.[0]?.changes?.[0]?.value
    const message = value?.messages?.[0]

    if (!message) {
      return Response.json({ ok: true })
    }

    const userText = message?.text?.body || ""
    const from = message?.from

    console.log("FROM:", from)
    console.log("TEXT:", userText)

    // =============================
    // 1. CREATE USER (SAFE UPSERT)
    // =============================
    const { error: userError } = await supabase
      .from("users")
      .upsert(
        {
          phone_number: from,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "phone_number" }
      )

    if (userError) {
      console.log("USER UPSERT ERROR:", userError)
    }

    // =============================
    // 2. SAVE NAME (BETTER PARSER)
    // =============================
    const lower = userText.toLowerCase()

    if (lower.startsWith("my name is")) {
      const name = userText
        .replace(/my name is/i, "")
        .trim()

      if (name) {
        const { error: nameError } = await supabase
          .from("users")
          .update({
            name,
            last_seen: new Date().toISOString(),
          })
          .eq("phone_number", from)

        console.log("SAVED NAME:", name)
        console.log("NAME ERROR:", nameError)
      }
    }

    // =============================
    // 3. LOAD USER PROFILE
    // =============================
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", from)
      .maybeSingle()

    console.log("PROFILE:", userProfile)
    console.log("PROFILE ERROR:", profileError)

    // =============================
    // 4. SAVE USER MESSAGE
    // =============================
    await supabase.from("conversations").insert({
      phone_number: from,
      role: "user",
      message: userText,
    })

    // =============================
    // 5. LOAD HISTORY
    // =============================
    const { data: history } = await supabase
      .from("conversations")
      .select("role, message")
      .eq("phone_number", from)
      .order("created_at", { ascending: false })
      .limit(6)

    // =============================
    // 6. OPENAI
    // =============================
    const messages = [
      {
        role: "system",
        content: `
You are GalliAssist.

User:
Name: ${userProfile?.name || "Unknown"}

Be helpful and short.
        `,
      },

      ...(history || [])
        .reverse()
        .map((m: any) => ({
          role: m.role,
          content: m.message,
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

    // =============================
    // 7. SAVE AI RESPONSE
    // =============================
    await supabase.from("conversations").insert({
      phone_number: from,
      role: "assistant",
      message: reply,
    })

    // =============================
    // 8. SEND WHATSAPP REPLY
    // =============================
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
    console.log("WHATSAPP RESPONSE:", data)

    return Response.json({ success: true })
  } catch (err) {
    console.error("POST ERROR:", err)
    return Response.json({ error: "Something went wrong" })
  }
}