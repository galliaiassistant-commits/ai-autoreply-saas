import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Bot,
  Save,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  CheckCircle2,
} from "lucide-react"

type PageProps = {
  searchParams?: Promise<{
    saved?: string
    error?: string
  }>
}

export default async function AIPersonalityPage({
  searchParams,
}: PageProps) {
  const business = await getCurrentBusiness()
  const params = await searchParams

  if (!business) {
    redirect("/auth/sign-in")
  }

  async function updatePersonality(formData: FormData) {
    "use server"

    const business = await getCurrentBusiness()

    if (!business) {
      redirect("/auth/sign-in")
    }

    const personality = String(
      formData.get("personality") || ""
    ).trim()

    if (!personality) {
      redirect("/dashboard/ai/personality?error=missing")
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        personality,
      })
      .eq("id", business.id)
      .eq("owner_id", business.owner_id)

    if (error) {
      console.error("UPDATE PERSONALITY ERROR:", error)
      redirect("/dashboard/ai/personality?error=save")
    }

    redirect("/dashboard/ai/personality?saved=true")
  }

  const currentPersonality =
    business.personality ||
    `You are Jhyro AI, a friendly and professional business assistant.

Tone:
- Friendly
- Clear
- Helpful
- Confident
- Not robotic

Rules:
- Keep replies short and natural.
- Ask one question at a time.
- Never invent prices, hours, services, or policies.
- If information is missing, politely say it has not been provided yet.
- Help customers book appointments when needed.`

  return (
    <div>
      <PageHeader
        title="AI Personality"
        description="Control how Jhyro AI speaks to customers for this business."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
              <Bot size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Jhyro AI Voice
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Personality settings for{" "}
                <span className="font-semibold text-white">
                  {business.business_name || "this business"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-500/20 p-3 text-green-400">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Security
                </p>

                <p className="font-bold text-green-400">
                  Business Scoped
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {params?.saved && (
        <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-5 text-green-300">
          AI personality saved successfully.
        </div>
      )}

      {params?.error && (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
          {params.error === "missing"
            ? "Please enter a personality prompt."
            : "Could not save the AI personality. Please try again."}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <form
          action={updatePersonality}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <label className="text-sm font-semibold text-slate-300">
            Personality Prompt
          </label>

          <textarea
            name="personality"
            rows={18}
            defaultValue={currentPersonality}
            className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm leading-relaxed text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              This prompt is saved only to the signed-in business.
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
            >
              <Save size={18} />
              Save Personality
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-white">
                Good Personality Rules
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              <Rule text="Keep replies short and natural." />
              <Rule text="Ask one question at a time." />
              <Rule text="Never invent business information." />
              <Rule text="Use customer memory only when useful." />
              <Rule text="Push toward bookings without sounding annoying." />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-white">
                Example Style
              </h2>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-800 p-5">
              <p className="text-sm leading-relaxed text-slate-300">
                “Sure, I can help with that. What service would you like to book?”
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-white p-5">
              <p className="text-sm leading-relaxed text-black">
                “Great, what date and time works best for you?”
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Rule({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-4">
      <CheckCircle2 size={17} className="text-green-400" />

      <p className="text-sm font-semibold text-slate-300">
        {text}
      </p>
    </div>
  )
}