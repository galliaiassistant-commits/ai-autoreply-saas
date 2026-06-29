import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function ConversationsPage() {
  return (
    <div>
      <PageHeader
        title="Conversations"
        description="Manage customer messages and AI conversations."
      />

      <EmptyState
        title="No conversations yet"
        description="Customer conversations will appear here."
      />
    </div>
  )
}