"use client"

import { useRouter } from "next/navigation"

export default function Completion() {
  const router = useRouter()

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20 text-3xl">
        ✅
      </div>

      <h2 className="mt-6 text-3xl font-bold">
        Jhyro AI is ready
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-400">
        Your business profile, hours, services, WhatsApp setup, and AI personality are ready. You can edit everything later from the dashboard.
      </p>

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-8 rounded-xl bg-white px-8 py-3 font-semibold text-black"
      >
        Go to Dashboard
      </button>
    </section>
  )
}