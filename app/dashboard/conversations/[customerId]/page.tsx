import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { ArrowLeft, MessageSquare } from "lucide-react"

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single()

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true })

  return (
    <div>
      <Link
        href="/dashboard/conversations"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to conversations
      </Link>

      <PageHeader
        title={customer?.name || "Conversation"}
        description={customer?.phone_number || "Customer chat history"}
      />

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center gap-3">
          <MessageSquare size={20} />
          <h2 className="text-lg font-bold text-white">
            Chat History
          </h2>
        </div>

        <div className="space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const isAI = message.role === "assistant"

              return (
                <div
                  key={message.id}
                  className={`flex ${isAI ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      isAI
                        ? "max-w-2xl rounded-2xl bg-blue-600 p-4 text-white"
                        : "max-w-2xl rounded-2xl bg-slate-800 p-4 text-slate-100"
                    }
                  >
                    <div className="mb-1 text-xs opacity-70">
                      {isAI ? "Jhyro AI" : customer?.name || "Customer"}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.message}
                    </p>

                    <div className="mt-2 text-xs opacity-60">
                      {message.created_at
                        ? new Date(message.created_at).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              No messages for this customer yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}