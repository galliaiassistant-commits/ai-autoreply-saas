import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function BookingsPage() {
  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and manage customer appointments."
      />

      <EmptyState
        title="Bookings page coming soon"
        description="Appointment calendar and booking management will appear here."
      />
    </div>
  )
}