import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Customers"
        description="View and manage customer profiles."
      />

      <EmptyState
        title="Customer page coming soon"
        description="Customer profiles, memories, and history will appear here."
      />
    </div>
  )
}