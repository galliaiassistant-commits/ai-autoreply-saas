const paypalEnvironment = process.env.PAYPAL_ENV || "sandbox"

const paypalBaseUrl =
  paypalEnvironment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

export async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID")
  }

  if (!clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_SECRET")
  }

  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64")

  const response = await fetch(
    `${paypalBaseUrl}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const text = await response.text()
    console.error("PAYPAL TOKEN ERROR:", text)
    throw new Error("Could not get PayPal access token")
  }

  const data = await response.json()

  return data.access_token as string
}

export async function getPayPalSubscription(
  subscriptionId: string
) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(
    `${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const text = await response.text()
    console.error("PAYPAL SUBSCRIPTION ERROR:", text)
    throw new Error("Could not verify PayPal subscription")
  }

  return response.json()
}