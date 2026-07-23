"use client"

import { useState } from "react"
import BusinessInfo from "./BusinessInfo"
import BusinessHours from "./BusinessHours"
import Services from "./Services"
import ConnectWhatsApp from "./ConnectWhatsApp"
import Completion from "./Completion"

type StepId =
  | "business_info"
  | "hours"
  | "services"
  | "whatsapp"
  | "finish"

type Step = {
  id: StepId
  label: string
}

export default function OnboardingWizard({
  canManageServices,
}: {
  canManageServices: boolean
}) {
  const steps: Step[] = [
    {
      id: "business_info",
      label: "Business Info",
    },
    {
      id: "hours",
      label: "Hours",
    },
    ...(canManageServices
      ? [
          {
            id: "services" as const,
            label: "Services",
          },
        ]
      : []),
    {
      id: "whatsapp",
      label: "WhatsApp",
    },
    {
      id: "finish",
      label: "Finish",
    },
  ]

  const [step, setStep] = useState(0)

  const currentStep = steps[step]

  function next() {
    setStep((current) =>
      Math.min(
        current + 1,
        steps.length - 1
      )
    )
  }

  function back() {
    setStep((current) =>
      Math.max(current - 1, 0)
    )
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
            Configure your AI receptionist for your business.
          </p>
        </div>


        <div className="mb-8">

          <div className="mb-3 flex justify-between gap-2 text-xs text-slate-400">
            {steps.map(
              (item, index) => (
                <span
                  key={item.id}
                  className={
                    index <= step
                      ? "text-white font-semibold"
                      : ""
                  }
                >
                  {item.label}
                </span>
              )
            )}
          </div>


          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{
                width: `${
                  ((step + 1) /
                    steps.length) *
                  100
                }%`,
              }}
            />
          </div>

        </div>


        {currentStep.id === "business_info" && (
          <BusinessInfo
            onNext={next}
          />
        )}


        {currentStep.id === "hours" && (
          <BusinessHours
            onNext={next}
            onBack={back}
          />
        )}


        {currentStep.id === "services" && (
          <Services
            onNext={next}
            onBack={back}
          />
        )}


        {currentStep.id === "whatsapp" && (
          <ConnectWhatsApp
            onNext={next}
            onBack={back}
          />
        )}


        {currentStep.id === "finish" && (
          <Completion />
        )}

      </div>
    </main>
  )
}