"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ConnectWhatsApp({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [businessAccountId, setBusinessAccountId] = useState("")
  const [verifyToken, setVerifyToken] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [loading, setLoading] = useState(false)

  async function save(connected: boolean) {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      alert("You must be signed in.")
      return
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (businessError || !business) {
      setLoading(false)
      alert("Business not found.")
      return
    }

    const { error } = await supabase
      .from("business_integrations")
      .upsert(
        {
          business_id: business.id,
          provider: "whatsapp",
          connected,
          phone_number: whatsappNumber || null,
          phone_number_id: phoneNumberId || null,
          business_account_id: businessAccountId || null,
          verify_token: verifyToken || null,
          access_token: accessToken || null,
          metadata: {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "business_id,provider",
        }
      )

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold">Connect WhatsApp</h2>

      <p className="mt-2 text-slate-400">
        Add your WhatsApp Cloud API details so Jhyro AI can receive and reply to customer messages.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Input
          label="WhatsApp Number"
          value={whatsappNumber}
          setValue={setWhatsappNumber}
          placeholder="+18760000000"
        />

        <Input
          label="Phone Number ID"
          value={phoneNumberId}
          setValue={setPhoneNumberId}
          placeholder="Meta phone number ID"
        />

        <Input
          label="WhatsApp Business Account ID"
          value={businessAccountId}
          setValue={setBusinessAccountId}
          placeholder="Meta WABA ID"
        />

        <Input
          label="Webhook Verify Token"
          value={verifyToken}
          setValue={setVerifyToken}
          placeholder="Your verify token"
        />
      </div>

      <label className="mt-5 block">
        <span className="text-sm text-slate-400">Access Token</span>

        <textarea
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Paste your Meta access token"
          className="mt-2 min-h-28 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
        />
      </label>

      <div className="mt-6 rounded-2xl bg-slate-800 p-5">
        <p className="font-semibold text-white">Webhook Callback URL</p>

        <p className="mt-2 break-all text-sm text-slate-400">
          https://ai-autoreply-saas.vercel.app/api/whatsapp
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Use this callback URL in Meta Developer Console. Your verify token must match the one you enter here.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={() => save(true)}
            disabled={loading}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Saving..." : "Connect WhatsApp"}
          </button>
        </div>
      </div>
    </section>
  )
}

function Input({
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
    <label>
      <span className="text-sm text-slate-400">{label}</span>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />
    </label>
  )
}