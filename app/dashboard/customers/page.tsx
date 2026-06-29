import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DataTable } from "@/components/dashboard/DataTable"

export default async function CustomersPage() {
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <PageHeader
        title="Customers"
        description="View and manage customer profiles."
      />

      <DataTable title="Customers">
        <thead>
          <tr className="text-slate-400">
            <th>Name</th>
            <th>Phone</th>
            <th>Created</th>
            <th>Profile</th>
          </tr>
        </thead>

        <tbody>
          {customers?.map((customer) => (
            <tr
              key={customer.id}
              className="border-t border-slate-800"
            >
              <td className="py-3">
                {customer.name || "Unknown"}
              </td>

              <td>{customer.phone_number}</td>

              <td>
                {new Date(customer.created_at).toLocaleDateString()}
              </td>

              <td>
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}