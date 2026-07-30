"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ManualWhatsAppSetup() {
  const router = useRouter()

  const [displayPhoneNumber, setDisplayPhoneNumber] =
    useState("")

  const [phoneNumberId, setPhoneNumberId] =
    useState("")

  const [businessAccountId, setBusinessAccountId] =
    useState("")

  const [accessToken, setAccessToken] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!phoneNumberId.trim()) {
      setError("Phone Number ID is required.")
      return
    }

    if (!businessAccountId.trim()) {
      setError(
        "WhatsApp Business Account ID is required."
      )
      return
    }

    if (!accessToken.trim()) {
      setError("Access Token is required.")
      return
    }

    try {
      setLoading(true)

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to connect WhatsApp."
        )
      }

      setSuccess(
        "WhatsApp connected successfully."
      )

      setTimeout(() => {
        router.push(
          "/dashboard/integrations/whatsapp"
        )
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-xl font-bold text-white">
        WhatsApp Business API Details
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Enter your Meta WhatsApp Business credentials.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <Field
          label="Display Phone Number (Optional)"
          value={displayPhoneNumber}
          setValue={setDisplayPhoneNumber}
          placeholder="+1 876 000 0000"
        />

        <Field
          label="Phone Number ID"
          value={phoneNumberId}
          setValue={setPhoneNumberId}
          placeholder="Meta Phone Number ID"
        />

        <Field
          label="WhatsApp Business Account ID"
          value={businessAccountId}
          setValue={setBusinessAccountId}
          placeholder="WABA ID"
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Access Token
          </label>

          <textarea
            value={accessToken}
            onChange={(e) =>
              setAccessToken(e.target.value)
            }
            rows={5}
            placeholder="Meta access token"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-white outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-3 font-bold text-slate-900 disabled:opacity-50"
        >
          {loading
            ? "Connecting..."
            : "Connect WhatsApp"}
        </button>
      </form>
    </section>
  )
}

function Field({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          setValue(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none"
      />
    </div>
  )
}