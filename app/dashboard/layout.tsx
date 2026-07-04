"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import AuthGuard from "@/components/auth/AuthGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 text-white">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        <div
          className={`min-h-screen transition-all duration-300 ${
            sidebarOpen ? "md:ml-72" : "md:ml-0"
          }`}
        >
          <Topbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}