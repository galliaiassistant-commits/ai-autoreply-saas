"use client"

import { useState } from "react"
import { Loader2, ArrowRight } from "lucide-react"

export default function BillingCheckoutButton({
  plan,
  highlighted,
  active,
}: {
  plan: "starter" | "pro" | "business"
  highlighted?: boolean
  active?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.")
      }

      window.location.href = data.url
    } catch (error) {
      console.error(error)
      setError("Checkout failed. Try again.")
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading || active}
        className={
          highlighted
            ? "flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            : "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Redirecting...
          </>
        ) : active ? (
          "Current Plan"
        ) : (
          <>
            Choose Plan
            <ArrowRight size={16} />
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}