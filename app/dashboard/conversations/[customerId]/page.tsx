import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"

export default async function ConversationDetailPage({
  params,
}: {
  params: { customerId: string }
}) {
  const { customerId } = params

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
      <PageHeader
        title={customer?.name || "Conversation"}
        description={customer?.phone_number || "Customer chat history"}
      />

      <div className="mt-6 space-y-4">
        {messages?.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "assistant"
                ? "ml-auto max-w-xl rounded-xl bg-blue-600 p-4 text-white"
                : "max-w-xl rounded-xl bg-slate-800 p-4 text-slate-100"
            }
          >
            <div className="mb-1 text-xs opacity-70">
              {message.role === "assistant" ? "Jhyro AI" : "Customer"}
            </div>

            <p className="text-sm">{message.message}</p>

            <div className="mt-2 text-xs opacity-60">
              {message.created_at
                ? new Date(message.created_at).toLocaleString()
                : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}