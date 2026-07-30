"use client"

import {
  useState,
} from "react"

import Link from "next/link"
import { Loader2 } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { getAuthError } from "@/lib/auth-errors"
import AuthAlert from "@/components/auth/AuthAlert"


export default function SignInPage() {

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [googleLoading, setGoogleLoading] =
    useState(false)

  const [showPassword, setShowPassword] =
    useState(false)

  const [message, setMessage] =
    useState<{
      type: "success" | "error"
      text: string
    } | null>(null)


  async function signIn(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setMessage(null)

    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Please enter your email and password.",
      })
      return
    }


    try {

      setLoading(true)


      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })


      if (error) {
        throw error
      }


      if (!data.session) {

        setMessage({
          type: "error",
          text: "Login session could not be created. Please try again.",
        })

        return
      }


      setMessage({
        type: "success",
        text: "Welcome back! Redirecting...",
      })


      setTimeout(() => {
        window.location.assign(
          "/dashboard"
        )
      }, 800)


    } catch (error) {

      setMessage({
        type: "error",
        text:
          getAuthError(
            error instanceof Error
              ? error.message
              : "Sign in failed."
          ),
      })

    } finally {

      setLoading(false)

    }

  }


  async function signInWithGoogle() {

    setMessage(null)

    try {

      setGoogleLoading(true)


      const callbackUrl =
        `${window.location.origin}/auth/callback`


      const {
        error,
      } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
            queryParams: {
              prompt:
                "select_account",
            },
          },
        })


      if (error) {
        throw error
      }


    } catch (error) {

      setMessage({
        type: "error",
        text:
          getAuthError(
            error instanceof Error
              ? error.message
              : "Google sign in failed."
          ),
      })


      setGoogleLoading(false)

    }

  }


  const disabled =
    loading || googleLoading


  return (

    <main className="
      flex min-h-screen items-center justify-center
      bg-slate-950 p-6 text-white
    ">

      <div className="
        w-full max-w-md rounded-2xl
        border border-slate-800
        bg-slate-900 p-6
      ">


        <div className="mb-6 text-center">

          <div className="
            mx-auto flex h-14 w-14
            items-center justify-center
            rounded-2xl bg-white
            text-2xl font-bold text-black
          ">
            J
          </div>


          <h1 className="
            mt-4 text-3xl font-bold
          ">
            Welcome back
          </h1>


          <p className="
            mt-2 text-slate-400
          ">
            Sign in to your Jhyro AI dashboard.
          </p>

        </div>


        {message && (
          <AuthAlert
            type={message.type}
            message={message.text}
          />
        )}



        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={disabled}
          className="
            flex w-full cursor-pointer
            items-center justify-center
            gap-2 rounded-xl
            border border-slate-700
            bg-slate-800 p-3
            font-semibold
            transition
            hover:bg-slate-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          {googleLoading && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {
            googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"
          }

        </button>



        <div className="
          my-6 flex items-center gap-3
        ">

          <div className="
            h-px flex-1 bg-slate-800
          " />

          <span className="
            text-xs text-slate-500
          ">
            OR
          </span>


          <div className="
            h-px flex-1 bg-slate-800
          " />

        </div>




        <form
          onSubmit={signIn}
          className="space-y-4"
        >


          <input

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            disabled={disabled}

            required

            type="email"

            placeholder="Email"

            className="
              w-full rounded-xl
              bg-slate-800 p-3
              outline-none
              disabled:opacity-50
            "

          />



          <div className="
            flex rounded-xl bg-slate-800
          ">


            <input

              value={password}

              onChange={(e) =>
                setPassword(e.target.value)
              }

              disabled={disabled}

              required

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Password"

              className="
                w-full rounded-xl
                bg-transparent
                p-3 outline-none
              "

            />


            <button

              type="button"

              disabled={disabled}

              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }

              className="
                cursor-pointer px-4
                text-sm text-slate-400
                transition hover:text-white
              "

            >

              {
                showPassword
                  ? "Hide"
                  : "Show"
              }

            </button>


          </div>




          <div className="
            flex items-center
            justify-between text-sm
          ">


            <label className="
              flex items-center gap-2
              text-slate-400
            ">

              <input
                type="checkbox"
                className="accent-white"
              />

              Remember me

            </label>



            <Link
              href="/auth/forgot-password"
              className="
                text-slate-300
                hover:text-white
              "
            >
              Forgot password?
            </Link>


          </div>




          <button

            disabled={disabled}

            className="
              flex w-full cursor-pointer
              items-center justify-center
              gap-2 rounded-xl
              bg-white p-3
              font-semibold text-black
              transition hover:bg-slate-200
              disabled:cursor-not-allowed
              disabled:opacity-50
            "

          >

            {loading && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}


            {
              loading
                ? "Signing in..."
                : "Sign In"
            }

          </button>



        </form>



        <p className="
          mt-6 text-center
          text-sm text-slate-400
        ">

          No account yet?{" "}

          <Link

            href="/auth/sign-up"

            className="
              text-white underline
            "

          >
            Create one
          </Link>

        </p>



      </div>

    </main>

  )

}