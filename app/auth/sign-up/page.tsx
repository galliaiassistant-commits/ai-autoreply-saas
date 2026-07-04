"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const router = useRouter()

  const [mode, setMode] = useState<"email" | "phone">("email")
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function createBusiness(userId: string) {
    const { error } = await supabase
      .from("businesses")
      .insert({
        business_name: businessName,
        owner_id: userId,
        phone: phone || null,
        email: email || null,
      })

    if (error) {
      alert(error.message)
      return false
    }

    return true
  }

  async function signUpWithEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    const userId = data.user?.id

    if (userId) {
      const created = await createBusiness(userId)

      if (!created) {
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.push("/onboarding")
  }

  async function signUpWithGoogle() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    })

    if (error) {
      setLoading(false)
      alert(error.message)
    }
  }

  async function sendPhoneOtp(e: React.FormEvent) {
    e.preventDefault()

    if (!phone) {
      alert("Enter your phone number.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setOtpSent(true)
    alert("Verification code sent.")
  }

  async function verifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault()

    if (!otp) {
      alert("Enter the verification code.")
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    const userId = data.user?.id

    if (userId) {
      const created = await createBusiness(userId)

      if (!created) {
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.push("/onboarding")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black">
            J
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-slate-400">
            Start setting up Jhyro AI for your business.
          </p>
        </div>

        <button
          type="button"
          onClick={signUpWithGoogle}
          disabled={loading}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="mb-5 flex rounded-xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={
              mode === "email"
                ? "flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                : "flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-300"
            }
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => setMode("phone")}
            className={
              mode === "phone"
                ? "flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
                : "flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-300"
            }
          >
            Phone
          </button>
        </div>

        {mode === "email" && (
          <form onSubmit={signUpWithEmail}>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="Business name"
              className="w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="Email"
              className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              placeholder="Password"
              className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <button
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        )}

        {mode === "phone" && (
          <form onSubmit={otpSent ? verifyPhoneOtp : sendPhoneOtp}>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="Business name"
              className="w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+18761234567"
              className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            {otpSent && (
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Verification code"
                className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
              />
            )}

            <button
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-black disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : otpSent
                ? "Verify Code"
                : "Send Code"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}