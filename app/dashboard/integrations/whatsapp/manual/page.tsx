import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import ManualWhatsAppSetup from "./ManualWhatsAppSetup"

export default function ManualWhatsAppPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/integrations/whatsapp"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to WhatsApp
        </Link>
      </div>

      <PageHeader
        title="Manual WhatsApp Setup"
        description="Connect a WhatsApp Business account using Meta credentials."
      />

      <div className="mt-8">
        <ManualWhatsAppSetup />
      </div>
    </div>
  )
}