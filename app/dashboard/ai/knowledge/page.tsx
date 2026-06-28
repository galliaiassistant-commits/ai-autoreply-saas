import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function AIKnowledgePage() {
  return (
    <div>
      <PageHeader
        title="AI Knowledge"
        description="Manage what Jhyro AI knows about the business."
      />

      <EmptyState
        title="Knowledge manager coming soon"
        description="Business FAQs, policies, prices, and service details will appear here."
      />
    </div>
  )
}