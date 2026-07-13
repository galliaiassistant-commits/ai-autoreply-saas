"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react"

export default function ManualWhatsAppSetupForm() {
  const [displayPhoneNumber, setDisplayPhoneNumber] =
    useState("")
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [businessAccountId, setBusinessAccountId] =
    useState("")
  const [accessToken, setAccessToken] = useState("")

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    try {
      setLoading(true)
      setSuccess(null)
      setError(null)
      setWarning(null)

      const response = await fetch(
        "/api/integrations/whatsapp/manual",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayPhoneNumber,
            phoneNumberId,
            businessAccountId,
            accessToken,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Could not connect WhatsApp."
        )
      }

      setSuccess("WhatsApp connected successfully.")

      if (result.webhookWarning) {
        setWarning(result.webhookWarning)
      }

      setAccessToken("")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not connect WhatsApp."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-800 p-3 text-slate-300">
          <MessageCircle size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Manual WhatsApp Setup
          </h2>

          <p className="text-sm text-slate-400">
            Enter the WhatsApp Cloud API details for this business.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-300">
            Display phone number
          </label>

          <input
            value={displayPhoneNumber}
            onChange={(e) =>
              setDisplayPhoneNumber(e.target.value)
            }
            placeholder="+1 876 000 0000"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300">
            Phone number ID
          </label>

          <input
            value={phoneNumberId}
            onChange={(e) =>
              setPhoneNumberId(e.target.value)
            }
            placeholder="1104253339446650"
            required
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300">
            WhatsApp Business Account ID
          </label>

          <input
            value={businessAccountId}
            onChange={(e) =>
              setBusinessAccountId(e.target.value)
            }
            placeholder="922654234160331"
            required
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300">
            Access token
          </label>

          <textarea
            value={accessToken}
            onChange={(e) =>
              setAccessToken(e.target.value)
            }
            placeholder="Paste the WhatsApp access token here"
            required
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Connecting WhatsApp...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Save WhatsApp Connection
            </>
          )}
        </button>

        {success && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-semibold text-green-400">
            {success}
          </div>
        )}

        {warning && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm font-semibold text-yellow-400">
            Saved, but webhook subscription warning: {warning}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}