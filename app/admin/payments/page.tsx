import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import PaymentManagement, {
  AdminPaymentRow,
} from "@/components/admin/PaymentManagement"

export const dynamic = "force-dynamic"

type PaymentRecord = {
  id: string
  business_id: string
  provider: string | null
  status: string | null
  amount: number | string | null
  currency: string | null
  paypal_event_id: string | null
  paypal_transaction_id: string | null
  paypal_subscription_id: string | null
  event_type: string | null
  paid_at: string | null
  failed_at: string | null
  created_at: string | null
}

type BusinessRecord = {
  id: string
  business_name: string | null
  email: string | null
  subscription_plan: string | null
}

export default async function AdminPaymentsPage() {
  const [paymentsResult, businessesResult] = await Promise.all([
    supabaseAdmin
      .from("payments")
      .select(
        "id, business_id, provider, status, amount, currency, paypal_event_id, paypal_transaction_id, paypal_subscription_id, event_type, paid_at, failed_at, created_at"
      )
      .order("created_at", { ascending: false })
      .returns<PaymentRecord[]>(),
    supabaseAdmin
      .from("businesses")
      .select("id, business_name, email, subscription_plan")
      .returns<BusinessRecord[]>(),
  ])

  const loadError =
    paymentsResult.error || businessesResult.error

  if (loadError) {
    console.error("ADMIN PAYMENTS LOAD ERROR:", loadError)
  }

  const businessesById = new Map(
    (businessesResult.data || []).map((business) => [
      business.id,
      business,
    ])
  )

  const payments: AdminPaymentRow[] = (
    paymentsResult.data || []
  ).map((payment) => {
    const business = businessesById.get(payment.business_id)
    const numericAmount =
      payment.amount === null ? null : Number(payment.amount)

    return {
      id: payment.id,
      businessId: payment.business_id,
      businessName:
        business?.business_name || "Unknown business",
      businessEmail: business?.email || "No account email",
      subscriptionPlan:
        business?.subscription_plan || "inactive",
      status: payment.status || "unknown",
      amount:
        numericAmount !== null && Number.isFinite(numericAmount)
          ? numericAmount
          : null,
      currency: payment.currency || "USD",
      provider: payment.provider || "paypal",
      paypalTransactionId: payment.paypal_transaction_id,
      paypalSubscriptionId: payment.paypal_subscription_id,
      eventType: payment.event_type,
      paidAt: payment.paid_at,
      failedAt: payment.failed_at,
      createdAt: payment.created_at,
    }
  })

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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
          <CreditCard size={23} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
            Financial operations
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Payments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Review verified PayPal payment activity and find
            transactions by business, transaction ID, or subscription.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
          Some payment information could not be loaded. Check the
          server logs for details.
        </div>
      )}

      <div className="mt-8">
        <PaymentManagement payments={payments} />
      </div>
    </div>
  )
}