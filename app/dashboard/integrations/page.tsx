import { PageHeader } from "@/components/dashboard/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect WhatsApp, Instagram, Messenger, calendars, and more."
      />

      <EmptyState
        title="Integrations coming soon"
        description="Connected apps and channels will appear here."
      />
    </div>
  )
}