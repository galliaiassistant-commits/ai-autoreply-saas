import Link from "next/link"
import { getCurrentBusiness } from "@/lib/auth"

export default async function ManualWhatsAppPage() {
  const business = await getCurrentBusiness()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Connect WhatsApp Manually
        </h1>

        <p className="text-gray-500 mt-2">
          Enter your Meta WhatsApp Business API details.
        </p>
      </div>

      <div className="rounded-xl border p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">
            WhatsApp Phone Number ID
          </label>
          <input
            className="w-full border rounded-lg p-3 mt-1"
            placeholder="Phone Number ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            WhatsApp Business Account ID
          </label>
          <input
            className="w-full border rounded-lg p-3 mt-1"
            placeholder="WABA ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Access Token
          </label>
          <input
            className="w-full border rounded-lg p-3 mt-1"
            placeholder="Meta Access Token"
            type="password"
          />
        </div>

        <button
          className="bg-black text-white rounded-lg px-5 py-3"
        >
          Connect WhatsApp
        </button>
      </div>

      <Link
        href="/dashboard/integrations/whatsapp"
        className="text-blue-600"
      >
        ← Back to WhatsApp Integration
      </Link>
    </div>
  )
}