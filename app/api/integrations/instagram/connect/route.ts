import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"

export const runtime = "nodejs"

const INSTAGRAM_AUTH_URL =
  "https://www.instagram.com/oauth/authorize"

const STATE_COOKIE =
  "jhyro_instagram_oauth_state"

const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
]

export async function GET() {
  const business = await getCurrentBusiness()

  if (!business) {
    return redirectToIntegrations(
      "unauthorized"
    )
  }

  const clientId =
    process.env.INSTAGRAM_APP_ID

  const redirectUri =
    process.env.INSTAGRAM_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error(
      "INSTAGRAM OAUTH ERROR: Missing Instagram OAuth environment variables"
    )

    return redirectToIntegrations(
      "config_error"
    )
  }

  const state =
    randomBytes(32).toString("hex")

  const authorizationUrl = new URL(
    INSTAGRAM_AUTH_URL
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
    INSTAGRAM_SCOPES.join(",")
  )

  authorizationUrl.searchParams.set(
    "state",
    state
  )

  authorizationUrl.searchParams.set(
    "enable_fb_login",
    "0"
  )

  authorizationUrl.searchParams.set(
    "force_authentication",
    "1"
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

function redirectToIntegrations(
  result: string
) {
  const url = new URL(
    "/dashboard/integrations",
    getAppUrl()
  )

  url.searchParams.set(
    "instagram",
    result
  )

  return NextResponse.redirect(url)
}

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  )
}