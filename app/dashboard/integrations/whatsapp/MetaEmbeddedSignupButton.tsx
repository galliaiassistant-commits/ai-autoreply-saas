"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, MessageCircle } from "lucide-react"

declare global {
  interface Window {
    fbAsyncInit?: () => void
    FB?: any
    fbq?: any
  }
}

type SignupSessionData = {
  business_id?: string
  waba_id?: string
  whatsapp_business_account_id?: string
  phone_number_id?: string
  phone_number_id_selected?: string
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
        cookie: true,
        xfbml: true,
        autoLogAppEvents: true,
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

  const signupDataRef = useRef<SignupSessionData | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        event.origin === "https://www.facebook.com" ||
        event.origin === "https://web.facebook.com" ||
        event.origin.endsWith(".facebook.com")

      if (!allowedOrigin) return

      if (
        typeof event.data === "string" &&
        event.data.startsWith("data=")
      ) {
        return
      }

      try {
        const data =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data

        if (data?.type !== "WA_EMBEDDED_SIGNUP") {
          return
        }

        console.log("META EMBEDDED SIGNUP MESSAGE:", data)

        if (data.event === "FINISH") {
          signupDataRef.current = data.data || null

          setMessage(
            "WhatsApp account selected. Finishing authorization..."
          )
        }

        if (
          data.event ===
          "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
        ) {
          signupDataRef.current = data.data || null

          setMessage(
            "WhatsApp Business App account selected. Finishing authorization..."
          )
        }

        if (data.event === "ERROR") {
          setError(
            data?.data?.error_message ||
              "Meta returned an embedded signup error."
          )
          setLoading(false)
        }

        if (data.event === "CANCEL") {
          setError("Meta signup was cancelled.")
          setLoading(false)
        }
      } catch {
        // Meta sometimes sends non-JSON OAuth messages. Ignore them.
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  async function saveConnection(code: string) {
    const sessionData = signupDataRef.current

    const response = await fetch(
      "/api/meta/whatsapp/connect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          wabaId:
            sessionData?.waba_id ||
            sessionData?.whatsapp_business_account_id ||
            null,
          phoneNumberId:
            sessionData?.phone_number_id ||
            sessionData?.phone_number_id_selected ||
            null,
          metaBusinessId:
            sessionData?.business_id || null,
        }),
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

  function stopLoadingWithMessage(text: string) {
    setError(text)
    setLoading(false)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function startSignup() {
    setError(null)
    setMessage(null)
    signupDataRef.current = null

    if (!appId) {
      setError("Missing Meta App ID.")
      return
    }

    if (!configId) {
      setError("Missing Meta configuration ID.")
      return
    }

    if (!window.FB || !sdkReady) {
      setError("Meta SDK is not ready yet. Refresh the page and try again.")
      return
    }

    setLoading(true)
    setMessage("Opening Meta signup...")

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      stopLoadingWithMessage(
        "Meta signup did not finish. Check if the popup is blocked or hidden behind your browser."
      )
    }, 45000)

    try {
      if (window.fbq) {
        window.fbq("trackCustom", "WhatsAppOnboardingStart", {
          appId,
          feature: "whatsapp_embedded_signup",
        })
      }

      window.FB.login(
        async function (response: any) {
          try {
            console.log("META LOGIN RESPONSE:", response)

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
              timeoutRef.current = null
            }

            if (!response) {
              stopLoadingWithMessage(
                "Meta did not return a response."
              )
              return
            }

            if (response.status !== "connected") {
              stopLoadingWithMessage(
                "Meta signup was cancelled or not authorized."
              )
              return
            }

            const code = response?.authResponse?.code

            if (!code) {
              stopLoadingWithMessage(
                "Meta did not return an authorization code. Check that response_type is set to code in the Meta configuration."
              )
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

            stopLoadingWithMessage(
              error instanceof Error
                ? error.message
                : "Could not connect WhatsApp."
            )
          }
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            feature: "whatsapp_embedded_signup",
            featureType: "whatsapp_business_app_onboarding",
            sessionInfoVersion: "3",
          },
        }
      )
    } catch (error) {
      console.error("META SIGNUP START ERROR:", error)

      stopLoadingWithMessage(
        error instanceof Error
          ? error.message
          : "Could not start Meta signup."
      )
    }
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