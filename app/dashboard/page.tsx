"use client"

import { useUser } from "@clerk/nextjs"

export default function DashboardPage() {
  const { user } = useUser()

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">
        Dashboard
      </h1>

      <p className="text-gray-600 mb-6">
        Welcome to your AI dashboard.
      </p>

      {user ? (
        <div className="p-4 border rounded-lg">
          <p>
            Signed in as: {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      ) : (
        <div className="p-4 border rounded-lg">
          <p>You are browsing as a guest.</p>
        </div>
      )}
    </div>
  )
}