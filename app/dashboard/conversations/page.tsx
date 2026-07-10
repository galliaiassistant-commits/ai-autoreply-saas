import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  MessageCircle,
  Users,
  Clock,
  Phone,
} from "lucide-react"

export default async function ConversationsPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Conversations"
          description="View customer chats handled by Jhyro AI."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No business found for this account.
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const [
    { data: customers, error: customersError },
    { data: messages, error: messagesError },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, business_id, name, phone_number, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("messages")
      .select("id, business_id, customer_id, role, message, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
  ])

  if (customersError) {
    console.error("CONVERSATIONS CUSTOMERS ERROR:", customersError)
  }

  if (messagesError) {
    console.error("CONVERSATIONS MESSAGES ERROR:", messagesError)
  }

  const safeCustomers = customers || []
  const safeMessages = messages || []

  const conversationCustomers =
    safeCustomers.filter((customer) =>
      safeMessages.some(
        (message) => message.customer_id === customer.id
      )
    )

  const totalMessages = safeMessages.length
  const activeCustomers = conversationCustomers.length
  const latestMessage = safeMessages[0]

  return (
    <div>
      <PageHeader
        title="Conversations"
        description="View customer chats handled by Jhyro AI."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatCard
          title="Conversations"
          value={activeCustomers}
          icon={<Users size={20} />}
        />

        <StatCard
          title="Messages"
          value={totalMessages}
          icon={<MessageCircle size={20} />}
        />

        <StatCard
          title="Latest Activity"
          value={
            latestMessage?.created_at
              ? formatDate(latestMessage.created_at)
              : "None"
          }
          icon={<Clock size={20} />}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Customer Conversations
        </h2>

        <div className="mt-6 space-y-4">
          {conversationCustomers.length > 0 ? (
            conversationCustomers.map((customer) => {
              const customerMessages =
                safeMessages.filter(
                  (message) => message.customer_id === customer.id
                )

              const lastMessage = customerMessages[0]

              return (
                <Link
                  key={customer.id}
                  href={`/dashboard/conversations/${customer.id}`}
                  className="block rounded-2xl bg-slate-800 p-5 transition hover:bg-slate-700"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {customer.name || "Unknown Customer"}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <Phone size={16} />
                        {customer.phone_number || "No phone number"}
                      </div>

                      <p className="mt-3 max-w-2xl truncate text-sm text-slate-400">
                        {lastMessage?.message || "No recent message"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {lastMessage?.created_at
                          ? formatDateTime(lastMessage.created_at)
                          : "No activity yet"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300">
                        {customerMessages.length} messages
                      </span>

                      <span className="rounded-xl bg-white px-5 py-2 font-semibold text-black">
                        Open
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              No conversations yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function formatDate(date?: string | null) {
  if (!date) return "Unknown"

  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/Jamaica",
  })
}

function formatDateTime(date?: string | null) {
  if (!date) return "Unknown"

  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/Jamaica",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}