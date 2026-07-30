"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState<string | null>(null)


  async function sendReset(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setMessage(null)


    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/auth/reset-password`,
        }
      )


    if (error) {
      setMessage(error.message)
    } else {
      setMessage(
        "Password reset email sent. Check your inbox."
      )
    }


    setLoading(false)
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <h1 className="text-center text-3xl font-bold">
          Reset Password
        </h1>


        <p className="mt-3 text-center text-slate-400">
          Enter your email and we will send you a reset link.
        </p>


        <form
          onSubmit={sendReset}
          className="mt-6"
        >

          <input
            value={email}
            onChange={(e)=>
              setEmail(e.target.value)
            }
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl bg-slate-800 p-3 outline-none"
          />


          <button
            disabled={loading}
            className="mt-5 w-full cursor-pointer rounded-xl bg-white p-3 font-semibold text-black hover:bg-slate-200 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
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
          Back to login
        </Link>


      </div>

    </main>
  )
}