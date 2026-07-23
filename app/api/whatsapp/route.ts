import OpenAI from "openai"
import { after } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { businessCanUseFeature } from "@/lib/plans"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar"
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

async function getWhatsAppAccessTokenForBusiness(
  businessId: string
) {
  const { data, error } = await supabase
    .from("business_integration_secrets")
    .select("access_token")
    .eq("business_id", businessId)
    .eq("provider", "whatsapp")
    .maybeSingle()

  if (error) {
    console.error("GET WHATSAPP TOKEN ERROR:", error)
  }

  return (
    data?.access_token ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    null
  )
}

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
  timezone?: string | null
  subscription_plan?: string | null
  subscription_status?: string | null
  payment_due_at?: string | null
  billing_grace_ends_at?: string | null
  ai_suspended_at?: string | null
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

function getBillingLockState(business: WebhookBusiness) {
  const status =
    business.subscription_status?.toLowerCase() || null

  if (
    status === "cancelled" ||
    status === "expired" ||
    status === "suspended"
  ) {
    return {
      blocked: true,
      reason: status,
      graceEndsAt: business.billing_grace_ends_at || null,
    }
  }

  if (
    status !== "payment_due" &&
    status !== "past_due"
  ) {
    return {
      blocked: false,
      reason: null,
      graceEndsAt: business.billing_grace_ends_at || null,
    }
  }

  let graceEndsAt =
    business.billing_grace_ends_at || null

  if (!graceEndsAt && business.payment_due_at) {
    const fallbackGraceEnd = new Date(
      business.payment_due_at
    )

    if (!Number.isNaN(fallbackGraceEnd.getTime())) {
      fallbackGraceEnd.setUTCDate(
        fallbackGraceEnd.getUTCDate() + 7
      )

      graceEndsAt = fallbackGraceEnd.toISOString()
    }
  }

  if (!graceEndsAt) {
    return {
      blocked: false,
      reason: "payment_due_without_grace_date",
      graceEndsAt: null,
    }
  }

  const graceEndTime = new Date(graceEndsAt).getTime()

  if (Number.isNaN(graceEndTime)) {
    console.error(
      "INVALID BILLING GRACE END DATE:",
      graceEndsAt
    )

    return {
      blocked: false,
      reason: "invalid_grace_date",
      graceEndsAt,
    }
  }

  return {
    blocked: Date.now() >= graceEndTime,
    reason: "payment_due",
    graceEndsAt,
  }
}

async function markAISuspendedIfNeeded(
  business: WebhookBusiness
) {
  if (business.ai_suspended_at) return

  const suspendedAt = new Date().toISOString()

  const { error } = await supabase
    .from("businesses")
    .update({
      ai_suspended_at: suspendedAt,
    })
    .eq("id", business.id)
    .is("ai_suspended_at", null)

  if (error) {
    console.error(
      "MARK AI SUSPENDED ERROR:",
      error
    )

    return
  }

  business.ai_suspended_at = suspendedAt
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
  const webhookStartedAt = Date.now()

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

    const business = resolvedBusiness.business
    const integration = resolvedBusiness.integration
    const action = detectUserAction(userText)
    const canUseCustomerMemory =
      businessCanUseFeature(
        business,
        "customer_memory"
      )
    const canUseWhatsAppAI =
      businessCanUseFeature(
        business,
        "whatsapp_ai"
      )
    const canUseBookings =
      businessCanUseFeature(
        business,
        "appointment_bookings"
      )
    const canManageServices =
      businessCanUseFeature(
        business,
        "service_management"
      )
    const canUseBusinessKnowledge =
      businessCanUseFeature(
        business,
        "business_knowledge"
      )

    console.log("BUSINESS ID:", business.id)

    if (!canUseWhatsAppAI) {
      console.log(
        "WHATSAPP AI REPLY SKIPPED FOR PLAN:",
        business.id,
        business.subscription_plan || "not_set",
        business.subscription_status || "not_set"
      )

      return Response.json({
        ok: true,
        ignored: true,
        reason: "whatsapp_ai_not_available",
      })
    }

    if (!canUseBusinessKnowledge) {
      business.knowledge = null
      business.business_knowledge = null
    }

    if (!canManageServices) {
      business.services = null
    }

    const billingLock =
      getBillingLockState(business)

    console.log(
      "BILLING STATUS:",
      business.subscription_status || "not_set"
    )
    console.log(
      "BILLING GRACE ENDS AT:",
      billingLock.graceEndsAt
    )
    console.log(
      "AI BILLING BLOCKED:",
      billingLock.blocked
    )

    if (billingLock.blocked) {
      await markAISuspendedIfNeeded(business)

      console.log(
        "AI REPLY SKIPPED FOR UNPAID BUSINESS:",
        business.id,
        billingLock.reason
      )

      return Response.json({
        ok: true,
        ignored: true,
        reason: "billing_suspended",
      })
    }

    const [whatsappAccessToken, customer] =
      await Promise.all([
        getWhatsAppAccessTokenForBusiness(business.id),
        findOrCreateCustomer({
          businessId: business.id,
          phoneNumber: from,
        }),
      ])

    if (!whatsappAccessToken) {
      console.error(
        "NO WHATSAPP TOKEN AVAILABLE FOR BUSINESS:",
        business.id
      )

      return Response.json(
        {
          error: "No WhatsApp token available for business.",
        },
        {
          status: 200,
        }
      )
    }

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

    console.log("CUSTOMER ID:", customer.id)

    async function finish(replyText: string) {
      const safeReply =
        replyText?.trim() ||
        "Sorry, I could not generate a reply. Please try again."

      await sendReplyToWhatsApp({
        to: from,
        message: safeReply,
        integration,
        accessToken: whatsappAccessToken,
      })

      console.log(
        "WHATSAPP REPLY SENT IN:",
        `${Date.now() - webhookStartedAt}ms`
      )

      after(async () => {
        const { error: aiMsgError } = await supabase
          .from("messages")
          .insert({
            business_id: business.id,
            customer_id: customer.id,
            role: "assistant",
            message: safeReply,
          })

        if (aiMsgError) {
          console.error(
            "AI MESSAGE INSERT ERROR:",
            aiMsgError
          )
        }
      })

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

    const detectedName = detectCustomerName(userText)

if (detectedName) {
  await saveCustomerName({
    customer,
    businessId: business.id,
    name: detectedName,
    saveMemory:
      canUseCustomerMemory,
  })

  customer.name = detectedName
}

    after(async () => {
      const backgroundWrites = await Promise.allSettled([
        updateLastSeen(from),
        supabase
          .from("messages")
          .insert({
            business_id: business.id,
            customer_id: customer.id,
            role: "user",
            message: userText,
          }),
      ])

      backgroundWrites.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            index === 0
              ? "UPDATE LAST SEEN ERROR:"
              : "USER MESSAGE INSERT ERROR:",
            result.reason
          )
        }
      })
    })

    const lowerText = userText.toLowerCase()

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

    if (action === "opening_hours") {
      const hoursText = await getBusinessHoursText({
        businessId: business.id,
        fallbackHours: business.hours,
      })

      return finish(hoursText)
    }

    if (
      shouldUseBooking(action) &&
      !canUseBookings
    ) {
      return finish(
        "Online appointment booking is not currently available. Please contact the business directly for assistance."
      )
    }

    if (action === "business_question") {
      const instantBusinessReply =
        getInstantBusinessReply({
          userText,
          business,
        })

      if (instantBusinessReply) {
        return finish(instantBusinessReply)
      }

      if (asksAboutServicesOrPrices(userText)) {
        if (!canManageServices) {
          return finish(
            "Please contact the business directly for current service and pricing information."
          )
        }

        const servicesText =
          await getBusinessServicesText(business.id)

        if (servicesText) {
          return finish(
            `Our services are: ${servicesText}.`
          )
        }

        return finish(
          "Sorry, the business has not added its services and prices yet."
        )
      }
    }

    const businessServicesText =
      canManageServices
        ? await getBusinessServicesText(business.id)
        : ""

    business.services =
      businessServicesText ||
      business.services ||
      null

    const [historyResult, memoryText, openBooking] =
      await Promise.all([
        supabase
          .from("messages")
          .select("role, message")
          .eq("business_id", business.id)
          .eq("customer_id", customer.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(8),
        canUseCustomerMemory
          ? getCustomerMemoryText(customer.id)
          : Promise.resolve(""),
        canUseBookings
          ? getOpenBooking(
              business.id,
              customer.id,
              action === "reschedule_booking" ||
                action === "cancel_booking"
            )
          : Promise.resolve(null),
      ])

    const history = historyResult.data || []

    if (historyResult.error) {
      console.error(
        "MESSAGE HISTORY ERROR:",
        historyResult.error
      )
    }

    console.log("DETECTED ACTION:", action)
    console.log("OPEN BOOKING:", openBooking)

    const wantsToCancelBooking =
      lowerText.includes("cancel") ||
      lowerText.includes("never mind") ||
      lowerText.includes("nevermind") ||
      lowerText.includes("forget it") ||
      lowerText.includes("don't want") ||
      lowerText.includes("dont want")

    if (wantsToCancelBooking && openBooking) {
      const calendarDelete =
        await deleteGoogleCalendarEvent({
          businessId: business.id,
          bookingId: openBooking.id,
          customerId: customer.id,
        })

      console.log(
        "GOOGLE CALENDAR CANCEL RESULT:",
        calendarDelete
      )

      if (
        !calendarDelete.synced &&
        !calendarDelete.skipped
      ) {
        return finish(
          "I could not remove the appointment from Google Calendar, so the booking has not been cancelled. Please try again."
        )
      }

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

    const useBooking =
      canUseBookings &&
      (
        shouldUseBooking(action) ||
        Boolean(openBooking)
      )

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
        isNewBookingRequest,
        business.id
      )

      console.log("BOOKING EXTRACTED:", booking)
      console.log(
        "BOOKING JSON:",
        JSON.stringify(booking, null, 2)
      )

      if (booking.cancel_booking && openBooking) {
        const calendarDelete =
          await deleteGoogleCalendarEvent({
            businessId: business.id,
            bookingId: openBooking.id,
            customerId: customer.id,
          })

        console.log(
          "GOOGLE CALENDAR CANCEL RESULT:",
          calendarDelete
        )

        if (
          !calendarDelete.synced &&
          !calendarDelete.skipped
        ) {
          reply =
            "I could not remove the appointment from Google Calendar, so the booking has not been cancelled. Please try again."
        } else {
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
        }
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
        const aiMessages = buildAIMessages({
          business,
          customer,
          memoryText,
          history: history || [],
          action: "business_question",
          openBooking,
          userText,
        })

        reply = await generateReply(openai, aiMessages)
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

    after(async () => {
      if (!canUseCustomerMemory) {
        return
      }

      const backgroundResults = await Promise.allSettled([
        saveExtractedMemories({
          customerId: customer.id,
          userText,
          enabled:
            canUseCustomerMemory,
        }),
        updateCustomerSummary(
          openai,
          customer.id,
          userText,
          memoryText
        ),
      ])

      backgroundResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            index === 0
              ? "BACKGROUND MEMORY ERROR:"
              : "BACKGROUND SUMMARY ERROR:",
            result.reason
          )
        }
      })
    })

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

    console.log(
  "INTEGRATION LOOKUP:",
  data
    ? {
        id: data.id,
        business_id: data.business_id,
        provider: data.provider,
        connected: data.connected,
        phone_number_id: data.phone_number_id,
      }
    : null
)

if (error) {
  console.error(
    "INTEGRATION LOOKUP ERROR:",
    error
  )
}

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

function detectCustomerName(userText: string) {
  const cleanText = userText.trim()

  const patterns = [
    /^my name is\s+(.+)$/i,
    /^i am\s+(.+)$/i,
    /^i'm\s+(.+)$/i,
    /^im\s+(.+)$/i,
  ]

  for (const pattern of patterns) {
    const match = cleanText.match(pattern)

    if (match?.[1]) {
      return cleanName(match[1])
    }
  }

  return null
}

function cleanName(value: string) {
  return value
    .replace(/[?.!,]/g, "")
    .trim()
    .split(" ")
    .slice(0, 3)
    .map((part) =>
      part.charAt(0).toUpperCase() +
      part.slice(1).toLowerCase()
    )
    .join(" ")
}

async function saveCustomerName({
  customer,
  businessId,
  name,
  saveMemory,
}: {
  customer: Customer
  businessId: string
  name: string
  saveMemory: boolean
}) {
  if (!name) return

  const { error: customerError } = await supabase
    .from("customers")
    .update({
      name,
    })
    .eq("id", customer.id)
    .eq("business_id", businessId)

  console.log("CUSTOMER NAME ERROR:", customerError)

  if (!saveMemory) {
    return
  }

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
  const lowerText = userText.toLowerCase().trim()

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
    lowerText.includes("cancel") ||
    lowerText.includes("never mind") ||
    lowerText.includes("nevermind")
  ) {
    return "cancel_booking"
  }

  if (
    lowerText.includes("change") ||
    lowerText.includes("move") ||
    lowerText.includes("reschedule") ||
    lowerText.includes("reshedule") ||
    lowerText.includes("reschedul") ||
    lowerText.includes("another day") ||
    lowerText.includes("instead")
  ) {
    return "reschedule_booking"
  }

  const hasBookingWord =
    /\b(book|booking|appointment|schedule|reserve|reservation)\b/.test(
      lowerText
    )

  const hasDateWord =
    lowerText.includes("today") ||
    lowerText.includes("tomorrow") ||
    lowerText.includes("monday") ||
    lowerText.includes("tuesday") ||
    lowerText.includes("wednesday") ||
    lowerText.includes("thursday") ||
    lowerText.includes("friday") ||
    lowerText.includes("saturday") ||
    lowerText.includes("sunday")

  const hasTimeWord =
    lowerText.includes("am") ||
    lowerText.includes("pm") ||
    /\b\d{1,2}:\d{2}\b/.test(lowerText) ||
    /\b\d{1,2}\s?(am|pm)\b/.test(lowerText)

  const soundsLikeBooking =
    lowerText.includes("i want") ||
    lowerText.includes("i need") ||
    lowerText.includes("can i get") ||
    lowerText.includes("let me get") ||
    lowerText.includes("i would like")

  const asksAboutPrice =
    /\b(price|prices|cost|costs|rate|rates|charge|charges|fee|fees)\b/.test(
      lowerText
    ) || lowerText.includes("how much")

  const asksAboutBusinessInformation =
    asksAboutPrice ||
    /\b(location|address|service|services)\b/.test(
      lowerText
    )

  const hasSpecificBookingDetails =
    hasDateWord || hasTimeWord

  if (
    asksAboutBusinessInformation &&
    !(
      hasBookingWord &&
      hasSpecificBookingDetails
    )
  ) {
    return "business_question"
  }

  if (
    hasBookingWord ||
    (soundsLikeBooking && (hasDateWord || hasTimeWord)) ||
    (hasDateWord && hasTimeWord)
  ) {
    return "book_appointment"
  }

  if (
    lowerText.includes("hour") ||
    lowerText.includes("open") ||
    lowerText.includes("close") ||
    lowerText.includes("time")
  ) {
    return "opening_hours"
  }

  if (asksAboutBusinessInformation) {
    return "business_question"
  }

  return "general_chat"
}

function asksAboutServicesOrPrices(userText: string) {
  const lowerText = userText.toLowerCase()

  return (
    /\b(price|prices|cost|costs|rate|rates|charge|charges|fee|fees|service|services)\b/.test(
      lowerText
    ) || lowerText.includes("how much")
  )
}

function getInstantBusinessReply({
  userText,
  business,
}: {
  userText: string
  business: WebhookBusiness
}) {
  const lowerText = userText.toLowerCase()

  const asksLocation =
    /\b(address|location|located|directions)\b/.test(
      lowerText
    ) ||
    lowerText.includes("where are you") ||
    lowerText.includes("where is the business")

  if (asksLocation) {
    return business.address
      ? `We are located at ${business.address}.`
      : "Sorry, the business has not added its address yet."
  }

  const asksPhone =
    /\b(phone|telephone|contact|call)\b/.test(
      lowerText
    ) || lowerText.includes("phone number")

  if (asksPhone) {
    return business.phone
      ? `You can contact us at ${business.phone}.`
      : "Sorry, the business has not added a contact number yet."
  }

  return null
}

async function getBusinessHoursText({
  businessId,
  fallbackHours,
}: {
  businessId: string
  fallbackHours?: string | null
}) {
  const { data, error } = await supabase
    .from("business_availability")
    .select("day_of_week, open_time, close_time, is_closed")
    .eq("business_id", businessId)

  if (error) {
    console.error("GET BUSINESS HOURS ERROR:", error)

    return fallbackHours
      ? `Our opening hours are ${fallbackHours}.`
      : "Sorry, the business has not added its opening hours yet."
  }

  if (!data || data.length === 0) {
    return fallbackHours
      ? `Our opening hours are ${fallbackHours}.`
      : "Sorry, the business has not added its opening hours yet."
  }

  const hasZeroBasedDay = data.some(
    (item) => String(item.day_of_week) === "0"
  )

  const formattedDays = data
    .map((item) => {
      const day = formatStoredDay(
        item.day_of_week,
        hasZeroBasedDay
      )

      const isClosed =
        item.is_closed === true ||
        !item.open_time ||
        !item.close_time

      return {
        day,
        order: getDayOrder(day),
        text: isClosed
          ? `${day}: Closed`
          : `${day}: ${formatStoredTime(
              item.open_time
            )} - ${formatStoredTime(
              item.close_time
            )}`,
      }
    })
    .sort((a, b) => a.order - b.order)

  return `Our opening hours are:\n${formattedDays
    .map((item) => item.text)
    .join("\n")}`
}

function formatStoredDay(
  value: unknown,
  hasZeroBasedDay: boolean
) {
  const raw = String(value ?? "").trim()
  const numericDay = Number(raw)

  if (Number.isInteger(numericDay)) {
    const zeroBasedDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]

    const mondayBasedDays = [
      "",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]

    return hasZeroBasedDay
      ? zeroBasedDays[numericDay] || raw
      : mondayBasedDays[numericDay] || raw
  }

  return raw
    ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
    : "Unknown day"
}

function getDayOrder(day: string) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  const index = days.indexOf(day)

  return index === -1 ? 99 : index
}

function formatStoredTime(value: string) {
  const [rawHour, rawMinute] = value
    .slice(0, 5)
    .split(":")
    .map(Number)

  if (
    Number.isNaN(rawHour) ||
    Number.isNaN(rawMinute)
  ) {
    return value
  }

  const period = rawHour >= 12 ? "PM" : "AM"
  const hour = rawHour % 12 || 12
  const minute = String(rawMinute).padStart(2, "0")

  return `${hour}:${minute} ${period}`
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
Booking Policy: ${
  business?.booking_policy ||
  "Customers can request appointments by sending the service, date, and time. Confirm bookings only when the service exists and the time is available. If details are missing, ask one follow-up question."
}
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
  enabled,
}: {
  customerId: string
  userText: string
  enabled: boolean
}) {
  if (!enabled) {
    return
  }

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
  accessToken,
}: {
  to: string
  message: string
  integration: WhatsAppIntegration | null
  accessToken?: string | null
}) {
  const finalAccessToken =
    accessToken ||
    integration?.access_token ||
    process.env.WHATSAPP_ACCESS_TOKEN

  const phoneNumberId =
    integration?.phone_number_id ||
    process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!finalAccessToken || !phoneNumberId) {
    await sendWhatsAppMessage(to, message)
    return
  }

  const graphVersion =
    process.env.WHATSAPP_GRAPH_VERSION ||
    process.env.META_GRAPH_VERSION ||
    "v20.0"

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${finalAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
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