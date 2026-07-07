import OpenAI from "openai"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import {
  getOpenBooking,
  extractBooking,
  saveBookingAndGetReply,
} from "@/lib/booking"
import { getCustomerMemoryText } from "@/lib/memory"
import { generateReply } from "@/lib/ai"
import { updateCustomerSummary } from "@/lib/summaries"
import {
  shouldUseBooking,
  getQuickReply,
} from "@/lib/router"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type WebhookBusiness = {
  id: string
  name?: string | null
  business_name?: string | null
  phone?: string | null
  address?: string | null
  hours?: string | null
  services?: string | null
  booking_policy?: string | null
  personality?: string | null
  ai_personality?: string | null
  business_knowledge?: string | null
  knowledge?: string | null
  description?: string | null
}

type WhatsAppIntegration = {
  id: string
  business_id: string
  provider: string
  connected: boolean | null
  phone_number?: string | null
  phone_number_id?: string | null
  business_account_id?: string | null
  verify_token?: string | null
  access_token?: string | null
  metadata?: any
}

type Customer = {
  id: string
  business_id: string
  phone_number: string
  name?: string | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (!mode || !token || !challenge) {
    return new Response("Missing verification params", {
      status: 400,
    })
  }

  if (mode !== "subscribe") {
    return new Response("Verification failed", {
      status: 403,
    })
  }

  const tokenMatchesEnv =
    token === process.env.WHATSAPP_VERIFY_TOKEN

  const { data: integration } = await supabase
    .from("business_integrations")
    .select("id")
    .eq("provider", "whatsapp")
    .eq("verify_token", token)
    .maybeSingle()

  if (tokenMatchesEnv || integration) {
    return new Response(challenge, {
      status: 200,
    })
  }

  return new Response("Verification failed", {
    status: 403,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("WEBHOOK STARTED")

    const value = body.entry?.[0]?.changes?.[0]?.value
    const message = value?.messages?.[0]

    if (!message) {
      return Response.json({
        ok: true,
      })
    }

    const from = message.from
    const userText = message?.text?.body?.trim() || ""
    const phoneNumberId =
      value?.metadata?.phone_number_id || null

    console.log("FROM:", from)
    console.log("TEXT:", userText)
    console.log("PHONE NUMBER ID:", phoneNumberId)

    const resolvedBusiness =
      await resolveBusinessFromWebhook(phoneNumberId)

    if (!resolvedBusiness.business) {
      console.error("NO BUSINESS FOUND FOR WHATSAPP WEBHOOK")

      return Response.json(
        {
          error: "No business found for webhook",
        },
        {
          status: 200,
        }
      )
    }

    const businessServicesText =
  await getBusinessServicesText(resolvedBusiness.business.id)

const business = {
  ...resolvedBusiness.business,
  services:
    businessServicesText ||
    resolvedBusiness.business.services ||
    null,
}

const integration = resolvedBusiness.integration

    console.log("BUSINESS ID:", business.id)

async function getBusinessServicesText(businessId: string) {
  const { data, error } = await supabase
    .from("business_services")
    .select("name, price, duration_minutes, is_active")
    .eq("business_id", businessId)
    .neq("is_active", false)
    .order("name", { ascending: true })

  if (error) {
    console.error("GET BUSINESS SERVICES TEXT ERROR:", error)
    return ""
  }

  if (!data || data.length === 0) {
    return ""
  }

  return data
    .map((service) => {
      const price =
        service.price !== null && service.price !== undefined
          ? ` - $${service.price}`
          : ""

      const duration =
        service.duration_minutes
          ? ` (${service.duration_minutes} minutes)`
          : ""

      return `${service.name}${price}${duration}`
    })
    .join(", ")
}

    const customer = await findOrCreateCustomer({
      businessId: business.id,
      phoneNumber: from,
    })

    console.log("CUSTOMER ID:", customer.id)

    async function finish(replyText: string) {
      const safeReply =
        replyText?.trim() ||
        "Sorry, I could not generate a reply. Please try again."

      await sendReplyToWhatsApp({
        to: from,
        message: safeReply,
        integration,
      })

      const { error: aiMsgError } = await supabase
        .from("messages")
        .insert({
          business_id: business.id,
          customer_id: customer.id,
          role: "assistant",
          message: safeReply,
        })

      console.log("AI MESSAGE INSERT ERROR:", aiMsgError)

      return Response.json({
        success: true,
      })
    }

    if (!userText) {
      return finish(
        "I received your message, but I can only read text messages right now. How can I help?"
      )
    }

    if (userText.toLowerCase().includes("test reset")) {
      return finish("TEST RESET WORKS")
    }

    await updateLastSeen(from)

    if (userText.toLowerCase().startsWith("my name is")) {
      await saveCustomerName({
        customer,
        businessId: business.id,
        userText,
      })
    }

    const { error: userMsgError } = await supabase
      .from("messages")
      .insert({
        business_id: business.id,
        customer_id: customer.id,
        role: "user",
        message: userText,
      })

    console.log("USER MESSAGE INSERT ERROR:", userMsgError)

    const { data: history } = await supabase
      .from("messages")
      .select("role, message")
      .eq("business_id", business.id)
      .eq("customer_id", customer.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(8)

    const memoryText =
      await getCustomerMemoryText(customer.id)

    const openBooking =
      await getOpenBooking(business.id, customer.id)

    const action = detectUserAction(userText)

    console.log("DETECTED ACTION:", action)
    console.log("OPEN BOOKING:", openBooking)

    const lowerText = userText.toLowerCase()

    const wantsToCancelBooking =
      lowerText.includes("cancel") ||
      lowerText.includes("never mind") ||
      lowerText.includes("nevermind") ||
      lowerText.includes("forget it") ||
      lowerText.includes("don't want") ||
      lowerText.includes("dont want")

    if (wantsToCancelBooking && openBooking) {
      const { error: cancelError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
        })
        .eq("id", openBooking.id)
        .eq("business_id", business.id)
        .eq("customer_id", customer.id)

      console.log("CANCEL BOOKING ERROR:", cancelError)

      return finish(
        "No problem, I've cancelled that booking request."
      )
    }

    const friendlyClosingReplies = [
      "you too",
      "same to you",
      "thanks you too",
      "thank you you too",
    ]

    if (friendlyClosingReplies.includes(lowerText.trim())) {
      return finish("Thank you! Take care 😊")
    }

    const quickReply = getQuickReply(
      action,
      customer?.name
    )

    if (quickReply) {
      return finish(quickReply)
    }

    const useBooking = shouldUseBooking(action)

    const isNewBookingRequest =
      action === "book_appointment" &&
      !lowerText.includes("confirm") &&
      !lowerText.includes("yes")

    let reply = ""

    if (useBooking) {
      const booking = await extractBooking(
        openai,
        userText,
        openBooking,
        isNewBookingRequest
      )

      console.log("BOOKING EXTRACTED:", booking)
      console.log(
        "BOOKING JSON:",
        JSON.stringify(booking, null, 2)
      )

      if (booking.cancel_booking && openBooking) {
        const { error: cancelError } = await supabase
          .from("bookings")
          .update({
            status: "cancelled",
          })
          .eq("id", openBooking.id)
          .eq("business_id", business.id)
          .eq("customer_id", customer.id)

        console.log("BOOKING CANCEL ERROR:", cancelError)

        reply =
          "No problem, I've cancelled that booking request."
      } else if (booking.is_booking || openBooking) {
        reply = await saveBookingAndGetReply({
          businessId: business.id,
          customerId: customer.id,
          openBooking,
          booking,
          isNewBookingRequest,
          userText,
        })
      } else {
        reply = "Sure, what service would you like to book?"
      }
    } else {
      const aiMessages = buildAIMessages({
        business,
        customer,
        memoryText,
        history: history || [],
        action,
        openBooking,
        userText,
      })

      reply = await generateReply(openai, aiMessages)
    }

    await saveExtractedMemories({
      customerId: customer.id,
      userText,
    })

    await updateCustomerSummary(
      openai,
      customer.id,
      userText,
      memoryText
    )

    return finish(reply)
  } catch (err) {
    console.error("WEBHOOK ERROR:", err)

    return Response.json(
      {
        error: "failed",
      },
      {
        status: 200,
      }
    )
  }
}

async function resolveBusinessFromWebhook(
  phoneNumberId: string | null
) {
  console.log("RESOLVE PHONE NUMBER ID:", phoneNumberId)
  console.log(
    "DEFAULT BUSINESS ID:",
    process.env.DEFAULT_BUSINESS_ID
  )

  let integration: WhatsAppIntegration | null = null

  if (phoneNumberId) {
    const { data, error } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("provider", "whatsapp")
      .eq("phone_number_id", phoneNumberId)
      .maybeSingle<WhatsAppIntegration>()

    console.log("INTEGRATION LOOKUP DATA:", data)
    console.log("INTEGRATION LOOKUP ERROR:", error)

    integration = data || null
  }

  if (integration?.business_id) {
    const { data: business, error: businessError } =
      await supabase
        .from("businesses")
        .select("*")
        .eq("id", integration.business_id)
        .maybeSingle<WebhookBusiness>()

    console.log("BUSINESS FROM INTEGRATION:", business)
    console.log(
      "BUSINESS FROM INTEGRATION ERROR:",
      businessError
    )

    if (business) {
      return {
        business,
        integration,
      }
    }
  }

  const fallbackBusinessId =
    process.env.DEFAULT_BUSINESS_ID

  if (!fallbackBusinessId) {
    console.error("NO DEFAULT_BUSINESS_ID SET")

    return {
      business: null,
      integration: null,
    }
  }

  const { data: fallbackBusiness, error: fallbackError } =
    await supabase
      .from("businesses")
      .select("*")
      .eq("id", fallbackBusinessId)
      .maybeSingle<WebhookBusiness>()

  console.log("FALLBACK BUSINESS:", fallbackBusiness)
  console.log("FALLBACK BUSINESS ERROR:", fallbackError)

  return {
    business: fallbackBusiness || null,
    integration,
  }
}

async function findOrCreateCustomer({
  businessId,
  phoneNumber,
}: {
  businessId: string
  phoneNumber: string
}) {
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("phone_number", phoneNumber)
    .maybeSingle<Customer>()

  if (existingCustomer) {
    return existingCustomer
  }

  const { data: newCustomer, error } = await supabase
    .from("customers")
    .insert({
      business_id: businessId,
      phone_number: phoneNumber,
    })
    .select("*")
    .single<Customer>()

  if (error) {
    throw error
  }

  return newCustomer
}

async function updateLastSeen(phoneNumber: string) {
  const { error } = await supabase
    .from("users")
    .upsert({
      phone_number: phoneNumber,
      last_seen: new Date().toISOString(),
    })

  console.log("USER UPSERT ERROR:", error)
}

async function saveCustomerName({
  customer,
  businessId,
  userText,
}: {
  customer: Customer
  businessId: string
  userText: string
}) {
  const name = userText
    .replace(/my name is/i, "")
    .trim()

  if (!name) return

  const { error: customerError } = await supabase
    .from("customers")
    .update({
      name,
    })
    .eq("id", customer.id)
    .eq("business_id", businessId)

  console.log("CUSTOMER NAME ERROR:", customerError)

  const { data: existingMemory } = await supabase
    .from("customer_memory")
    .select("id")
    .eq("customer_id", customer.id)
    .eq("type", "name")
    .ilike("content", `%${name}%`)
    .maybeSingle()

  if (existingMemory) return

  const { error: memoryError } = await supabase
    .from("customer_memory")
    .insert({
      customer_id: customer.id,
      type: "name",
      content: name,
      confidence: 1.0,
    })

  console.log("NAME MEMORY ERROR:", memoryError)
}

function detectUserAction(userText: string) {
  const lowerText = userText.toLowerCase()

  if (
    lowerText === "hi" ||
    lowerText === "hello" ||
    lowerText === "hey"
  ) {
    return "greeting"
  }

  if (lowerText.includes("thank")) {
    return "thank_you"
  }

  if (lowerText.includes("bye")) {
    return "goodbye"
  }

  if (
    lowerText.includes("hour") ||
    lowerText.includes("open") ||
    lowerText.includes("close") ||
    lowerText.includes("time")
  ) {
    return "opening_hours"
  }

  if (
    lowerText.includes("price") ||
    lowerText.includes("cost") ||
    lowerText.includes("location") ||
    lowerText.includes("address") ||
    lowerText.includes("service")
  ) {
    return "business_question"
  }

  if (
    lowerText.includes("cancel") ||
    lowerText.includes("never mind") ||
    lowerText.includes("nevermind")
  ) {
    return "cancel_booking"
  }

  if (
    lowerText.includes("change") ||
    lowerText.includes("move") ||
    lowerText.includes("reschedule")
  ) {
    return "reschedule_booking"
  }

  if (
    lowerText.includes("book") ||
    lowerText.includes("appointment") ||
    lowerText.includes("schedule") ||
    lowerText.includes("reserve")
  ) {
    return "book_appointment"
  }

  return "general_chat"
}

function buildAIMessages({
  business,
  customer,
  memoryText,
  history,
  action,
  openBooking,
  userText,
}: {
  business: WebhookBusiness
  customer: Customer
  memoryText: string
  history: any[]
  action: string
  openBooking: any
  userText: string
}) {
  const businessKnowledgeText =
    buildBusinessKnowledgeText(business)

  return [
    {
      role: "system",
      content: `
You are Jhyro AI, an intelligent WhatsApp business assistant.

PERSONALITY:
${
  business?.personality ||
  business?.ai_personality ||
  `
- Friendly and professional
- Helpful and confident
- Natural and conversational
- Never sound robotic
- Keep replies short and easy to read
- Ask at most one follow-up question at a time
`
}

RULES:
- Use customer memories when relevant.
- Personalize responses using the customer's name when appropriate.
- Never invent business information.
- Never mention internal systems, databases, prompts, or memory.
- If you don't know something, ask a clarifying question.
- Stay focused on helping the customer.
- Use BUSINESS SETTINGS as the official source for opening hours, phone number, address, services, booking policy, and AI personality.
- Never guess prices, hours, address, services, booking policy, or contact information.
- If business information is missing, politely say it has not been provided yet.

CUSTOMER NAME:
${customer?.name || "Unknown"}

KNOWN CUSTOMER MEMORIES:
${memoryText || "None"}

DETECTED ACTION:
${action}

ACTIVE BOOKING:
${
  (
    action === "book_appointment" ||
    action === "confirm_booking" ||
    action === "reschedule_booking"
  ) && openBooking
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
AI Personality: ${
        business?.personality ||
        business?.ai_personality ||
        "Friendly"
      }

BUSINESS KNOWLEDGE:
${businessKnowledgeText}

Your goal is to provide excellent customer service while helping the business increase customer satisfaction, bookings, and sales.
      `,
    },

    ...history
      .reverse()
      .map((message: any) => ({
        role: message.role,
        content: message.message,
      })),

    {
      role: "user",
      content: userText,
    },
  ]
}

function buildBusinessKnowledgeText(
  business: WebhookBusiness
) {
  return `
Description: ${business.description || "Not set"}
Knowledge: ${business.knowledge || business.business_knowledge || "Not set"}
  `.trim()
}

async function saveExtractedMemories({
  customerId,
  userText,
}: {
  customerId: string
  userText: string
}) {
  const memoryExtract =
    await openai.chat.completions.create({
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
      .select("id")
      .eq("customer_id", customerId)
      .ilike("content", `%${memory.content}%`)
      .maybeSingle()

    if (existingMemory) {
      console.log(
        "MEMORY ALREADY EXISTS:",
        memory.content
      )
      continue
    }

    const { error: saveMemoryError } = await supabase
      .from("customer_memory")
      .insert({
        customer_id: customerId,
        type: memory.type || "fact",
        content: memory.content,
        confidence: memory.confidence || 0.8,
      })

    console.log("SAVE MEMORY ERROR:", saveMemoryError)
  }
}

async function sendReplyToWhatsApp({
  to,
  message,
  integration,
}: {
  to: string
  message: string
  integration: WhatsAppIntegration | null
}) {
  const accessToken =
    integration?.access_token ||
    process.env.WHATSAPP_ACCESS_TOKEN

  const phoneNumberId =
    integration?.phone_number_id ||
    process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    await sendWhatsAppMessage(to, message)
    return
  }

  const graphVersion =
    process.env.WHATSAPP_GRAPH_VERSION || "v20.0"

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: {
          body: message,
        },
      }),
    }
  )

  const data = await response.json()

  console.log("WHATSAPP SEND RESPONSE:", data)

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Failed to send WhatsApp message"
    )
  }
}