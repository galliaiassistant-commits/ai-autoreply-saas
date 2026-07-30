"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")
  const [loading, setLoading] =
    useState(false)
  const [message, setMessage] =
    useState<string | null>(null)

  async function resetPassword(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setMessage(null)

    if (password.length < 8) {
      setMessage(
        "Password must be at least 8 characters."
      )
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    try {
      setLoading(true)

      const { error } =
        await supabase.auth.updateUser({
          password,
        })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setMessage(
        "Password updated successfully. Redirecting to sign in..."
      )

      setTimeout(() => {
        router.push("/auth/sign-in")
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black">
            J
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Create New Password
          </h1>

          <p className="mt-2 text-slate-400">
            Enter a new password for your Jhyro AI account.
          </p>
        </div>

        <form
          onSubmit={resetPassword}
          className="space-y-4"
        >
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            className="w-full rounded-xl bg-slate-800 p-3 outline-none"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            required
            className="w-full rounded-xl bg-slate-800 p-3 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-white p-3 font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-slate-300">
            {message}
          </p>
        )}

        <Link
          href="/auth/sign-in"
          className="mt-6 block text-center text-sm text-slate-400 underline"
        >
          Back to Sign In
        </Link>
      </div>
    </main>
  )
}