import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { MessageSquare, Users, Bot } from "lucide-react"

export default async function ConversationsPage() {
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })

  const totalConversations = customers?.length || 0
  const totalMessages = messages?.length || 0
  const aiReplies =
    messages?.filter((m) => m.role === "assistant").length || 0

  return (
    <div>
      <PageHeader
        title="Conversations"
        description="View customer conversations handled by Jhyro AI."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatBox title="Conversations" value={totalConversations} icon={<Users size={20} />} />
        <StatBox title="Messages" value={totalMessages} icon={<MessageSquare size={20} />} />
        <StatBox title="AI Replies" value={aiReplies} icon={<Bot size={20} />} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Customer Conversations
        </h2>

        <div className="mt-6 space-y-4">
          {customers && customers.length > 0 ? (
            customers.map((customer) => {
              const latestMessage = messages?.find(
                (msg) => msg.customer_id === customer.id
              )

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

                      <p className="mt-1 text-sm text-slate-400">
                        {customer.phone_number}
                      </p>

                      <p className="mt-3 line-clamp-1 text-sm text-slate-300">
                        {latestMessage?.message || "No messages yet."}
                      </p>
                    </div>

                    <div className="text-sm text-slate-500">
                      {latestMessage?.created_at
                        ? new Date(latestMessage.created_at).toLocaleString()
                        : "No activity"}
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

function StatBox({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}