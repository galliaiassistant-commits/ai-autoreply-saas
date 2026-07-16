import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { getBusinessTimezone } from "@/lib/scheduler/timezone"

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token"

const GOOGLE_CALENDAR_API =
  "https://www.googleapis.com/calendar/v3"

type GoogleCalendarConnection = {
  business_id: string
  calendar_id: string
  access_token: string | null
  refresh_token: string
  token_expires_at: string | null
  connected: boolean
}

type GoogleRefreshResponse = {
  access_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

type GoogleEventResponse = {
  id?: string
  htmlLink?: string
  error?: {
    message?: string
  }
}

type CreateGoogleCalendarEventInput = {
  businessId: string
  bookingId: string
  customerId: string
  serviceName: string
  bookingTime: string
  durationMinutes: number
}

export type GoogleCalendarSyncResult = {
  synced: boolean
  skipped?: boolean
  eventId?: string
  calendarId?: string
  eventLink?: string
  error?: string
}

async function getConnection(
  businessId: string
): Promise<GoogleCalendarConnection | null> {
  const { data, error } = await supabase
    .from("google_calendar_connections")
    .select(`
      business_id,
      calendar_id,
      access_token,
      refresh_token,
      token_expires_at,
      connected
    `)
    .eq("business_id", businessId)
    .eq("connected", true)
    .maybeSingle()

  if (error) {
    console.error(
      "GOOGLE CALENDAR CONNECTION LOAD ERROR:",
      error
    )

    return null
  }

  return data
}

function tokenIsStillValid(
  connection: GoogleCalendarConnection
) {
  if (
    !connection.access_token ||
    !connection.token_expires_at
  ) {
    return false
  }

  const expiresAt = new Date(
    connection.token_expires_at
  ).getTime()

  if (!Number.isFinite(expiresAt)) {
    return false
  }

  return expiresAt > Date.now() + 60_000
}

async function refreshAccessToken(
  connection: GoogleCalendarConnection
) {
  const clientId =
    process.env.GOOGLE_CLIENT_ID

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google Calendar OAuth credentials are missing."
    )
  }

  if (!connection.refresh_token) {
    throw new Error(
      "Google Calendar refresh token is missing."
    )
  }

  const response = await fetch(
    GOOGLE_TOKEN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token:
          connection.refresh_token,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    }
  )

  const tokenData =
    (await response.json()) as GoogleRefreshResponse

  if (
    !response.ok ||
    !tokenData.access_token
  ) {
    console.error(
      "GOOGLE CALENDAR TOKEN REFRESH ERROR:",
      tokenData.error,
      tokenData.error_description
    )

    throw new Error(
      tokenData.error_description ||
        "Google Calendar access could not be refreshed."
    )
  }

  const expiresIn =
    typeof tokenData.expires_in === "number"
      ? tokenData.expires_in
      : 3600

  const tokenExpiresAt = new Date(
    Date.now() + expiresIn * 1000
  ).toISOString()

  const { error: updateError } =
    await supabase
      .from(
        "google_calendar_connections"
      )
      .update({
        access_token:
          tokenData.access_token,
        token_type:
          tokenData.token_type ||
          "Bearer",
        token_expires_at:
          tokenExpiresAt,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "business_id",
        connection.business_id
      )

  if (updateError) {
    console.error(
      "GOOGLE CALENDAR TOKEN SAVE ERROR:",
      updateError
    )
  }

  connection.access_token =
    tokenData.access_token

  connection.token_expires_at =
    tokenExpiresAt

  return tokenData.access_token
}

async function getAccessToken(
  connection: GoogleCalendarConnection,
  forceRefresh = false
) {
  if (
    !forceRefresh &&
    tokenIsStillValid(connection) &&
    connection.access_token
  ) {
    return connection.access_token
  }

  return refreshAccessToken(connection)
}

async function saveBookingSyncError({
  businessId,
  bookingId,
  error,
}: {
  businessId: string
  bookingId: string
  error: string
}) {
  const { error: updateError } =
    await supabase
      .from("bookings")
      .update({
        google_calendar_sync_error:
          error.slice(0, 1000),
      })
      .eq("id", bookingId)
      .eq("business_id", businessId)

  if (updateError) {
    console.error(
      "GOOGLE CALENDAR BOOKING ERROR SAVE FAILED:",
      updateError
    )
  }
}

export async function createGoogleCalendarEvent({
  businessId,
  bookingId,
  customerId,
  serviceName,
  bookingTime,
  durationMinutes,
}: CreateGoogleCalendarEventInput): Promise<GoogleCalendarSyncResult> {
  const connection =
    await getConnection(businessId)

  if (!connection) {
    return {
      synced: false,
      skipped: true,
    }
  }

  try {
    const start = new Date(bookingTime)

    if (
      Number.isNaN(start.getTime())
    ) {
      throw new Error(
        "The booking time is invalid."
      )
    }

    const safeDuration =
      Number.isFinite(durationMinutes) &&
      durationMinutes > 0
        ? durationMinutes
        : 30

    const end = new Date(
      start.getTime() +
        safeDuration * 60_000
    )

    const timeZone =
      await getBusinessTimezone(
        businessId
      )

    const {
      data: customer,
      error: customerError,
    } = await supabase
      .from("customers")
      .select("name, phone_number")
      .eq("id", customerId)
      .eq("business_id", businessId)
      .maybeSingle()

    if (customerError) {
      console.error(
        "GOOGLE CALENDAR CUSTOMER LOAD ERROR:",
        customerError
      )
    }

    const customerName =
      customer?.name ||
      customer?.phone_number ||
      "Customer"

    const description = [
      `Jhyro AI booking`,
      `Service: ${serviceName}`,
      customer?.name
        ? `Customer: ${customer.name}`
        : null,
      customer?.phone_number
        ? `Phone: ${customer.phone_number}`
        : null,
      `Jhyro booking ID: ${bookingId}`,
    ]
      .filter(Boolean)
      .join("\n")

    const eventBody = {
      summary:
        `${serviceName} - ${customerName}`,
      description,
      start: {
        dateTime: start.toISOString(),
        timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone,
      },
      extendedProperties: {
        private: {
          jhyro_booking_id:
            bookingId,
          jhyro_business_id:
            businessId,
        },
      },
    }

    const calendarId =
      connection.calendar_id ||
      "primary"

    const eventUrl =
      `${GOOGLE_CALENDAR_API}` +
      `/calendars/${encodeURIComponent(
        calendarId
      )}/events`

    let accessToken =
      await getAccessToken(connection)

    let response = await fetch(
      eventUrl,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(eventBody),
        cache: "no-store",
      }
    )

    if (response.status === 401) {
      accessToken =
        await getAccessToken(
          connection,
          true
        )

      response = await fetch(
        eventUrl,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            eventBody
          ),
          cache: "no-store",
        }
      )
    }

    const eventData =
      (await response.json()) as GoogleEventResponse

    if (
      !response.ok ||
      !eventData.id
    ) {
      throw new Error(
        eventData.error?.message ||
          "Google Calendar could not create the event."
      )
    }

    const syncedAt =
      new Date().toISOString()

    const { error: bookingUpdateError } =
      await supabase
        .from("bookings")
        .update({
          google_calendar_event_id:
            eventData.id,
          google_calendar_id:
            calendarId,
          google_calendar_synced_at:
            syncedAt,
          google_calendar_sync_error:
            null,
        })
        .eq("id", bookingId)
        .eq(
          "business_id",
          businessId
        )

    if (bookingUpdateError) {
      console.error(
        "GOOGLE CALENDAR BOOKING UPDATE ERROR:",
        bookingUpdateError
      )
    }

    const { error: connectionUpdateError } =
      await supabase
        .from(
          "google_calendar_connections"
        )
        .update({
          last_synced_at: syncedAt,
          updated_at: syncedAt,
        })
        .eq(
          "business_id",
          businessId
        )

    if (connectionUpdateError) {
      console.error(
        "GOOGLE CALENDAR LAST SYNC UPDATE ERROR:",
        connectionUpdateError
      )
    }

    return {
      synced: true,
      eventId: eventData.id,
      calendarId,
      eventLink:
        eventData.htmlLink,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Google Calendar error."

    console.error(
      "GOOGLE CALENDAR EVENT CREATE ERROR:",
      message
    )

    await saveBookingSyncError({
      businessId,
      bookingId,
      error: message,
    })

    return {
      synced: false,
      error: message,
    }
  }
}