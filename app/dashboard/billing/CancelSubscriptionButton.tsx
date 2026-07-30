"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  XCircle,
  Loader2,
} from "lucide-react"

export default function CancelSubscriptionButton() {
  const router = useRouter()

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [showConfirm, setShowConfirm] =
    useState(false)

  const [showFeedback, setShowFeedback] =
    useState(false)

  const [reason, setReason] =
    useState("")

  const [otherReason, setOtherReason] =
    useState("")

  async function cancelSubscription() {
    try {
      setLoading(true)
      setError(null)

      const response =
        await fetch(
          "/api/paypal/cancel",
          {
            method: "POST",
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Cancellation failed."
        )
      }

      setShowConfirm(false)
      setShowFeedback(true)

      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Cancellation failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() =>
          setShowConfirm(true)
        }
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 font-semibold text-red-400 transition hover:bg-red-500/30"
      >
        <XCircle size={18} />

        Cancel Subscription
      </button>


      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">

            <h2 className="text-xl font-bold text-white">
              Are you sure you want to cancel your subscription?
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              You will lose access to Jhyro AI features after cancellation.
            </p>


            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                className="flex-1 cursor-pointer rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-600"
              >
                Keep Subscription
              </button>


              <button
                onClick={cancelSubscription}
                disabled={loading}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {loading && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                Continue
              </button>

            </div>

          </div>
        </div>
      )}


      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">

          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">

            <h2 className="text-xl font-bold text-white">
              Why did you cancel your subscription?
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your feedback helps us improve Jhyro AI.
            </p>


            <div className="mt-5 space-y-3">

              {[
                "Too expensive",
                "Not using it enough",
                "Missing a feature",
                "Had technical issues",
                "Found another solution",
                "Other",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setReason(item)
                  }
                  className={
                    reason === item
                      ? "w-full cursor-pointer rounded-xl border border-cyan-400 bg-cyan-400/20 px-4 py-3 text-left text-white"
                      : "w-full cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
                  }
                >
                  {item}
                </button>
              ))}

            </div>


            {reason === "Other" && (
              <textarea
                value={otherReason}
                onChange={(e) =>
                  setOtherReason(
                    e.target.value
                  )
                }
                placeholder="Tell us why..."
                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none"
                rows={3}
              />
            )}


            <div className="mt-5 flex gap-3">

              <button
                onClick={() => {
                  setShowFeedback(false)
                }}
                className="flex-1 cursor-pointer rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white"
              >
                Skip
              </button>


              <button
                onClick={() => {
                  setShowFeedback(false)
                }}
                className="flex-1 cursor-pointer rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black"
              >
                Submit
              </button>

            </div>

          </div>

        </div>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </>
  )
}