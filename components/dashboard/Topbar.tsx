"use client"

import { Bell, Search, Plus } from "lucide-react"

export function Topbar() {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950 px-6 flex items-center justify-between">
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          placeholder="Search customers, bookings..."
          className="w-full rounded-xl bg-gray-900 border border-gray-800 pl-10 pr-4 py-2 outline-none focus:border-white"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
  type="button"
  className="rounded-xl border border-gray-800 bg-gray-900 p-2 hover:bg-gray-800"
>
          <Bell size={20} />
        </button>

        <button
  type="button"
  className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 font-semibold hover:bg-gray-200"
>
          <Plus size={18} />
          New
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center font-bold">
            S
          </div>

          <div>
            <p className="text-sm font-semibold">Sanjay</p>
            <p className="text-xs text-gray-400">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}