import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage plans, subscriptions, and invoices."
      />

      <EmptyState
        title="Billing coming soon"
        description="Stripe plans and payment settings will appear here."
      />
    </div>
  )
}