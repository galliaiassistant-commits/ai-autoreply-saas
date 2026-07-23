import { supabaseAdmin as supabase } from "@/lib/supabase/admin"
import { businessCanUseFeature } from "@/lib/plans"
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
  token_type?: string
  error?: string
  error_description?: string
}

type GoogleApiError = {
  error?: {
    message?: string
  }
}

type GoogleEventResponse = GoogleApiError & {
  id?: string
  htmlLink?: string
}

type GoogleFreeBusyResponse =
  GoogleApiError & {
    calendars?: Record<
      string,
      {
        busy?: Array<{
          start: string
          end: string
        }>
        errors?: Array<{
          reason?: string
        }>
      }
    >
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

export type GoogleCalendarAvailabilityResult = {
  connected: boolean
  available: boolean
  error?: string
}

async function getConnection(
  businessId: string
): Promise<GoogleCalendarConnection | null> {
  const {
    data: business,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(`
      subscription_plan,
      subscription_status,
      plan_override,
      plan_override_expires_at
    `)
    .eq("id", businessId)
    .maybeSingle()

  if (businessError) {
    console.error(
      "GOOGLE CALENDAR PLAN ACCESS CHECK ERROR:",
      businessError
    )

    return null
  }

  if (
    !business ||
    !businessCanUseFeature(
      business,
      "google_calendar"
    )
  ) {
    return null
  }

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

  return (
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now() + 60_000
  )
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

async function googleRequest(
  connection: GoogleCalendarConnection,
  url: string,
  init: RequestInit
) {
  let accessToken =
    await getAccessToken(connection)

  let response = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization:
        `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (response.status === 401) {
    accessToken =
      await getAccessToken(
        connection,
        true
      )

    response = await fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization:
          `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })
  }

  return response
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

export async function checkGoogleCalendarAvailability({
  businessId,
  bookingTime,
  durationMinutes,
}: {
  businessId: string
  bookingTime: string
  durationMinutes: number
}): Promise<GoogleCalendarAvailabilityResult> {
  const connection =
    await getConnection(businessId)

  if (!connection) {
    return {
      connected: false,
      available: true,
    }
  }

  try {
    const start =
      new Date(bookingTime)

    if (
      Number.isNaN(start.getTime())
    ) {
      return {
        connected: true,
        available: false,
        error:
          "The requested Calendar time is invalid.",
      }
    }

    const safeDuration =
      Math.max(
        1,
        Number(durationMinutes) || 30
      )

    const end = new Date(
      start.getTime() +
        safeDuration * 60_000
    )

    const timeZone =
      await getBusinessTimezone(
        businessId
      )

    const calendarId =
      connection.calendar_id ||
      "primary"

    const response =
      await googleRequest(
        connection,
        `${GOOGLE_CALENDAR_API}/freeBusy`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            timeMin:
              start.toISOString(),
            timeMax:
              end.toISOString(),
            timeZone,
            items: [
              {
                id: calendarId,
              },
            ],
          }),
        }
      )

    const result =
      (await response.json()) as GoogleFreeBusyResponse

    if (!response.ok) {
      const message =
        result.error?.message ||
        "Google Calendar availability could not be checked."

      console.error(
        "GOOGLE CALENDAR FREEBUSY ERROR:",
        message
      )

      return {
        connected: true,
        available: false,
        error: message,
      }
    }

    const calendarResult =
      result.calendars?.[calendarId]

    if (
      calendarResult?.errors &&
      calendarResult.errors.length > 0
    ) {
      const message =
        calendarResult.errors[0]
          ?.reason ||
        "Google Calendar returned an availability error."

      console.error(
        "GOOGLE CALENDAR FREEBUSY CALENDAR ERROR:",
        message
      )

      return {
        connected: true,
        available: false,
        error: message,
      }
    }

    const busy =
      calendarResult?.busy || []

    return {
      connected: true,
      available: busy.length === 0,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Google Calendar availability error."

    console.error(
      "GOOGLE CALENDAR AVAILABILITY ERROR:",
      message
    )

    return {
      connected: true,
      available: false,
      error: message,
    }
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
    const start =
      new Date(bookingTime)

    if (
      Number.isNaN(start.getTime())
    ) {
      throw new Error(
        "The booking time is invalid."
      )
    }

    const safeDuration =
      Math.max(
        1,
        Number(durationMinutes) || 30
      )

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
      "Jhyro AI booking",
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
        dateTime:
          start.toISOString(),
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

    const response =
      await googleRequest(
        connection,
        eventUrl,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            eventBody
          ),
        }
      )

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

    const {
      error: connectionUpdateError,
    } = await supabase
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

type UpdateGoogleCalendarEventInput =
  CreateGoogleCalendarEventInput

export async function updateGoogleCalendarEvent({
  businessId,
  bookingId,
  customerId,
  serviceName,
  bookingTime,
  durationMinutes,
}: UpdateGoogleCalendarEventInput): Promise<GoogleCalendarSyncResult> {
  const connection =
    await getConnection(businessId)

  if (!connection) {
    return {
      synced: false,
      skipped: true,
    }
  }

  const {
    data: booking,
    error: bookingError,
  } = await supabase
    .from("bookings")
    .select(`
      google_calendar_event_id,
      google_calendar_id
    `)
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .maybeSingle()

  if (bookingError) {
    console.error(
      "GOOGLE CALENDAR RESCHEDULE BOOKING LOAD ERROR:",
      bookingError
    )

    return {
      synced: false,
      error:
        "The existing booking could not be loaded.",
    }
  }

  if (
    !booking?.google_calendar_event_id
  ) {
    return {
      synced: false,
      skipped: true,
    }
  }

  try {
    const start =
      new Date(bookingTime)

    if (
      Number.isNaN(start.getTime())
    ) {
      throw new Error(
        "The new booking time is invalid."
      )
    }

    const safeDuration = Math.max(
      1,
      Number(durationMinutes) || 30
    )

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
        "GOOGLE CALENDAR RESCHEDULE CUSTOMER LOAD ERROR:",
        customerError
      )
    }

    const customerName =
      customer?.name ||
      customer?.phone_number ||
      "Customer"

    const description = [
      "Jhyro AI booking",
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

    const calendarId =
      booking.google_calendar_id ||
      connection.calendar_id ||
      "primary"

    const eventUrl =
      `${GOOGLE_CALENDAR_API}` +
      `/calendars/${encodeURIComponent(
        calendarId
      )}/events/${encodeURIComponent(
        booking.google_calendar_event_id
      )}`

    const response =
      await googleRequest(
        connection,
        eventUrl,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            summary:
              `${serviceName} - ${customerName}`,
            description,
            start: {
              dateTime:
                start.toISOString(),
              timeZone,
            },
            end: {
              dateTime:
                end.toISOString(),
              timeZone,
            },
          }),
        }
      )

    const eventData =
      (await response.json()) as GoogleEventResponse

    if (!response.ok) {
      throw new Error(
        eventData.error?.message ||
          "Google Calendar could not update the event."
      )
    }

    const syncedAt =
      new Date().toISOString()

    const { error: syncError } =
      await supabase
        .from("bookings")
        .update({
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

    if (syncError) {
      console.error(
        "GOOGLE CALENDAR RESCHEDULE SYNC SAVE ERROR:",
        syncError
      )
    }

    return {
      synced: true,
      eventId:
        booking.google_calendar_event_id,
      calendarId,
      eventLink:
        eventData.htmlLink,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Google Calendar reschedule error."

    console.error(
      "GOOGLE CALENDAR EVENT UPDATE ERROR:",
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

export async function deleteGoogleCalendarEvent({
  businessId,
  bookingId,
  customerId,
}: {
  businessId: string
  bookingId: string
  customerId: string
}): Promise<GoogleCalendarSyncResult> {
  const connection =
    await getConnection(businessId)

  if (!connection) {
    return {
      synced: false,
      skipped: true,
    }
  }

  const {
    data: booking,
    error: bookingError,
  } = await supabase
    .from("bookings")
    .select(`
      google_calendar_event_id,
      google_calendar_id
    `)
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .maybeSingle()

  if (bookingError) {
    console.error(
      "GOOGLE CALENDAR CANCEL BOOKING LOAD ERROR:",
      bookingError
    )

    return {
      synced: false,
      error:
        "The existing booking could not be loaded.",
    }
  }

  if (
    !booking?.google_calendar_event_id
  ) {
    return {
      synced: false,
      skipped: true,
    }
  }

  try {
    const calendarId =
      booking.google_calendar_id ||
      connection.calendar_id ||
      "primary"

    const eventUrl =
      `${GOOGLE_CALENDAR_API}` +
      `/calendars/${encodeURIComponent(
        calendarId
      )}/events/${encodeURIComponent(
        booking.google_calendar_event_id
      )}`

    const response =
      await googleRequest(
        connection,
        eventUrl,
        {
          method: "DELETE",
        }
      )

    if (
      !response.ok &&
      response.status !== 404
    ) {
      let message =
        "Google Calendar could not delete the event."

      try {
        const errorData =
          (await response.json()) as GoogleApiError

        message =
          errorData.error?.message ||
          message
      } catch {
        // Google may return an empty error response.
      }

      throw new Error(message)
    }

    const syncedAt =
      new Date().toISOString()

    const { error: updateError } =
      await supabase
        .from("bookings")
        .update({
          google_calendar_event_id:
            null,
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

    if (updateError) {
      console.error(
        "GOOGLE CALENDAR CANCEL SYNC SAVE ERROR:",
        updateError
      )
    }

    console.log(
      "GOOGLE CALENDAR EVENT DELETED:",
      booking.google_calendar_event_id
    )

    return {
      synced: true,
      eventId:
        booking.google_calendar_event_id,
      calendarId,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Google Calendar cancellation error."

    console.error(
      "GOOGLE CALENDAR EVENT DELETE ERROR:",
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