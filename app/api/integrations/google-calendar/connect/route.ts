import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"

export const runtime = "nodejs"

const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth"

const STATE_COOKIE =
  "jhyro_google_calendar_oauth_state"

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
]

export async function GET() {
  const business =
    await getCurrentBusiness()

  if (!business) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?google_calendar=unauthorized",
        getAppUrl()
      )
    )
  }

  const clientId =
    process.env.GOOGLE_CLIENT_ID

  const redirectUri =
    process.env
      .GOOGLE_CALENDAR_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error(
      "GOOGLE CALENDAR OAUTH ERROR: Missing Google OAuth environment variables"
    )

    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?google_calendar=config_error",
        getAppUrl()
      )
    )
  }

  const state =
    randomBytes(32).toString("hex")

  const authorizationUrl = new URL(
    GOOGLE_AUTH_URL
  )

  authorizationUrl.searchParams.set(
    "client_id",
    clientId
  )

  authorizationUrl.searchParams.set(
    "redirect_uri",
    redirectUri
  )

  authorizationUrl.searchParams.set(
    "response_type",
    "code"
  )

  authorizationUrl.searchParams.set(
    "scope",
    GOOGLE_SCOPES.join(" ")
  )

  authorizationUrl.searchParams.set(
    "access_type",
    "offline"
  )

  authorizationUrl.searchParams.set(
    "include_granted_scopes",
    "true"
  )

  authorizationUrl.searchParams.set(
    "prompt",
    "consent select_account"
  )

  authorizationUrl.searchParams.set(
    "state",
    state
  )

  const response =
    NextResponse.redirect(
      authorizationUrl
    )

  response.cookies.set(
    STATE_COOKIE,
    state,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    }
  )

  return response
}

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  )
}