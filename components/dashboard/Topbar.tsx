"use client"

type TopbarProps = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Topbar({
  sidebarOpen,
  setSidebarOpen,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
        >
          ☰
        </button>

        <div className="hidden flex-1 md:block">
          <input
            placeholder="Search customers, bookings, conversations..."
            className="w-full max-w-xl rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-sm hover:bg-gray-800">
            🔔
          </button>

          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-sm">
            Sanjay
          </div>
        </div>
      </div>
    </header>
  )
}