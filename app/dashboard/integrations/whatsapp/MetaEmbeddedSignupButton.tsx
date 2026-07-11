"use client"

import { useEffect, useState } from "react"
import { Loader2, MessageCircle } from "lucide-react"

declare global {
  interface Window {
    fbAsyncInit?: () => void
    FB?: any
  }
}

function loadFacebookSdk(appId: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve()
      return
    }

    if (window.FB) {
      resolve()
      return
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        autoLogAppEvents: true,
        xfbml: false,
        version: "v20.0",
      })

      resolve()
    }

    const existingScript =
      document.getElementById("facebook-jssdk")

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve())
      existingScript.addEventListener("error", reject)
      return
    }

    const script = document.createElement("script")
    script.id = "facebook-jssdk"
    script.src = "https://connect.facebook.net/en_US/sdk.js"
    script.async = true
    script.defer = true
    script.crossOrigin = "anonymous"
    script.onerror = () =>
      reject(new Error("Facebook SDK failed to load"))

    document.body.appendChild(script)
  })
}

export default function MetaEmbeddedSignupButton({
  appId,
  configId,
}: {
  appId?: string
  configId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appId) {
      setError("Missing Meta App ID.")
      return
    }

    loadFacebookSdk(appId)
      .then(() => {
        setSdkReady(true)
      })
      .catch((error) => {
        console.error("META SDK LOAD ERROR:", error)
        setError("Could not load Meta signup.")
      })
  }, [appId])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const allowedOrigin =
        event.origin.endsWith("facebook.com") ||
        event.origin.endsWith("facebook.net")

      if (!allowedOrigin) return

      try {
        const data =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data

        if (data?.type !== "WA_EMBEDDED_SIGNUP") {
          return
        }

        console.log("META EMBEDDED SIGNUP MESSAGE:", data)

        if (
          data?.data?.phone_number_id ||
          data?.data?.waba_id ||
          data?.data?.whatsapp_business_account_id
        ) {
          setMessage(
            "WhatsApp account selected. Waiting for authorization code..."
          )
        }
      } catch {
        // Meta may send non-JSON messages. Ignore them.
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  async function saveConnection(code: string) {
    const response = await fetch(
      "/api/meta/whatsapp/connect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || "Could not save WhatsApp connection."
      )
    }

    return result
  }

  function startSignup() {
    setError(null)
    setMessage(null)

    if (!appId) {
      setError("Missing Meta App ID.")
      return
    }

    if (!configId) {
      setError("Missing Meta configuration ID.")
      return
    }

    if (!window.FB || !sdkReady) {
      setError("Meta SDK is not ready yet.")
      return
    }

    setLoading(true)

    window.FB.login(
      async function (response: any) {
        try {
          console.log("META LOGIN RESPONSE:", response)

          const code =
            response?.authResponse?.code ||
            response?.authResponse?.accessToken

          if (!code) {
            setError(
              "Meta did not return an authorization code."
            )
            setLoading(false)
            return
          }

          setMessage("Saving WhatsApp connection...")

          await saveConnection(code)

          setMessage(
            "WhatsApp connected successfully. Refreshing..."
          )

          window.location.reload()
        } catch (error) {
          console.error("META CONNECT ERROR:", error)

          setError(
            error instanceof Error
              ? error.message
              : "Could not connect WhatsApp."
          )

          setLoading(false)
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "whatsapp_business_app_onboarding",
          sessionInfoVersion: "3",
        },
      }
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={startSignup}
        disabled={loading || !sdkReady}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <MessageCircle size={18} />
            Connect with Meta
          </>
        )}
      </button>

      {message && (
        <p className="mt-3 text-sm font-semibold text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}