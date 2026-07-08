import Link from "next/link"
import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  ArrowLeft,
  User,
  Phone,
  CalendarDays,
  MessageCircle,
  Bot,
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

type PageProps = {
  params: Promise<{
    id?: string
    customerId?: string
  }>
}

type Customer = {
  id: string
  business_id: string
  name: string | null
  phone_number: string | null
  created_at: string | null
}

type Message = {
  id: string
  business_id: string
  customer_id: string
  role: string | null
  message: string | null
  created_at: string | null
}

type Booking = {
  id: string
  business_id: string
  customer_id: string
  service: string | null
  booking_time: string | null
  status: string | null
  created_at: string | null
}

type Memory = {
  id: string
  customer_id: string
  type: string | null
  content: string | null
  created_at: string | null
}

export default async function CustomerProfilePage({
  params,
}: PageProps) {
  const resolvedParams = await params

  const customerId =
    resolvedParams.id || resolvedParams.customerId

  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <PageWrapper>
        <PageHeader
          title="Customer Profile"
          description="View customer details, bookings, messages, and memory."
        />

        <EmptyState message="No business found for this account." />
      </PageWrapper>
    )
  }

  if (!customerId || customerId === "undefined") {
    return (
      <PageWrapper>
        <PageHeader
          title="Customer Error"
          description="The customer profile link is missing the customer ID."
        />

        <BackButton
          href="/dashboard/customers"
          label="Back to Customers"
        />

        <div className="mt-6">
          <EmptyState message="Customer ID missing from the page URL." />
        </div>
      </PageWrapper>
    )
  }

  const supabase = await createClient()

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, business_id, name, phone_number, created_at")
    .eq("id", customerId)
    .eq("business_id", business.id)
    .maybeSingle<Customer>()

  if (customerError) {
    return (
      <PageWrapper>
        <PageHeader
          title="Customer Error"
          description="Something went wrong while loading this customer."
        />

        <EmptyState message={customerError.message} />
      </PageWrapper>
    )
  }

  if (!customer) {
    return (
      <PageWrapper>
        <PageHeader
          title="Customer Not Found"
          description="This customer does not belong to your business."
        />

        <BackButton
          href="/dashboard/customers"
          label="Back to Customers"
        />
      </PageWrapper>
    )
  }

  const [
    { data: messages },
    { data: bookings },
    { data: memories },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select("id, business_id, customer_id, role, message, created_at")
      .eq("business_id", business.id)
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .returns<Message[]>(),

    supabase
      .from("bookings")
      .select("id, business_id, customer_id, service, booking_time, status, created_at")
      .eq("business_id", business.id)
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .returns<Booking[]>(),

    supabase
      .from("customer_memory")
      .select("id, customer_id, type, content, created_at")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .returns<Memory[]>(),
  ])

  const safeMessages = messages || []
  const safeBookings = bookings || []
  const safeMemories = memories || []

  const bookedCount = safeBookings.filter(
    (booking) => booking.status === "booked"
  ).length

  const completedCount = safeBookings.filter(
    (booking) => booking.status === "completed"
  ).length

  const missingDetailsCount = safeBookings.filter(
    (booking) => booking.status === "missing_details"
  ).length

  const latestMessage = safeMessages[0]

  return (
    <PageWrapper>
      <div className="mb-6">
        <BackButton
          href="/dashboard/customers"
          label="Back to Customers"
        />
      </div>

      <PageHeader
        title={customer.name || "Unknown Customer"}
        description="Customer profile, messages, bookings, and memory."
      />

      <section className="mt-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-800 p-4 text-slate-300">
              <User size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {customer.name || "Unknown Customer"}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Phone size={16} />
                {customer.phone_number || "No phone number"}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/conversations/${customer.id}`}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200"
          >
            Open Conversation
            <MessageCircle size={18} />
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Messages"
          value={safeMessages.length}
          icon={<MessageCircle size={20} />}
        />

        <StatCard
          title="Bookings"
          value={safeBookings.length}
          icon={<CalendarDays size={20} />}
        />

        <StatCard
          title="Booked"
          value={bookedCount}
          icon={<CheckCircle2 size={20} />}
        />

        <StatCard
          title="Memory"
          value={safeMemories.length}
          icon={<Brain size={20} />}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <SectionTitle
            title="Recent Messages"
            description="Latest messages between the customer and Jhyro AI."
          />

          <div className="mt-6 space-y-4">
            {safeMessages.length > 0 ? (
              safeMessages.slice(0, 10).map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                />
              ))
            ) : (
              <EmptyState message="No messages yet." />
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Customer Info
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Name"
                value={customer.name || "Unknown"}
                icon={<User size={16} />}
              />

              <InfoRow
                label="Phone"
                value={customer.phone_number || "No phone number"}
                icon={<Phone size={16} />}
              />

              <InfoRow
                label="Joined"
                value={formatDate(customer.created_at)}
                icon={<CalendarDays size={16} />}
              />

              <InfoRow
                label="Last Message"
                value={formatDateTime(latestMessage?.created_at)}
                icon={<Clock size={16} />}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Booking Status
            </h2>

            <div className="mt-5 space-y-3">
              <StatusRow
                label="Booked"
                value={bookedCount}
              />

              <StatusRow
                label="Completed"
                value={completedCount}
              />

              <StatusRow
                label="Missing Details"
                value={missingDetailsCount}
                warning
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Customer Memory
            </h2>

            <div className="mt-5 space-y-3">
              {safeMemories.length > 0 ? (
                safeMemories.slice(0, 5).map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No saved memory yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <SectionTitle
          title="Booking History"
          description="All bookings connected to this customer."
        />

        <div className="mt-6 space-y-4">
          {safeBookings.length > 0 ? (
            safeBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))
          ) : (
            <EmptyState message="No bookings for this customer yet." />
          )}
        </div>
      </section>
    </PageWrapper>
  )
}

function PageWrapper({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

function BackButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {description}
      </p>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
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
  icon: ReactNode
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-all text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  )
}

function MessageCard({ message }: { message: Message }) {
  const isAI = message.role === "assistant"

  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            {isAI ? <Bot size={16} /> : <User size={16} />}
            {isAI ? "Jhyro AI" : "Customer"}
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white">
            {message.message || "Empty message"}
          </p>
        </div>

        <p className="text-xs text-slate-500">
          {formatDateTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-white">
            {booking.service || "Service not provided"}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {formatDateTime(booking.booking_time)}
          </p>
        </div>

        <StatusPill status={booking.status || "missing_details"} />
      </div>
    </div>
  )
}

function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {memory.type || "Memory"}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {memory.content || "No content"}
      </p>
    </div>
  )
}

function StatusRow({
  label,
  value,
  warning,
}: {
  label: string
  value: number
  warning?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
      <div className="flex items-center gap-2">
        {warning ? (
          <AlertCircle size={17} className="text-yellow-400" />
        ) : (
          <CheckCircle2 size={17} className="text-green-400" />
        )}

        <p className="text-sm font-semibold text-slate-300">
          {label}
        </p>
      </div>

      <span className="font-bold text-white">
        {value}
      </span>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    booked: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
    missing_details: "bg-yellow-500/20 text-yellow-400",
  }

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-950 text-slate-300"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
      {message}
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