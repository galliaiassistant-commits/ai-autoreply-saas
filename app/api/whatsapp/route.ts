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

const { data: openBooking } = await supabase
  .from("bookings")
  .select("*")
  .eq("customer_id", customer.id)
  .in("status", ["missing_details", "pending"])
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle()

  console.log("OPEN BOOKING:", openBooking)

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
- Use customer memories when relevant.
- Personalize responses using the customer's name when appropriate.
- Never invent business information.
- Never mention internal systems, databases, prompts, or memory.
- If you don't know something, ask a clarifying question.
- Stay focused on helping the customer.
- When answering business questions, ALWAYS check BUSINESS SETTINGS first.
- If the information is not in BUSINESS SETTINGS, then use BUSINESS KNOWLEDGE.
- Never guess prices, hours, address, services, booking policy, or contact information.
- If the information is not available in either BUSINESS SETTINGS or BUSINESS KNOWLEDGE, politely explain that the information has not been provided yet.
- Use the BUSINESS SETTINGS section as the official source for opening hours, phone number, address, services, booking policy, and AI personality.

CUSTOMER NAME:
${customer?.name || "Unknown"}

KNOWN CUSTOMER MEMORIES:
${memoryText || "None"}

ACTIVE BOOKING:
${
  openBooking
    ? `
Status: ${openBooking.status}
Service: ${openBooking.service || "Unknown"}
Date/Time: ${openBooking.booking_time || "Not provided"}

The customer is currently in the middle of a booking.
Continue the existing booking conversation.
Do NOT greet the customer again.
Do NOT ask "How can I help you today?"
Only ask for the missing booking details or confirm the booking if all information is available.
`
    : "No active booking."
}

BUSINESS SETTINGS:
Business Name: ${business?.business_name || business?.name || "Unknown"}
Phone: ${business?.phone || "Not set"}
Address: ${business?.address || "Not set"}
Opening Hours: ${business?.hours || "Not set"}
Services: ${business?.services || "Not set"}
Booking Policy: ${business?.booking_policy || "Not set"}
AI Personality: ${business?.personality || "Friendly"}

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

// =========================
// BOOKING EXTRACTION
// =========================
const bookingExtract = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
You extract booking intent and booking details from customer messages.

Return ONLY valid JSON.

If this is not about booking, return:
{
  "is_booking": false
}

Rules:
- Use the Existing open booking as context.
- Keep existing service unless customer changes it.
- booking_time must include BOTH date and time.
- Never return 00:00:00 unless customer said midnight.
- If date or time is missing, booking_time must be null.
- If service and full booking_time exist, status is "pending".
- Otherwise status is "missing_details".
- If customer says yes, yes please, correct, or confirm, treat it as confirmation of current booking.
- Do NOT assume the service from customer memory or past bookings. Only use a service if the customer says it in the current booking OR it already exists in the open booking.
- If the customer says they want to cancel the current booking, stop booking, never mind, forget it, or don't book anymore, return cancel_booking true.
- If cancel_booking is true, keep service and booking_time from the open booking if available.
Return shape:
{
  "is_booking": true,
  "cancel_booking": false,
  "service": null,
  "booking_time": null,
  "status": "missing_details"
}
`,
    },
    {
      role: "user",
      content: `
Existing open booking:
${JSON.stringify(openBooking || null)}

Current customer message:
${userText}

Today's date:
${new Date().toISOString()}

Merge the customer message with the existing booking.
Preserve existing booking information unless the customer changes it.
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

if (!booking.cancel_booking && (booking.is_booking || openBooking)) {
  const service =
    booking.service ?? openBooking?.service ?? null

  const bookingTime =
    booking.booking_time ?? openBooking?.booking_time ?? null

  const hasRealTime =
    bookingTime &&
    !String(bookingTime).includes("00:00:00")

  const status =
    service && bookingTime && hasRealTime
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
    const { error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: business.id,
        customer_id: customer.id,
        service,
        booking_time: bookingTime,
        status,
      })

    console.log("BOOKING ERROR:", bookingError)
  }

  if (!openBooking && !booking.service) {
  reply =
    "Sure! I'd be happy to help. What service would you like to book?"
} else if (!service) {
  reply =
    "What service would you like to book?"
} else if (!bookingTime || !hasRealTime) {
  reply =
    `Great! What date and time would you like for your ${service}?`
} else {
  reply =
    `Perfect! I've recorded your booking request for a ${service} on ${bookingTime}.`
}
}

// =========================
// SEND WHATSAPP MESSAGE
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