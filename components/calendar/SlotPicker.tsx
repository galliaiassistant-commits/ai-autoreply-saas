import { Slot, BusinessService } from "./types"

export default function SlotPicker({
  selectedSlot,
  services,
  selectedService,
  setSelectedService,
  onSave,
  onCancel,
  saving,
}: {
  selectedSlot: Slot | null
  services: BusinessService[]
  selectedService: string
  setSelectedService: (value: string) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  if (!selectedSlot) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">
          Create Booking
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {selectedSlot.date.toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>

        <label className="mt-5 block">
          <span className="text-sm text-slate-400">
            Service
          </span>

          <select
            autoFocus
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
          >
            <option value="">
              Select a service
            </option>

            {services.map((service) => (
              <option
                key={service.id}
                value={service.name}
              >
                {service.name}
              </option>
            ))}
          </select>
        </label>

        {services.length === 0 && (
          <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
            No active services found. Add services in the business services table first.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Booking"}
          </button>

          <button
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}