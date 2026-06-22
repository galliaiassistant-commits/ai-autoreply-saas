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

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200 })
  }

  return new Response("Verification failed", { status: 403 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("WEBHOOK STARTED")

    const value = body.entry?.[0]?.changes?.[0]?.value
    const message = value?.messages?.[0]

    if (!message) {
      return Response.json({ ok: true })
    }

   const from = message.from
const userText = message?.text?.body || ""

console.log("FROM:", from)
console.log("TEXT:", userText)

// FIND BUSINESS
const { data: business, error: businessError } = await supabase
  .from("businesses")
  .select("*")
  .limit(1)
  .limit(1)
.maybeSingle()

console.log("BUSINESS:", business)
console.log("BUSINESS ERROR:", businessError)

if (businessError || !business) {
  throw new Error("No business found")
}

// FIND CUSTOMER
let { data: customer } = await supabase
  .from("customers")
  .select("*")
  .eq("business_id", business.id)
  .eq("phone_number", from)
  .maybeSingle()

// CREATE CUSTOMER IF NOT FOUND
if (!customer) {


  const { data: newCustomer, error } = await supabase
    .from("customers")
    .insert({
      business_id: business.id,
      phone_number: from,
    })
    .select()
    .single()

  if (error) throw error

  customer = newCustomer
}

console.log("CUSTOMER:", customer)

    
    // =========================
    // 1. UPSERT USER (ALWAYS CREATE)
    // =========================
    const { error: userError } = await supabase
      .from("users")
      .upsert({
        phone_number: from,
        last_seen: new Date().toISOString(),
      })

    console.log("USER ERROR:", userError)

    // =========================
    // 2. SAVE NAME (FIXED)
    // =========================
    if (userText.toLowerCase().startsWith("my name is")) {
  const name = userText.replace(/my name is/i, "").trim()

  // Update customer name
  const { error: customerError } = await supabase
    .from("customers")
    .update({
      name,
    })
    .eq("id", customer.id)

  console.log("CUSTOMER NAME ERROR:", customerError)

  // Save long-term memory
  const { error: memoryError } = await supabase
    .from("customer_memory")
    .insert({
      customer_id: customer.id,
      type: "name",
      content: name,
      confidence: 1.0,
    })

  console.log("MEMORY ERROR:", memoryError)

  console.log("SAVED NAME:", name)
}

    // =========================
    // 3. LOAD USER PROFILE
    // =========================
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", from)
      .maybeSingle()

    console.log("PROFILE:", userProfile)

    // =========================
    // 4. SAVE USER MESSAGE
    // =========================
    await supabase.from("conversations").insert({
      phone_number: from,
      role: "user",
      message: userText,
    })

const { error: msgError } = await supabase
  .from("messages")
  .insert({
    business_id: business.id,
    customer_id: customer.id,
    role: "user",
    message: userText,
  })

console.log("MESSAGE INSERT ERROR:", msgError)

    // =========================
    // 5. LOAD HISTORY
    // =========================
    const { data: history } = await supabase
      .from("conversations")
      .select("role, message")
      .eq("phone_number", from)
      .order("created_at", { ascending: false })
      .limit(6)

    // =========================
    // 6. OPENAI MEMORY PROMPT
    // =========================
    const messages = [
      {
        role: "system",
        content: `
You are Jhyro AI.

User name: ${userProfile?.name || "Unknown"}

Be helpful, short, and natural.
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

    // =========================
    // 7. SAVE AI RESPONSE
    // =========================
    const { error: aiMsgError } = await supabase
  .from("messages")
  .insert({
    business_id: business.id,
    customer_id: customer.id,
    role: "assistant",
    message: reply,
  })

console.log("AI MESSAGE INSERT ERROR:", aiMsgError)

    // =========================
    // 8. SEND WHATSAPP MESSAGE
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

    const data = await res.json()
    console.log("WHATSAPP RESPONSE:", data)

    return Response.json({ success: true })
  } catch (err) {
    console.error("WEBHOOK ERROR:", err)
    return Response.json({ error: "failed" })
  }
}