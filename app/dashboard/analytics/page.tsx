import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track messages, bookings, customers, and AI performance."
      />

      <EmptyState
        title="Analytics coming soon"
        description="Charts and performance reports will appear here."
      />
    </div>
  )
}