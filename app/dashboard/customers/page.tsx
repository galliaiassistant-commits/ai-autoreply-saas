import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getCurrentBusiness } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Users,
  UserCheck,
  Phone,
  CalendarDays,
} from "lucide-react"

export default async function CustomersPage() {
  const business = await getCurrentBusiness()

  if (!business) {
    return (
      <div>
        <PageHeader
          title="Customers"
          description="Manage your customers and view their profiles."
        />

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          No business found for this account.
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, business_id, name, phone_number, created_at, updated_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("CUSTOMERS PAGE ERROR:", error)
  }

  const safeCustomers =
    customers?.filter((customer) => Boolean(customer.id)) || []

  const totalCustomers = safeCustomers.length

  const namedCustomers =
    safeCustomers.filter((customer) => customer.name).length

  const unnamedCustomers =
    totalCustomers - namedCustomers

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customers and view their profiles."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={<Users size={20} />}
        />

        <StatCard
          title="Named Customers"
          value={namedCustomers}
          icon={<UserCheck size={20} />}
        />

        <StatCard
          title="Unknown Names"
          value={unnamedCustomers}
          icon={<Phone size={20} />}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Customer Directory
        </h2>

        <div className="mt-6 space-y-4">
          {safeCustomers.length > 0 ? (
            safeCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
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

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays size={16} />
                      Joined{" "}
                      {customer.created_at
                        ? new Date(
                            customer.created_at
                          ).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>

                  <span className="rounded-xl bg-white px-5 py-2 font-semibold text-black">
                    View Profile
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              No customers yet.
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
  value: number
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