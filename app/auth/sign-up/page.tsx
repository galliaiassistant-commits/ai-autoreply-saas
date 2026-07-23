"use client"

import {
  useEffect,
  useState,
} from "react"
import Link from "next/link"
import {
  useRouter,
} from "next/navigation"
import {
  CheckCircle2,
} from "lucide-react"
import {
  supabase,
} from "@/lib/supabase"

type SelectedPlan =
  | "starter"
  | "pro"
  | "business"

const planDetails: Record<
  SelectedPlan,
  {
    name: string
    price: string
  }
> = {
  starter: {
    name: "Starter",
    price: "$29.00/month",
  },

  pro: {
    name: "Pro",
    price: "$49.99/month",
  },

  business: {
    name: "Business",
    price: "$99.99/month",
  },
}

function isSelectedPlan(
  value: string | null
): value is SelectedPlan {
  return (
    value === "starter" ||
    value === "pro" ||
    value === "business"
  )
}

export default function SignUpPage() {
  const router = useRouter()

  const [
    selectedPlan,
    setSelectedPlan,
  ] =
    useState<SelectedPlan>(
      "starter"
    )

  const [
    mode,
    setMode,
  ] =
    useState<
      "email" | "phone"
    >("email")

  const [
    businessName,
    setBusinessName,
  ] = useState("")

  const [
    email,
    setEmail,
  ] = useState("")

  const [
    phone,
    setPhone,
  ] = useState("")

  const [
    password,
    setPassword,
  ] = useState("")

  const [
    otp,
    setOtp,
  ] = useState("")

  const [
    otpSent,
    setOtpSent,
  ] = useState(false)

  const [
    acceptedLegal,
    setAcceptedLegal,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(false)

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        window.location.search
      )

    const requestedPlan =
      searchParams.get("plan")

    const safePlan =
      isSelectedPlan(
        requestedPlan
      )
        ? requestedPlan
        : "starter"

    setSelectedPlan(safePlan)

    window.localStorage.setItem(
      "jhyro_selected_plan",
      safePlan
    )
  }, [])

  const onboardingPath =
    `/onboarding?plan=${selectedPlan}`

  function hasAcceptedLegal() {
    if (acceptedLegal) {
      return true
    }

    alert(
      "Please agree to the Terms of Service and Privacy Policy before creating your account."
    )

    return false
  }

  async function createBusiness(
    userId: string
  ) {
    const { error } =
      await supabase
        .from("businesses")
        .insert({
          business_name:
            businessName,
          owner_id: userId,
          phone:
            phone || null,
          email:
            email || null,
        })

    if (error) {
      alert(error.message)
      return false
    }

    return true
  }

  async function signUpWithEmail(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (
      !hasAcceptedLegal()
    ) {
      return
    }

    setLoading(true)

    window.localStorage.setItem(
      "jhyro_selected_plan",
      selectedPlan
    )

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    const userId =
      data.user?.id

    if (userId) {
      const created =
        await createBusiness(
          userId
        )

      if (!created) {
        setLoading(false)
        return
      }
    }

    setLoading(false)

    router.push(
      onboardingPath
    )
  }

  async function signUpWithGoogle() {
    if (
      !hasAcceptedLegal()
    ) {
      return
    }

    setLoading(true)

    window.localStorage.setItem(
      "jhyro_selected_plan",
      selectedPlan
    )

    const callbackUrl =
      new URL(
        "/auth/callback",
        window.location.origin
      )

    callbackUrl.searchParams.set(
      "next",
      onboardingPath
    )

    const { error } =
      await supabase.auth
        .signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              callbackUrl.toString(),
          },
        })

    if (error) {
      setLoading(false)
      alert(error.message)
    }
  }

  async function sendPhoneOtp(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (
      !hasAcceptedLegal()
    ) {
      return
    }

    if (!phone) {
      alert(
        "Enter your phone number."
      )
      return
    }

    setLoading(true)

    window.localStorage.setItem(
      "jhyro_selected_plan",
      selectedPlan
    )

    const { error } =
      await supabase.auth
        .signInWithOtp({
          phone,
        })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setOtpSent(true)

    alert(
      "Verification code sent."
    )
  }

  async function verifyPhoneOtp(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (
      !hasAcceptedLegal()
    ) {
      return
    }

    if (!otp) {
      alert(
        "Enter the verification code."
      )
      return
    }

    setLoading(true)

    const { data, error } =
      await supabase.auth
        .verifyOtp({
          phone,
          token: otp,
          type: "sms",
        })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    const userId =
      data.user?.id

    if (userId) {
      const created =
        await createBusiness(
          userId
        )

      if (!created) {
        setLoading(false)
        return
      }
    }

    setLoading(false)

    router.push(
      onboardingPath
    )
  }

  const currentPlan =
    planDetails[selectedPlan]

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 text-2xl font-black text-slate-950"
          >
            J
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-slate-400">
            Start setting up
            Jhyro AI for your
            business.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                Selected plan
              </p>

              <p className="mt-2 text-lg font-black text-white">
                {currentPlan.name}
              </p>

              <p className="mt-1 text-sm text-cyan-200/70">
                {
                  currentPlan.price
                }{" "}
                after the free
                first month
              </p>
            </div>

            <CheckCircle2
              size={22}
              className="mt-1 text-cyan-400"
            />
          </div>

          <Link
            href="/#pricing"
            className="mt-3 inline-flex text-xs font-semibold text-cyan-300 underline"
          >
            Change plan
          </Link>
        </div>

        <button
          type="button"
          onClick={
            signUpWithGoogle
          }
          disabled={
            loading ||
            !acceptedLegal
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
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

        <div className="mb-5 flex rounded-xl bg-slate-800 p-1">
          <button
            type="button"
            onClick={() =>
              setMode("email")
            }
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
            onClick={() =>
              setMode("phone")
            }
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
          <form
            onSubmit={
              signUpWithEmail
            }
          >
            <input
              value={
                businessName
              }
              onChange={(e) =>
                setBusinessName(
                  e.target.value
                )
              }
              required
              placeholder="Business name"
              className="w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <input
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
              type="email"
              placeholder="Email"
              className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <input
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
              type="password"
              minLength={8}
              placeholder="Password"
              className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <button
              disabled={
                loading ||
                !acceptedLegal
              }
              className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>
          </form>
        )}

        {mode === "phone" && (
          <form
            onSubmit={
              otpSent
                ? verifyPhoneOtp
                : sendPhoneOtp
            }
          >
            <input
              value={
                businessName
              }
              onChange={(e) =>
                setBusinessName(
                  e.target.value
                )
              }
              required
              placeholder="Business name"
              className="w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              required
              type="tel"
              placeholder="+18761234567"
              className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
            />

            {otpSent && (
              <input
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                  )
                }
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Verification code"
                className="mt-4 w-full rounded-xl bg-slate-800 p-3 outline-none"
              />
            )}

            <button
              disabled={
                loading ||
                !acceptedLegal
              }
              className="mt-6 w-full rounded-xl bg-white p-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : otpSent
                  ? "Verify Code"
                  : "Send Code"}
            </button>
          </form>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <input
            type="checkbox"
            checked={
              acceptedLegal
            }
            onChange={(e) =>
              setAcceptedLegal(
                e.target.checked
              )
            }
            className="mt-1 h-4 w-4 shrink-0 accent-white"
          />

          <span className="text-sm leading-relaxed text-slate-400">
            I am at least 18
            years old and agree
            to Jhyro AI&apos;s{" "}

            <Link
              href="/terms"
              target="_blank"
              className="font-semibold text-white underline"
            >
              Terms of Service
            </Link>{" "}

            and acknowledge the{" "}

            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-white underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an
          account?{" "}

          <Link
            href="/auth/sign-in"
            className="text-white underline"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-4 border-t border-slate-800 pt-5 text-xs text-slate-500">
          <Link
            href="/privacy"
            className="hover:text-slate-300"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="hover:text-slate-300"
          >
            Terms
          </Link>

          <Link
            href="/data-deletion"
            className="hover:text-slate-300"
          >
            Data Deletion
          </Link>
        </div>
      </div>
    </main>
  )
}