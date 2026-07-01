import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import {
  Users,
  UserCheck,
  Phone,
  CalendarDays,
} from "lucide-react"

export default async function CustomersPage() {
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  const totalCustomers = customers?.length || 0
  const namedCustomers =
    customers?.filter((c) => c.name).length || 0
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
          {customers && customers.length > 0 ? (
            customers.map((customer) => (
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
                      {customer.phone_number}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays size={16} />
                      Joined{" "}
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>

                  <button className="rounded-xl bg-white px-5 py-2 font-semibold text-black">
                    View Profile
                  </button>
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

        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}