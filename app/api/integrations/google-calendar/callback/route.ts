import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token"

const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo"

const STATE_COOKIE =
  "jhyro_google_calendar_oauth_state"

type GoogleTokenResponse = {
  access_token?: string
  expires_in?: number
  refresh_token?: string
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

type GoogleUserInfo = {
  email?: string
}

export async function GET(
  request: NextRequest
) {
  const requestUrl = new URL(request.url)

  const code =
    requestUrl.searchParams.get("code")

  const returnedState =
    requestUrl.searchParams.get("state")

  const oauthError =
    requestUrl.searchParams.get("error")

  const savedState =
    request.cookies.get(
      STATE_COOKIE
    )?.value

  if (oauthError) {
    console.error(
      "GOOGLE CALENDAR OAUTH DENIED:",
      oauthError
    )

    return redirectWithStatus(
      request,
      "denied"
    )
  }

  if (
    !code ||
    !returnedState ||
    !savedState ||
    returnedState !== savedState
  ) {
    console.error(
      "GOOGLE CALENDAR OAUTH ERROR: Invalid OAuth state or missing code"
    )

    return redirectWithStatus(
      request,
      "invalid_state"
    )
  }

  const clientId =
    process.env.GOOGLE_CLIENT_ID

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET

  const redirectUri =
    process.env
      .GOOGLE_CALENDAR_REDIRECT_URI

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri
  ) {
    console.error(
      "GOOGLE CALENDAR OAUTH ERROR: Missing Google OAuth environment variables"
    )

    return redirectWithStatus(
      request,
      "config_error"
    )
  }

  const business =
    await getCurrentBusiness()

  if (!business) {
    return redirectWithStatus(
      request,
      "unauthorized"
    )
  }

  try {
    const tokenResponse = await fetch(
      GOOGLE_TOKEN_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type:
            "authorization_code",
        }),
        cache: "no-store",
      }
    )

    const tokenData =
      (await tokenResponse.json()) as GoogleTokenResponse

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        "GOOGLE TOKEN EXCHANGE ERROR:",
        tokenData.error,
        tokenData.error_description
      )

      return redirectWithStatus(
        request,
        "token_error"
      )
    }

    const { data: existingConnection } =
      await supabase
        .from(
          "google_calendar_connections"
        )
        .select("refresh_token")
        .eq(
          "business_id",
          business.id
        )
        .maybeSingle()

    const refreshToken =
      tokenData.refresh_token ||
      existingConnection?.refresh_token

    if (!refreshToken) {
      console.error(
        "GOOGLE CALENDAR OAUTH ERROR: Google did not return a refresh token"
      )

      return redirectWithStatus(
        request,
        "missing_refresh_token"
      )
    }

    let googleAccountEmail:
      | string
      | null = null

    const userInfoResponse =
      await fetch(
        GOOGLE_USERINFO_URL,
        {
          headers: {
            Authorization:
              `Bearer ${tokenData.access_token}`,
          },
          cache: "no-store",
        }
      )

    if (userInfoResponse.ok) {
      const userInfo =
        (await userInfoResponse.json()) as GoogleUserInfo

      googleAccountEmail =
        userInfo.email || null
    }

    const expiresIn =
      typeof tokenData.expires_in ===
      "number"
        ? tokenData.expires_in
        : 3600

    const tokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString()

    const scopes = tokenData.scope
      ? tokenData.scope.split(" ")
      : []

    const now =
      new Date().toISOString()

    const { error: connectionError } =
      await supabase
        .from(
          "google_calendar_connections"
        )
        .upsert(
          {
            business_id: business.id,
            google_account_email:
              googleAccountEmail,
            calendar_id: "primary",
            calendar_name:
              "Primary calendar",
            access_token:
              tokenData.access_token,
            refresh_token: refreshToken,
            token_type:
              tokenData.token_type ||
              "Bearer",
            scopes,
            token_expires_at:
              tokenExpiresAt,
            connected: true,
            updated_at: now,
          },
          {
            onConflict: "business_id",
          }
        )

    if (connectionError) {
      console.error(
        "GOOGLE CALENDAR CONNECTION SAVE ERROR:",
        connectionError
      )

      return redirectWithStatus(
        request,
        "save_error"
      )
    }

    const {
      error: integrationError,
    } = await supabase
      .from("business_integrations")
      .upsert(
        {
          business_id: business.id,
          provider:
            "google_calendar",
          connected: true,
          connection_method: "oauth",
          metadata: {
            google_account_email:
              googleAccountEmail,
            calendar_id: "primary",
            calendar_name:
              "Primary calendar",
          },
          updated_at: now,
          last_connected_at: now,
          disconnected_at: null,
        },
        {
          onConflict:
            "business_id,provider",
        }
      )

    if (integrationError) {
      console.error(
        "GOOGLE CALENDAR INTEGRATION SAVE ERROR:",
        integrationError
      )

      return redirectWithStatus(
        request,
        "save_error"
      )
    }

    return redirectWithStatus(
      request,
      "connected"
    )
  } catch (error) {
    console.error(
      "GOOGLE CALENDAR CALLBACK ERROR:",
      error
    )

    return redirectWithStatus(
      request,
      "callback_error"
    )
  }
}

function redirectWithStatus(
  request: NextRequest,
  status: string
) {
  const url = new URL(
    "/dashboard/integrations",
    request.url
  )

  url.searchParams.set(
    "google_calendar",
    status
  )

  const response =
    NextResponse.redirect(url)

  response.cookies.set(
    STATE_COOKIE,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    }
  )

  return response
}