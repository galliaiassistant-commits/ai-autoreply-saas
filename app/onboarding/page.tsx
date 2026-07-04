"use client"

import { useState } from "react"
import BusinessInfo from "./BusinessInfo"
import BusinessHours from "./BusinessHours"
import Services from "./Services"
import ConnectWhatsApp from "./ConnectWhatsApp"
import AIPersonality from "./AIPersonality"
import Completion from "./Completion"

const steps = [
  "Business Info",
  "Hours",
  "Services",
  "WhatsApp",
  "AI Personality",
  "Finish",
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)

  function next() {
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0))
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black">
            J
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Set up Jhyro AI
          </h1>

          <p className="mt-3 text-slate-400">
            Let’s configure your AI receptionist for your business.
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex justify-between text-xs text-slate-400">
            {steps.map((item, index) => (
              <span
                key={item}
                className={index <= step ? "text-white" : ""}
              >
                {item}
              </span>
            ))}
          </div>

          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{
                width: `${((step + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {step === 0 && <BusinessInfo onNext={next} />}
        {step === 1 && <BusinessHours onNext={next} onBack={back} />}
        {step === 2 && <Services onNext={next} onBack={back} />}
        {step === 3 && <ConnectWhatsApp onNext={next} onBack={back} />}
        {step === 4 && <AIPersonality onNext={next} onBack={back} />}
        {step === 5 && <Completion />}
      </div>
    </main>
  )
}