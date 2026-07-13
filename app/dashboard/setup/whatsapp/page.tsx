import { redirect } from "next/navigation"

export default function OldSetupWhatsAppPage() {
  redirect("/dashboard/integrations/whatsapp/manual")
}
