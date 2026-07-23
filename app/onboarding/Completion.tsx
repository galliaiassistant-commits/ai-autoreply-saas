"use client"

import {
  useEffect,
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react"

type SelectedPlan =
  | "starter"
  | "pro"
  | "business"

const planNames:
  Record<
    SelectedPlan,
    string
  > = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
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

export default function Completion() {
  const router = useRouter()

  const [
    selectedPlan,
    setSelectedPlan,
  ] =
    useState<SelectedPlan>(
      "starter"
    )

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        window.location.search
      )

    const urlPlan =
      searchParams.get("plan")

    const savedPlan =
      window.localStorage
        .getItem(
          "jhyro_selected_plan"
        )

    const safePlan =
      isSelectedPlan(urlPlan)
        ? urlPlan
        : isSelectedPlan(
              savedPlan
            )
          ? savedPlan
          : "starter"

    setSelectedPlan(safePlan)

    window.localStorage.setItem(
      "jhyro_selected_plan",
      safePlan
    )
  }, [])

  function choosePlan() {
    router.push(
      `/dashboard/billing?onboarding=complete&plan=${selectedPlan}`
    )
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20 text-green-400">
        <CheckCircle2
          size={32}
        />
      </div>

      <h2 className="mt-6 text-3xl font-bold text-white">
        Jhyro AI is ready
      </h2>

      <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-400">
        Your business profile,
        operating hours, WhatsApp
        settings, and AI
        personality have been
        prepared.
      </p>

      <div className="mx-auto mt-6 w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
        Selected plan:{" "}
        {planNames[selectedPlan]}
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <CreditCard
            size={22}
            className="text-cyan-400"
          />

          <h3 className="mt-3 font-bold text-white">
            Confirm your plan
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Review the selected
            features and begin the
            free trial configured
            through PayPal.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <ShieldCheck
            size={22}
            className="text-green-400"
          />

          <h3 className="mt-3 font-bold text-white">
            Secure activation
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Paid features activate
            only after PayPal
            confirms the selected
            subscription.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={choosePlan}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-black transition hover:bg-slate-200"
      >
        Continue with{" "}
        {planNames[selectedPlan]}

        <ArrowRight
          size={18}
        />
      </button>

      <p className="mt-4 text-xs text-slate-500">
        You can review or choose
        another plan before
        approving PayPal billing.
      </p>
    </section>
  )
}