import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import PersonalitySettings from "./PersonalitySettings"

export default async function AIPersonalityPage() {
  const { data: business } = await supabase
    .from("businesses")
    .select("id, personality, ai_goals")
    .limit(1)
    .maybeSingle()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="AI Personality"
          description="Control Jhyro AI's tone, behavior, and conversation style."
        />

        <div className="mt-6 rounded-2xl border border-red-800 bg-red-950 p-6 text-white">
          No business found.
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="AI Personality"
        description="Control Jhyro AI's tone, behavior, and conversation style."
      />

      <PersonalitySettings
  businessId={business.id}
  initialPersonality={
    business.personality ||
    "Friendly, professional and helpful."
  }
  initialGoals={business.ai_goals || ["Customer Support"]}
/>
    </div>
  )
}