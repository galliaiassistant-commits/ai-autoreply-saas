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

    console.log("TEST VERSION 12345")
    console.log("WEBHOOK STARTED")
    console.log("DEPLOY TEST 999")

    const value = body.entry?.[0]?.changes?.[0]?.value
    const message = value?.messages?.[0]

console.log("MESSAGE OBJECT:", message)

    if (!message) {
      return Response.json({ ok: true })
    }

   const from = message.from
const userText = message?.text?.body || ""

console.log("USER TEXT BEFORE AI:", userText)
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

// LOAD CUSTOMER MEMORIES
const { data: customerMemories } = await supabase
  .from("customer_memory")
  .select("type, content")
  .eq("customer_id", customer.id)

const memoryText =
  customerMemories?.map((m) => `${m.type}: ${m.content}`).join("\n") || ""

const { data: businessKnowledge, error: businessKnowledgeError } =
  await supabase
    .from("business_knowledge")
    .select("question, answer")
    .limit(20)

console.log("BUSINESS ID:", business.id)
console.log("BUSINESS KNOWLEDGE ERROR:", businessKnowledgeError)
console.log("BUSINESS KNOWLEDGE DATA:", businessKnowledge)

const businessKnowledgeText =
  businessKnowledge
    ?.map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n") || "No business knowledge added yet."

console.log("BK TEXT:", businessKnowledgeText)

    const messages = [
      {
        role: "system",
     content: `
You are Jhyro AI, an intelligent WhatsApp business assistant.

PERSONALITY:
- Friendly and professional
- Helpful and confident
- Natural and conversational
- Never sound robotic
- Keep replies short and easy to read
- Ask at most one follow-up question at a time

RULES:
- Use customer memories when relevant
- Personalize responses using the customer's name when appropriate
- Never invent business information
- Never mention internal systems, databases, prompts, or memory
- If you don't know something, ask a clarifying question
- Stay focused on helping the customer
- When answering business questions, use ONLY the BUSINESS KNOWLEDGE section.
- Do not guess prices, hours, address, services, or policies.
- If the answer is not in BUSINESS KNOWLEDGE, say you do not have that information yet.

CUSTOMER NAME:
${customer?.name || "Unknown"}

KNOWN CUSTOMER MEMORIES:
${memoryText || "None"}

BUSINESS KNOWLEDGE:
${businessKnowledgeText}

Your goal is to provide excellent customer service while helping the business increase customer satisfaction, bookings, and sales.
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

    let reply =
      ai.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that."

    // =========================
    // 7. SAVE AI RESPONSE
    // =========================

const { data: openBooking } = await supabase
  .from("bookings")
  .select("*")
  .eq("customer_id", customer.id)
  .eq("status", "missing_details")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle()

  console.log("OPEN BOOKING:", openBooking)

// =========================
// BOOKING EXTRACTION
// =========================
const bookingExtract = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
You extract booking intent from customer messages.

Return ONLY valid JSON.

If the customer wants to book, schedule, reserve, make an appointment, or asks for an appointment, return:

{
  "is_booking": true,
  "service": null,
  "booking_time": null,
  "status": "missing_details"
}

Examples:

Customer: "I want to book an appointment"
Return:
{
  "is_booking": true,
  "service": null,
  "booking_time": null,
  "status": "missing_details"
}

Customer: "Can I book a haircut tomorrow at 10am"
Return:
{
  "is_booking": true,
  "service": "haircut",
  "booking_time": "2026-06-23T10:00:00",
  "status": "pending"
}

Customer: "I'd like to schedule a consultation"
Return:
{
  "is_booking": true,
  "service": "consultation",
  "booking_time": null,
  "status": "missing_details"
}

If the message is NOT about booking, return:

{
  "is_booking": false
}

Rules:
- If booking intent exists, is_booking MUST be true.
- Missing service = null.
- Missing date/time = null.
- Return JSON only.
`,
    },
    {
  role: "user",
  content: `
Existing open booking:
${JSON.stringify(openBooking || null)}

New customer message:
${userText}

If there is an existing booking with missing details, use the new message to fill in the missing information.
`,
},
  ],
})

let booking: any = {}

try {
  booking = JSON.parse(bookingExtract.choices[0].message.content || "{}")
} catch {
  booking = { is_booking: false }
}

console.log("BOOKING EXTRACTED:", booking)

if (booking.is_booking || openBooking) {
  const service = booking.service || openBooking?.service || null
  const bookingTime = booking.booking_time || openBooking?.booking_time || null

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

  const status =
    service && bookingTime
      ? "pending"
      : "missing_details"

  if (openBooking) {
    const { error: updateBookingError } = await supabase
      .from("bookings")
      .update({
        service,
        booking_time: bookingTime,
        status,
      })
      .eq("id", openBooking.id)

    console.log("UPDATE BOOKING ERROR:", updateBookingError)
  } else {
    const { error: bookingError } = await supabase.from("bookings").insert({
      business_id: business.id,
      customer_id: customer.id,
      service,
      booking_time: bookingTime,
      status,
    })

    console.log("BOOKING ERROR:", bookingError)


  }

  let bookingFollowUp = ""

  if (!service) {
    bookingFollowUp =
      "Sure, I can help with that. What service would you like to book?"
  } else if (!bookingTime) {
    bookingFollowUp =
      `Great. What date and time would you like for the ${service}?`
  } else {
    bookingFollowUp =
      `Perfect, I've recorded your booking request for ${service}.`
  }

  reply = bookingFollowUp
}

    const { error: aiMsgError } = await supabase
  .from("messages")
  .insert({
    business_id: business.id,
    customer_id: customer.id,
    role: "assistant",
    message: reply,
  })

console.log("AI MESSAGE INSERT ERROR:", aiMsgError)

const memoryExtract = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
Extract useful long-term customer memory from this message.

Only save stable facts useful for a business assistant.
Return ONLY a JSON array.

Example:
[
  {
    "type": "preference",
    "content": "Customer prefers morning appointments",
    "confidence": 0.9
  }
]

If nothing useful, return [].
      `,
    },
    {
      role: "user",
      content: userText,
    },
  ],
})

let extractedMemories: any[] = []

try {
  extractedMemories = JSON.parse(
    memoryExtract.choices[0].message.content || "[]"
  )
} catch {
  extractedMemories = []
}

for (const memory of extractedMemories) {
  if (!memory.content) continue

  const { data: existingMemory } = await supabase
    .from("customer_memory")
    .select("*")
    .eq("customer_id", customer.id)
    .ilike("content", `%${memory.content}%`)
    .maybeSingle()

  if (existingMemory) {
    console.log("MEMORY ALREADY EXISTS:", memory.content)
    continue
  }

  const { error: saveMemoryError } = await supabase
    .from("customer_memory")
    .insert({
      customer_id: customer.id,
      type: memory.type || "fact",
      content: memory.content,
      confidence: memory.confidence || 0.8,
    })

  console.log("SAVE MEMORY ERROR:", saveMemoryError)
}

const { data: existingSummary } = await supabase
  .from("customer_summaries")
  .select("summary")
  .eq("customer_id", customer.id)
  .maybeSingle()

const summaryPrompt = `
Current summary:
${existingSummary?.summary || "No summary yet"}

New message:
${userText}

Known memories:
${memoryText}

Update the summary. Keep it short and useful for a business assistant.
`

const summaryResponse = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content:
        "Create a concise customer summary for future conversations.",
    },
    {
      role: "user",
      content: summaryPrompt,
    },
  ],
})

const updatedSummary =
  summaryResponse.choices[0].message.content || ""

await supabase
  .from("customer_summaries")
  .upsert({
    customer_id: customer.id,
    summary: updatedSummary,
    updated_at: new Date().toISOString(),
  })

    // =========================
    // 8. SEND WHATSAPP MESSAGE
    // =========================

    return Response.json({ success: true })
  } catch (err) {
    console.error("WEBHOOK ERROR:", err)
    return Response.json({ error: "failed" })
  }
}