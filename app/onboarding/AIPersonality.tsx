"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

const goals = [
  "Customer Support",
  "Lead Collection",
  "Booking Appointments",
  "Sales Assistance",
]

const actions = [
  "Answer FAQs",
  "Provide Pricing",
  "Provide Business Information",
  "Help With Bookings",
]

export default function AIPersonality({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [tone, setTone] = useState("Friendly")
  const [length, setLength] = useState("Short")
  const [salesStyle, setSalesStyle] = useState("Balanced")

  const [goal, setGoal] = useState("")
  const [selectedActions, setSelectedActions] =
    useState<string[]>([])

  const [language, setLanguage] =
    useState("English")

  const [error, setError] =
    useState("")

  const [loading, setLoading] =
    useState(false)


  function toggleAction(action: string) {
    setSelectedActions((current) =>
      current.includes(action)
        ? current.filter(
            (item) => item !== action
          )
        : [
            ...current,
            action,
          ]
    )
  }


  async function save() {
    setError("")

    if (!goal) {
      setError(
        "Please select an AI goal before continuing."
      )
      return
    }

    if (selectedActions.length === 0) {
      setError(
        "Please select at least one AI action."
      )
      return
    }


    setLoading(true)


    const { data: userData } =
      await supabase.auth.getUser()

    const user =
      userData.user


    if (!user) {
      setLoading(false)
      setError(
        "You must be signed in."
      )
      return
    }


    const personality = `
Tone: ${tone}
Response Length: ${length}
Sales Style: ${salesStyle}

Instructions:
Be helpful, accurate, professional, and focused on helping customers book appointments or get business information.
`


    const { error } =
      await supabase
        .from("businesses")
        .update({
          personality,
          language,
          ai_goals: [
            goal,
          ],
          ai_actions: {
            faq:
              selectedActions.includes(
                "Answer FAQs"
              ),

            pricing:
              selectedActions.includes(
                "Provide Pricing"
              ),

            businessQuestions:
              selectedActions.includes(
                "Provide Business Information"
              ),

            bookings:
              selectedActions.includes(
                "Help With Bookings"
              ),
          },
        })
        .eq(
          "owner_id",
          user.id
        )


    setLoading(false)


    if (error) {
      setError(error.message)
      return
    }


    onNext()
  }


  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

      <h2 className="text-2xl font-bold text-white">
        AI Personality
      </h2>

      <p className="mt-2 text-slate-400">
        Configure how Jhyro AI communicates with customers.
      </p>


      {error && (
        <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}


      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <Select
          label="Tone"
          value={tone}
          setValue={setTone}
          options={[
            "Friendly",
            "Professional",
            "Luxury",
            "Casual",
          ]}
        />


        <Select
          label="Reply Length"
          value={length}
          setValue={setLength}
          options={[
            "Short",
            "Medium",
            "Detailed",
          ]}
        />


        <Select
          label="Sales Style"
          value={salesStyle}
          setValue={setSalesStyle}
          options={[
            "Soft",
            "Balanced",
            "Direct",
          ]}
        />

      </div>


      <div className="mt-8">

        <label className="text-sm text-slate-400">
          Main AI Goal *
        </label>

        <select
          value={goal}
          onChange={(e)=>
            setGoal(
              e.target.value
            )
          }
          className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
        >

          <option value="">
            Select goal
          </option>

          {goals.map((item)=>(
            <option key={item}>
              {item}
            </option>
          ))}

        </select>

      </div>


      <div className="mt-8">

        <p className="text-sm text-slate-400">
          AI Actions * (select at least one)
        </p>


        <div className="mt-3 grid gap-3 md:grid-cols-2">

          {actions.map((action)=>(

            <label
              key={action}
              className="flex items-center gap-3 rounded-xl bg-slate-800 p-4 text-white"
            >

              <input
                type="checkbox"
                checked={
                  selectedActions.includes(action)
                }
                onChange={() =>
                  toggleAction(action)
                }
              />

              {action}

            </label>

          ))}

        </div>

      </div>


      <div className="mt-8">

        <label className="text-sm text-slate-400">
          Language
        </label>

        <select
          value={language}
          onChange={(e)=>
            setLanguage(
              e.target.value
            )
          }
          className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
        >

          <option>
            English
          </option>

          <option>
            Spanish
          </option>

        </select>

      </div>


      <div className="mt-8 flex justify-between">

        <button
          onClick={onBack}
          disabled={loading}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>


        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Continue"}
        </button>

      </div>

    </section>
  )
}


function Select({
  label,
  value,
  setValue,
  options,
}: {
  label:string
  value:string
  setValue:(value:string)=>void
  options:string[]
}) {

  return (
    <label>

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(e)=>
          setValue(
            e.target.value
          )
        }
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white"
      >

        {options.map((option)=>(
          <option key={option}>
            {option}
          </option>
        ))}

      </select>

    </label>
  )
}