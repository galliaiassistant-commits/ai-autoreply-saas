import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
        <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}