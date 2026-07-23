import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const INSTAGRAM_TOKEN_URL =
  "https://api.instagram.com/oauth/access_token"

const INSTAGRAM_GRAPH_URL =
  "https://graph.instagram.com"

const STATE_COOKIE =
  "jhyro_instagram_oauth_state"

type InstagramShortLivedTokenResponse = {
  access_token?: string
  user_id?: number | string
  permissions?: string
  error_type?: string
  code?: number
  error_message?: string
}

type InstagramLongLivedTokenResponse = {
  access_token?: string
  token_type?: string
  expires_in?: number
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
}

type InstagramProfile = {
  id?: string
  user_id?: string
  username?: string
  name?: string
  account_type?: string
  profile_picture_url?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
}

type InstagramSubscriptionResponse = {
  success?: boolean
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
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

  const oauthErrorReason =
    requestUrl.searchParams.get(
      "error_reason"
    )

  const oauthErrorDescription =
    requestUrl.searchParams.get(
      "error_description"
    )

  const savedState =
    request.cookies.get(
      STATE_COOKIE
    )?.value

  if (oauthError) {
    console.error(
      "INSTAGRAM OAUTH DENIED:",
      {
        error: oauthError,
        reason: oauthErrorReason,
        description:
          oauthErrorDescription,
      }
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
      "INSTAGRAM OAUTH ERROR: Invalid OAuth state or missing code"
    )

    return redirectWithStatus(
      request,
      "invalid_state"
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

  const clientId =
    process.env.INSTAGRAM_APP_ID

  const clientSecret =
    process.env.INSTAGRAM_APP_SECRET

  const redirectUri =
    process.env.INSTAGRAM_REDIRECT_URI

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri
  ) {
    console.error(
      "INSTAGRAM OAUTH ERROR: Missing Instagram OAuth environment variables"
    )

    return redirectWithStatus(
      request,
      "config_error"
    )
  }

  try {
    const shortLivedToken =
      await exchangeCodeForToken({
        code,
        clientId,
        clientSecret,
        redirectUri,
      })

    if (
      !shortLivedToken.access_token ||
      !shortLivedToken.user_id
    ) {
      console.error(
        "INSTAGRAM TOKEN EXCHANGE ERROR:",
        shortLivedToken
      )

      return redirectWithStatus(
        request,
        "token_error"
      )
    }

    const longLivedToken =
      await exchangeForLongLivedToken({
        accessToken:
          shortLivedToken.access_token,
        clientSecret,
      })

    const finalAccessToken =
      longLivedToken.access_token ||
      shortLivedToken.access_token

    const instagramProfile =
      await getInstagramProfile(
        finalAccessToken
      )

    const instagramAccountId =
      instagramProfile.id ||
      instagramProfile.user_id ||
      String(
        shortLivedToken.user_id
      )

    if (!instagramAccountId) {
      console.error(
        "INSTAGRAM PROFILE ERROR: No Instagram account ID returned",
        instagramProfile
      )

      return redirectWithStatus(
        request,
        "profile_error"
      )
    }

    const subscription =
      await subscribeInstagramAccount({
        instagramAccountId,
        accessToken:
          finalAccessToken,
      })

    if (!subscription.success) {
      console.error(
        "INSTAGRAM WEBHOOK SUBSCRIPTION ERROR:",
        subscription.error
      )
    }

    const expiresIn =
      typeof longLivedToken.expires_in ===
      "number"
        ? longLivedToken.expires_in
        : 60 * 24 * 60 * 60

    const expiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString()

    const permissions =
      shortLivedToken.permissions
        ?.split(",")
        .map((permission) =>
          permission.trim()
        )
        .filter(Boolean) || [
        "instagram_business_basic",
        "instagram_business_manage_messages",
      ]

    const now =
      new Date().toISOString()

    const {
      error: integrationError,
    } = await supabase
      .from("business_integrations")
      .upsert(
        {
          business_id: business.id,
          provider: "instagram",
          connected: true,
          instagram_account_id:
            instagramAccountId,
          instagram_username:
            instagramProfile.username ||
            null,
          expires_at: expiresAt,
          scopes: permissions,
          connection_method: "oauth",
          last_connected_at: now,
          disconnected_at: null,
          last_error:
            subscription.success
              ? null
              : subscription.error
                  ?.message ||
                "Webhook subscription failed.",
          metadata: {
            instagram_account_id:
              instagramAccountId,
            username:
              instagramProfile.username ||
              null,
            name:
              instagramProfile.name ||
              null,
            account_type:
              instagramProfile.account_type ||
              null,
            profile_picture_url:
              instagramProfile.profile_picture_url ||
              null,
            followers_count:
              instagramProfile.followers_count ??
              null,
            follows_count:
              instagramProfile.follows_count ??
              null,
            media_count:
              instagramProfile.media_count ??
              null,
            webhook_subscribed:
              subscription.success ===
              true,
          },
          updated_at: now,
        },
        {
          onConflict:
            "business_id,provider",
        }
      )

    if (integrationError) {
      console.error(
        "INSTAGRAM INTEGRATION SAVE ERROR:",
        integrationError
      )

      return redirectWithStatus(
        request,
        "save_error"
      )
    }

    const {
      error: secretError,
    } = await supabase
      .from(
        "business_integration_secrets"
      )
      .upsert(
        {
          business_id: business.id,
          provider: "instagram",
          access_token:
            finalAccessToken,
          token_type:
            longLivedToken.token_type ||
            "bearer",
          expires_at: expiresAt,
          updated_at: now,
        },
        {
          onConflict:
            "business_id,provider",
        }
      )

    if (secretError) {
      console.error(
        "INSTAGRAM SECRET SAVE ERROR:",
        secretError
      )

      await supabase
        .from("business_integrations")
        .update({
          connected: false,
          last_error:
            "Instagram connected, but its access token could not be stored.",
          updated_at: now,
        })
        .eq(
          "business_id",
          business.id
        )
        .eq(
          "provider",
          "instagram"
        )

      return redirectWithStatus(
        request,
        "secret_save_error"
      )
    }

    const {
      error: settingsError,
    } = await supabase
      .from("instagram_settings")
      .upsert(
        {
          business_id: business.id,
          updated_at: now,
        },
        {
          onConflict: "business_id",
          ignoreDuplicates: true,
        }
      )

    if (settingsError) {
      console.error(
        "INSTAGRAM SETTINGS CREATE ERROR:",
        settingsError
      )
    }

    if (!subscription.success) {
      return redirectWithStatus(
        request,
        "connected_webhook_warning"
      )
    }

    return redirectWithStatus(
      request,
      "connected"
    )
  } catch (error) {
    console.error(
      "INSTAGRAM CALLBACK ERROR:",
      error
    )

    return redirectWithStatus(
      request,
      "callback_error"
    )
  }
}

async function exchangeCodeForToken({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}) {
  const response = await fetch(
    INSTAGRAM_TOKEN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type:
          "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
      cache: "no-store",
    }
  )

  const data =
    (await response.json()) as InstagramShortLivedTokenResponse

  if (
    !response.ok ||
    !data.access_token
  ) {
    console.error(
      "INSTAGRAM SHORT-LIVED TOKEN ERROR:",
      data
    )

    throw new Error(
      data.error_message ||
        "Instagram did not return an access token."
    )
  }

  return data
}

async function exchangeForLongLivedToken({
  accessToken,
  clientSecret,
}: {
  accessToken: string
  clientSecret: string
}) {
  const url = new URL(
    `${INSTAGRAM_GRAPH_URL}/access_token`
  )

  url.searchParams.set(
    "grant_type",
    "ig_exchange_token"
  )

  url.searchParams.set(
    "client_secret",
    clientSecret
  )

  url.searchParams.set(
    "access_token",
    accessToken
  )

  const response = await fetch(
    url.toString(),
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const data =
    (await response.json()) as InstagramLongLivedTokenResponse

  if (
    !response.ok ||
    !data.access_token
  ) {
    console.error(
      "INSTAGRAM LONG-LIVED TOKEN ERROR:",
      data
    )

    return {
      access_token: accessToken,
      token_type: "bearer",
      expires_in:
        60 * 24 * 60 * 60,
    } satisfies InstagramLongLivedTokenResponse
  }

  return data
}

async function getInstagramProfile(
  accessToken: string
) {
  const url = new URL(
    `${INSTAGRAM_GRAPH_URL}/me`
  )

  url.searchParams.set(
    "fields",
    [
      "id",
      "user_id",
      "username",
      "name",
      "account_type",
      "profile_picture_url",
      "followers_count",
      "follows_count",
      "media_count",
    ].join(",")
  )

  url.searchParams.set(
    "access_token",
    accessToken
  )

  const response = await fetch(
    url.toString(),
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const data =
    (await response.json()) as InstagramProfile

  if (!response.ok) {
    console.error(
      "INSTAGRAM PROFILE REQUEST ERROR:",
      data
    )

    throw new Error(
      data.error?.message ||
        "Could not retrieve the Instagram account."
    )
  }

  return data
}

async function subscribeInstagramAccount({
  instagramAccountId,
  accessToken,
}: {
  instagramAccountId: string
  accessToken: string
}) {
  const url = new URL(
    `${INSTAGRAM_GRAPH_URL}/${instagramAccountId}/subscribed_apps`
  )

  url.searchParams.set(
    "subscribed_fields",
    [
      "messages",
      "messaging_postbacks",
      "messaging_seen",
      "message_reactions",
    ].join(",")
  )

  url.searchParams.set(
    "access_token",
    accessToken
  )

  const response = await fetch(
    url.toString(),
    {
      method: "POST",
      cache: "no-store",
    }
  )

  const data =
    (await response.json()) as InstagramSubscriptionResponse

  if (!response.ok) {
    return {
      success: false,
      error:
        data.error || {
          message:
            "Could not subscribe the Instagram account to webhook events.",
        },
    }
  }

  return {
    success:
      data.success === true,
    error: data.error,
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
    "instagram",
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