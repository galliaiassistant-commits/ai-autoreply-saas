"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] =
    useState("")
  const [loading, setLoading] =
    useState(false)
  const [googleLoading, setGoogleLoading] =
    useState(false)
  const [showPassword, setShowPassword] =
    useState(false)

  async function signIn(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    if (!data.session) {
      setLoading(false)
      alert(
        "A login session could not be created."
      )
      return
    }

    window.location.assign("/dashboard")
  }

  async function signInWithGoogle() {
    setGoogleLoading(true)

    const callbackUrl =
      `${window.location.origin}/auth/callback`

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      })

    if (error) {
      setGoogleLoading(false)
      alert(error.message)
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
            Welcome back
          </h1>

          <p className="mt-2 text-slate-400">
            Sign in to your Jhyro AI
            dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />

          <span className="text-xs text-slate-500">
            OR
          </span>

          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={signIn}>
          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-slate-800 p-3 outline-none"
          />

          <div className="mt-4 flex rounded-xl bg-slate-800">
            <input
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              className="w-full rounded-xl bg-transparent p-3 outline-none"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="px-4 text-sm text-slate-400 hover:text-white"
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                className="accent-white"
              />
              Remember me
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-slate-300 hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-black disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account yet?{" "}
          <Link
            href="/auth/sign-up"
            className="text-white underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}