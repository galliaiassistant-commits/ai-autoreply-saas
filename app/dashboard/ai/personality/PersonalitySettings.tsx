"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveBusinessPersonality } from "./actions"

type Props = {
  businessId: string
  initialPersonality: string
  initialGoals: string[]
}

export default function PersonalitySettings({
  businessId,
  initialPersonality,
  initialGoals = ["Customer Support"],
}: Props) {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("personality")

  const [tone, setTone] = useState("Friendly")
  const [formality, setFormality] = useState("Balanced")
  const [humor, setHumor] = useState("Light")
  const [emoji, setEmoji] = useState("Light")

  const [goals, setGoals] = useState<string[]>(
    initialGoals.length > 0
      ? initialGoals
      : ["Customer Support"]
  )

  const [greetingStyle, setGreetingStyle] = useState("Warm")
  const [followUps, setFollowUps] =
    useState("Ask when needed")
  const [useName, setUseName] = useState("Sometimes")
  const [upsell, setUpsell] = useState("Softly")

  const [responseLength, setResponseLength] =
    useState("Short")
  const [strictness, setStrictness] =
    useState("Never guess")
  const [proactiveness, setProactiveness] =
    useState("Suggest help")
  const [creativity, setCreativity] = useState("Balanced")

  const [language, setLanguage] = useState("English")
  const [customInstructions, setCustomInstructions] =
    useState(initialPersonality)

  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState("")
  const [testReply, setTestReply] = useState("")
  const [testing, setTesting] = useState(false)

  const generatedPersonality = `
Tone: ${tone}
Formality: ${formality}
Humor: ${humor}
Emoji Usage: ${emoji}
Business Goals: ${goals.join(", ")}
Greeting Style: ${greetingStyle}
Follow-up Questions: ${followUps}
Use Customer Name: ${useName}
Upsell Related Services: ${upsell}
Response Length: ${responseLength}
Strictness: ${strictness}
Proactiveness: ${proactiveness}
Creativity: ${creativity}
Primary Language: ${language}

Custom Instructions:
${customInstructions}
`

  const tabs = [
    { id: "personality", label: "🎭 Personality" },
    { id: "goals", label: "💼 Goals" },
    { id: "conversation", label: "🗣️ Conversation" },
    { id: "intelligence", label: "🧠 Intelligence" },
    { id: "language", label: "🌍 Language" },
    { id: "test", label: "🧪 Test AI" },
  ]

  async function savePersonality() {
    setLoading(true)

    const result = await saveBusinessPersonality({
      personality: generatedPersonality,
      goals,
    })

    setLoading(false)

    if (!result.ok) {
      alert(result.error)
      return
    }

    router.refresh()
    alert("AI personality saved!")
  }

  async function testAI() {
    if (!testMessage.trim()) {
      alert("Please enter a test message.")
      return
    }

    setTesting(true)
    setTestReply("")

    const res = await fetch("/api/test-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: testMessage,
        personality: generatedPersonality,
      }),
    })

    const data = await res.json()
    setTesting(false)

    if (data.error) {
      alert(data.error)
      return
    }

    setTestReply(data.reply)
  }

  function toggleGoal(goal: string) {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal))
    } else {
      setGoals([...goals, goal])
    }
  }

  return (
    <div
      data-business-id={businessId}
      className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
                : "rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-950 p-6">
        {activeTab === "personality" && (
          <div>
            <SectionTitle
              title="Personality"
              description="Control Jhyro AI's tone, style, and overall character."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SelectBox
                label="Tone"
                value={tone}
                onChange={setTone}
                options={[
                  "Friendly",
                  "Professional",
                  "Casual",
                  "Luxury",
                  "Playful",
                ]}
              />

              <SelectBox
                label="Formality"
                value={formality}
                onChange={setFormality}
                options={[
                  "Very casual",
                  "Casual",
                  "Balanced",
                  "Formal",
                  "Very formal",
                ]}
              />

              <SelectBox
                label="Humor"
                value={humor}
                onChange={setHumor}
                options={[
                  "None",
                  "Light",
                  "Balanced",
                  "Playful",
                ]}
              />

              <SelectBox
                label="Emoji Usage"
                value={emoji}
                onChange={setEmoji}
                options={["None", "Light", "Frequent"]}
              />
            </div>
          </div>
        )}

        {activeTab === "goals" && (
          <div>
            <SectionTitle
              title="Business Goals"
              description="Select one or more goals Jhyro AI should prioritize."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Increase Bookings",
                "Increase Sales",
                "Customer Support",
                "Lead Generation",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleGoal(item)}
                  className={
                    goals.includes(item)
                      ? "rounded-2xl border border-white bg-white p-5 text-left text-black"
                      : "rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left text-white hover:bg-slate-800"
                  }
                >
                  <h3 className="font-semibold">{item}</h3>

                  <p
                    className={
                      goals.includes(item)
                        ? "mt-2 text-sm text-slate-700"
                        : "mt-2 text-sm text-slate-400"
                    }
                  >
                    {item === "Increase Bookings" &&
                      "Guide customers toward appointments."}
                    {item === "Increase Sales" &&
                      "Recommend services and encourage purchases."}
                    {item === "Customer Support" &&
                      "Answer questions clearly and reduce manual work."}
                    {item === "Lead Generation" &&
                      "Collect customer interest and contact details."}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "conversation" && (
          <div>
            <SectionTitle
              title="Conversation Style"
              description="Control how Jhyro AI talks during conversations."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SelectBox
                label="Greeting Style"
                value={greetingStyle}
                onChange={setGreetingStyle}
                options={[
                  "Warm",
                  "Professional",
                  "Short",
                  "Energetic",
                ]}
              />

              <SelectBox
                label="Follow-up Questions"
                value={followUps}
                onChange={setFollowUps}
                options={[
                  "Ask when needed",
                  "Ask often",
                  "Ask rarely",
                ]}
              />

              <SelectBox
                label="Use Customer Name"
                value={useName}
                onChange={setUseName}
                options={["Yes", "Sometimes", "No"]}
              />

              <SelectBox
                label="Upsell Related Services"
                value={upsell}
                onChange={setUpsell}
                options={["Yes", "Softly", "No"]}
              />
            </div>
          </div>
        )}

        {activeTab === "intelligence" && (
          <div>
            <SectionTitle
              title="Intelligence"
              description="Control how carefully and proactively Jhyro AI responds."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SelectBox
                label="Response Length"
                value={responseLength}
                onChange={setResponseLength}
                options={["Short", "Medium", "Detailed"]}
              />

              <SelectBox
                label="Strictness"
                value={strictness}
                onChange={setStrictness}
                options={[
                  "Never guess",
                  "Balanced",
                  "Flexible",
                ]}
              />

              <SelectBox
                label="Proactiveness"
                value={proactiveness}
                onChange={setProactiveness}
                options={[
                  "Wait for customer",
                  "Suggest help",
                  "Guide customer",
                ]}
              />

              <SelectBox
                label="Creativity"
                value={creativity}
                onChange={setCreativity}
                options={["Low", "Balanced", "High"]}
              />
            </div>
          </div>
        )}

        {activeTab === "language" && (
          <div>
            <SectionTitle
              title="Language"
              description="Control how Jhyro AI handles languages."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SelectBox
                label="Primary Language"
                value={language}
                onChange={setLanguage}
                options={[
                  "English",
                  "Spanish",
                  "French",
                  "Jamaican Patois",
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === "test" && (
          <div>
            <SectionTitle
              title="Test AI"
              description="Preview how Jhyro AI would respond before going live."
            />

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <label className="mb-2 block text-sm text-slate-400">
                Customer message
              </label>

              <textarea
                value={testMessage}
                onChange={(e) =>
                  setTestMessage(e.target.value)
                }
                placeholder="Example: I want to book an appointment for Sunday."
                className="min-h-32 w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
              />

              <button
                type="button"
                onClick={testAI}
                disabled={testing}
                className="mt-4 rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                {testing ? "Testing..." : "Test Reply"}
              </button>

              <div className="mt-6 rounded-xl bg-slate-800 p-4 text-slate-300">
                {testReply ||
                  "Jhyro AI test reply will appear here."}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-800 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-400">
                Current Personality Prompt
              </p>

              <pre className="whitespace-pre-wrap text-sm text-slate-200">
                {generatedPersonality}
              </pre>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={savePersonality}
        disabled={loading}
        className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Personality"}
      </button>
    </div>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 text-slate-400">
        {description}
      </p>
    </div>
  )
}

function SelectBox({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}