import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function AIPersonalityPage() {
  return (
    <div>
      <PageHeader
        title="AI Personality"
        description="Control Jhyro AI's tone, style, and behavior."
      />

      <EmptyState
        title="AI personality settings coming soon"
        description="Tone, reply style, and personality controls will appear here."
      />
    </div>
  )
}