import Link from "next/link"
import type { ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  ArrowLeft,
  Bot,
  User,
  Phone,
  MessageCircle,
  CalendarDays,
  Brain,
} from "lucide-react"

type PageProps = {
  params: Promise<{
    customerId: string
  }>
}

export default async function ConversationDetailPage({
  params,
}: PageProps) {
  const { customerId } = await params
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <PageShell>
        <PageHeader
          title="Conversation"
          description="View customer messages handled by Jhyro AI."
        />

        <EmptyPanel message="No business found for this account." />
      </PageShell>
    )
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .maybeSingle()

  if (!customer) {
    return (
      <PageShell>
        <PageHeader
          title="Conversation Not Found"
          description="This customer does not belong to your business."
        />

        <Link
          href="/dashboard/conversations"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
        >
          <ArrowLeft size={18} />
          Back to Conversations
        </Link>
      </PageShell>
    )
  }

  const [{ data: messages }, { data: bookings }, { data: memories }] =
    await Promise.all([
      supabase
        .from("messages")
        .select("*")
        .eq("business_id", business.id)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: true }),

      supabase
        .from("bookings")
        .select("*")
        .eq("business_id", business.id)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("customer_memory")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false }),
    ])

  const safeMessages = messages || []
  const safeBookings = bookings || []
  const safeMemories = memories || []

  const totalMessages = safeMessages.length
  const customerMessages = safeMessages.filter(
    (message) => message.role === "user"
  ).length
  const aiMessages = safeMessages.filter(
    (message) => message.role === "assistant"
  ).length

  return (
    <PageShell>
      <div className="mb-6">
        <Link
          href="/dashboard/conversations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to conversations
        </Link>
      </div>

      <PageHeader
        title={customer.name || "Unknown Customer"}
        description="View this customer’s full conversation, bookings, and memory."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatCard
          title="Messages"
          value={totalMessages}
          icon={<MessageCircle size={20} />}
        />

        <StatCard
          title="Customer Messages"
          value={customerMessages}
          icon={<User size={20} />}
        />

        <StatCard
          title="AI Replies"
          value={aiMessages}
          icon={<Bot size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Chat History
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Messages are filtered by your business and this customer.
              </p>
            </div>

            <div className="w-fit rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300">
              {totalMessages} messages
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {safeMessages.length > 0 ? (
              safeMessages.map((message) => (
                <ChatBubble
                  key={message.id}
                  role={message.role}
                  message={message.message}
                  createdAt={message.created_at}
                />
              ))
            ) : (
              <EmptyPanel message="No messages found for this customer." />
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <ProfilePanel customer={customer} />

          <BookingsPanel bookings={safeBookings} />

          <MemoryPanel memories={safeMemories} />
        </aside>
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

function ChatBubble({
  role,
  message,
  createdAt,
}: {
  role: string
  message?: string | null
  createdAt?: string | null
}) {
  const isAI = role === "assistant"

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-2xl rounded-2xl p-4 ${
          isAI
            ? "bg-slate-800 text-slate-100"
            : "bg-white text-black"
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold opacity-70">
          {isAI ? <Bot size={14} /> : <User size={14} />}
          {isAI ? "Jhyro AI" : "Customer"}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message || "Empty message"}
        </p>

        <p className="mt-3 text-xs opacity-60">
          {createdAt
            ? new Date(createdAt).toLocaleString()
            : "Unknown time"}
        </p>
      </div>
    </div>
  )
}

function ProfilePanel({ customer }: { customer: any }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-bold text-white">
        Customer Profile
      </h2>

      <div className="mt-5 space-y-4">
        <InfoRow label="Name" value={customer.name || "Unknown"} />

        <InfoRow
          label="Phone"
          value={customer.phone_number || "No phone number"}
          icon={<Phone size={16} />}
        />

        <InfoRow
          label="Joined"
          value={
            customer.created_at
              ? new Date(customer.created_at).toLocaleDateString()
              : "Unknown"
          }
        />
      </div>
    </section>
  )
}

function BookingsPanel({ bookings }: { bookings: any[] }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-2">
        <CalendarDays size={18} className="text-slate-400" />

        <h2 className="text-lg font-bold text-white">
          Bookings
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {bookings.length > 0 ? (
          bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl bg-slate-800 p-4"
            >
              <p className="font-semibold text-white">
                {booking.service || "Service not provided"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {booking.booking_time
                  ? new Date(booking.booking_time).toLocaleString()
                  : "Missing date/time"}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
                {booking.status || "missing_details"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            No bookings yet.
          </p>
        )}
      </div>
    </section>
  )
}

function MemoryPanel({ memories }: { memories: any[] }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-2">
        <Brain size={18} className="text-slate-400" />

        <h2 className="text-lg font-bold text-white">
          Customer Memory
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {memories.length > 0 ? (
          memories.slice(0, 5).map((memory) => (
            <div
              key={memory.id}
              className="rounded-xl bg-slate-800 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {memory.type || "Memory"}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {memory.content || "No content"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            No saved memory yet.
          </p>
        )}
      </div>
    </section>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: ReactNode
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

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
        {icon}
        {value}
      </div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
      {message}
    </div>
  )
}