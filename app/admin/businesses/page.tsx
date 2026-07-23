import { ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import BusinessManagement, {
  AdminBusinessRow,
} from "@/components/admin/BusinessManagement"

export const dynamic = "force-dynamic"

type BusinessRecord = {
  id: string
  business_name: string | null
  email: string | null
  subscription_status: string | null
  created_at: string | null
  ai_suspended_at: string | null
}

export default async function AdminBusinessesPage() {
  const [businessesResult, whatsappResult, calendarResult] =
    await Promise.all([
      supabaseAdmin
        .from("businesses")
        .select(
          "id, business_name, email, subscription_status, created_at, ai_suspended_at"
        )
        .order("created_at", { ascending: false })
        .returns<BusinessRecord[]>(),
      supabaseAdmin
        .from("business_integrations")
        .select("business_id, connected")
        .eq("provider", "whatsapp"),
      supabaseAdmin
        .from("google_calendar_connections")
        .select("business_id, connected"),
    ])

  const loadError =
    businessesResult.error ||
    whatsappResult.error ||
    calendarResult.error

  if (loadError) {
    console.error("ADMIN BUSINESSES LOAD ERROR:", loadError)
  }

  const whatsappIds = new Set(
    (whatsappResult.data || [])
      .filter((item) => item.connected === true)
      .map((item) => item.business_id)
  )

  const calendarIds = new Set(
    (calendarResult.data || [])
      .filter((item) => item.connected === true)
      .map((item) => item.business_id)
  )

  const businesses: AdminBusinessRow[] = (
    businessesResult.data || []
  ).map((business) => ({
    id: business.id,
    businessName:
      business.business_name || "Unnamed business",
    email: business.email || "No account email",
    subscriptionStatus:
      business.subscription_status || "inactive",
    createdAt: business.created_at,
    aiSuspended: Boolean(business.ai_suspended_at),
    whatsappConnected: whatsappIds.has(business.id),
    calendarConnected: calendarIds.has(business.id),
  }))

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Back to overview
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Building2 size={23} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">
            Account operations
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Business Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Review safe account details and control AI availability
            without accessing private customer activity.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
          Some account information could not be loaded. Check the
          server logs for details.
        </div>
      )}

      <div className="mt-8">
        <BusinessManagement businesses={businesses} />
      </div>
    </div>
  )
}