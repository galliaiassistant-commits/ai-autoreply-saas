import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type InstagramMessagingEvent = {
  sender?: {
    id?: string
  }
  recipient?: {
    id?: string
  }
  timestamp?: number
  message?: {
    mid?: string
    text?: string
    is_echo?: boolean
    is_deleted?: boolean
    is_unsupported?: boolean
    attachments?: Array<{
      type?: string
      payload?: {
        url?: string
      }
    }>
    reply_to?: {
      mid?: string
      story?: {
        id?: string
        url?: string
      }
    }
  }
  reaction?: {
    mid?: string
    action?: string
    reaction?: string
    emoji?: string
  }
  read?: {
    mid?: string
  }
  postback?: {
    mid?: string
    title?: string
    payload?: string
  }
}

type InstagramWebhookEntry = {
  id?: string
  time?: number
  messaging?: InstagramMessagingEvent[]
}

type InstagramWebhookBody = {
  object?: string
  entry?: InstagramWebhookEntry[]
}

export async function GET(
  request: Request
) {
  const requestUrl = new URL(request.url)

  const mode =
    requestUrl.searchParams.get(
      "hub.mode"
    )

  const token =
    requestUrl.searchParams.get(
      "hub.verify_token"
    )

  const challenge =
    requestUrl.searchParams.get(
      "hub.challenge"
    )

  const expectedToken =
    process.env.INSTAGRAM_VERIFY_TOKEN

  if (
    mode === "subscribe" &&
    token &&
    expectedToken &&
    token === expectedToken &&
    challenge
  ) {
    console.log(
      "INSTAGRAM WEBHOOK VERIFIED"
    )

    return new Response(
      challenge,
      {
        status: 200,
        headers: {
          "Content-Type":
            "text/plain",
        },
      }
    )
  }

  console.error(
    "INSTAGRAM WEBHOOK VERIFICATION FAILED",
    {
      mode,
      tokenProvided: Boolean(token),
      expectedTokenConfigured:
        Boolean(expectedToken),
      challengeProvided:
        Boolean(challenge),
    }
  )

  return new Response(
    "Verification failed",
    {
      status: 403,
    }
  )
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as InstagramWebhookBody

    console.log(
      "INSTAGRAM WEBHOOK RECEIVED:",
      JSON.stringify(body, null, 2)
    )

    if (
      body.object !==
      "instagram"
    ) {
      console.log(
        "IGNORED NON-INSTAGRAM WEBHOOK:",
        body.object
      )

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason:
          "not_instagram_object",
      })
    }

    const entries =
      Array.isArray(body.entry)
        ? body.entry
        : []

    for (const entry of entries) {
      const instagramAccountId =
        entry.id || null

      if (!instagramAccountId) {
        console.log(
          "INSTAGRAM WEBHOOK ENTRY HAS NO ACCOUNT ID"
        )

        continue
      }

      await markInstagramWebhookReceived(
        instagramAccountId
      )

      const messagingEvents =
        Array.isArray(entry.messaging)
          ? entry.messaging
          : []

      for (
        const event of messagingEvents
      ) {
        await processInstagramEvent({
          instagramAccountId,
          event,
        })
      }
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error(
      "INSTAGRAM WEBHOOK ERROR:",
      error
    )

    // Meta should receive a 200 response so it does not
    // continuously retry malformed or unsupported events.
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Instagram webhook processing failed.",
      },
      {
        status: 200,
      }
    )
  }
}

async function processInstagramEvent({
  instagramAccountId,
  event,
}: {
  instagramAccountId: string
  event: InstagramMessagingEvent
}) {
  const senderId =
    event.sender?.id || null

  const recipientId =
    event.recipient?.id || null

  const messageId =
    event.message?.mid ||
    event.postback?.mid ||
    event.reaction?.mid ||
    event.read?.mid ||
    null

  console.log(
    "INSTAGRAM EVENT:",
    {
      instagramAccountId,
      senderId,
      recipientId,
      messageId,
      hasMessage:
        Boolean(event.message),
      hasPostback:
        Boolean(event.postback),
      hasReaction:
        Boolean(event.reaction),
      hasRead:
        Boolean(event.read),
      isEcho:
        event.message?.is_echo ===
        true,
    }
  )

  if (
    event.message?.is_echo === true
  ) {
    console.log(
      "INSTAGRAM HUMAN OR APP ECHO RECEIVED"
    )

    return
  }

  if (event.read) {
    console.log(
      "INSTAGRAM MESSAGE READ EVENT"
    )

    return
  }

  if (event.reaction) {
    console.log(
      "INSTAGRAM REACTION EVENT"
    )

    return
  }

  if (event.postback) {
    console.log(
      "INSTAGRAM POSTBACK EVENT:",
      {
        title:
          event.postback.title,
        payload:
          event.postback.payload,
      }
    )

    return
  }

  if (!event.message) {
    console.log(
      "INSTAGRAM EVENT HAS NO MESSAGE"
    )

    return
  }

  if (
    event.message.is_deleted === true
  ) {
    console.log(
      "INSTAGRAM MESSAGE WAS DELETED"
    )

    return
  }

  if (
    event.message.is_unsupported ===
    true
  ) {
    console.log(
      "UNSUPPORTED INSTAGRAM MESSAGE"
    )

    return
  }

  const userText =
    event.message.text?.trim() ||
    ""

  const attachments =
    event.message.attachments || []

  console.log(
    "INSTAGRAM CUSTOMER MESSAGE:",
    {
      senderId,
      text: userText,
      attachmentCount:
        attachments.length,
      replyToStory:
        Boolean(
          event.message.reply_to
            ?.story
        ),
    }
  )

  /*
   * The complete Jhyro AI processing pipeline will be
   * connected here after webhook verification succeeds.
   *
   * It will:
   * - resolve the business
   * - prevent duplicate message processing
   * - find or create the Instagram customer
   * - load Instagram automation settings
   * - check business hours
   * - check first-message-only mode
   * - check human takeover
   * - detect handoff requests
   * - run Jhyro AI, memory, services and bookings
   * - send the reply through Instagram
   */
}

async function markInstagramWebhookReceived(
  instagramAccountId: string
) {
  const now =
    new Date().toISOString()

  const { error } = await supabase
    .from(
      "business_integrations"
    )
    .update({
      last_webhook_at: now,
      last_error: null,
      updated_at: now,
    })
    .eq(
      "provider",
      "instagram"
    )
    .eq(
      "instagram_account_id",
      instagramAccountId
    )

  if (error) {
    console.error(
      "INSTAGRAM LAST WEBHOOK UPDATE ERROR:",
      error
    )
  }
}