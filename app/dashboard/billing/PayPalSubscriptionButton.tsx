"use client"

import {
  useEffect,
  useId,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

declare global {
  interface Window {
    paypal?: any
    __paypalSdkPromise?: Promise<void>
  }
}

function loadPayPalScript(clientId: string) {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  if (window.paypal) {
    return Promise.resolve()
  }

  if (window.__paypalSdkPromise) {
    return window.__paypalSdkPromise
  }

  window.__paypalSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      "paypal-sdk-script"
    )

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve())
      existingScript.addEventListener("error", reject)
      return
    }

    const script = document.createElement("script")

    script.id = "paypal-sdk-script"
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&vault=true&intent=subscription&currency=USD`
    script.async = true
    script.dataset.sdkIntegrationSource = "jhyro-ai"

    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error("PayPal SDK failed to load"))

    document.body.appendChild(script)
  })

  return window.__paypalSdkPromise
}

export default function PayPalSubscriptionButton({
  plan,
  planId,
  clientId,
  active,
}: {
  plan: "starter" | "pro" | "business"
  planId?: string
  clientId?: string
  active?: boolean
}) {
  const router = useRouter()
  const reactId = useId()

  const containerId = useMemo(() => {
    const cleanId = reactId.replace(/[^a-zA-Z0-9_-]/g, "")
    return `paypal-button-${plan}-${cleanId}`
  }, [plan, reactId])

  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false

    async function renderPayPalButton() {
      if (active) {
        setLoading(false)
        return
      }

      if (!clientId || !planId) {
        setError("PayPal setup is missing for this plan.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        await loadPayPalScript(clientId)

        if (canceled) return

        const container =
          document.getElementById(containerId)

        if (!container) return

        container.innerHTML = ""

        if (!window.paypal?.Buttons) {
          throw new Error("PayPal buttons are unavailable.")
        }

        await window.paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "gold",
              layout: "vertical",
              label: "subscribe",
            },

            createSubscription(
              _data: unknown,
              actions: any
            ) {
              return actions.subscription.create({
                plan_id: planId,
              })
            },

            async onApprove(data: any) {
              const subscriptionId = data.subscriptionID

              if (!subscriptionId) {
                setError("Missing PayPal subscription ID.")
                return
              }

              const response = await fetch(
                "/api/paypal/subscription",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    subscriptionId,
                    plan,
                  }),
                }
              )

              const result = await response.json()

              if (!response.ok) {
                throw new Error(
                  result.error ||
                    "Could not save PayPal subscription."
                )
              }

              setCompleted(true)
              router.refresh()
            },

            onCancel() {
              setError("Subscription was canceled.")
            },

            onError(err: unknown) {
              console.error("PAYPAL BUTTON ERROR:", err)
              setError("PayPal checkout failed. Try again.")
            },
          })
          .render(`#${containerId}`)

        if (!canceled) {
          setLoading(false)
        }
      } catch (error) {
        console.error("PAYPAL RENDER ERROR:", error)

        if (!canceled) {
          setError("Could not load PayPal button.")
          setLoading(false)
        }
      }
    }

    renderPayPalButton()

    return () => {
      canceled = true

      const container =
        document.getElementById(containerId)

      if (container) {
        container.innerHTML = ""
      }
    }
  }, [active, clientId, containerId, plan, planId, router])

  if (active) {
    return (
      <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500/20 px-4 py-3 font-semibold text-green-400">
        <CheckCircle2 size={18} />
        Current Plan
      </div>
    )
  }

  if (completed) {
    return (
      <div className="mt-6 rounded-xl bg-green-500/20 px-4 py-3 text-center font-semibold text-green-400">
        Subscription approved. Refreshing your billing status...
      </div>
    )
  }

  return (
    <div className="mt-6">
      {loading && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Loading PayPal...
        </div>
      )}

      <div id={containerId} />

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}