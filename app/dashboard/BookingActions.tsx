"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react"

type BookingActionsProps = {
  bookingId: string
  businessId: string
  status?: string | null
}

export default function BookingActions({
  bookingId,
  businessId,
  status,
}: BookingActionsProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  async function updateStatus(nextStatus: string) {
    setLoadingAction(nextStatus)

    const { error } = await supabase
      .from("bookings")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("business_id", businessId)

    setLoadingAction(null)

    if (error) {
      alert(error.message)
      return
    }

    router.refresh()
  }

  const isCompleted = status === "completed"
  const isCancelled = status === "cancelled"
  const isBooked = status === "booked"

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isBooked && !isCompleted && !isCancelled && (
        <ActionButton
          label="Mark Booked"
          action="booked"
          loadingAction={loadingAction}
          onClick={() => updateStatus("booked")}
          icon={<CheckCircle2 size={15} />}
        />
      )}

      {!isCompleted && !isCancelled && (
        <ActionButton
          label="Complete"
          action="completed"
          loadingAction={loadingAction}
          onClick={() => updateStatus("completed")}
          icon={<CheckCircle2 size={15} />}
        />
      )}

      {!isCancelled && (
        <ActionButton
          label="Cancel"
          action="cancelled"
          loadingAction={loadingAction}
          onClick={() => updateStatus("cancelled")}
          icon={<XCircle size={15} />}
          danger
        />
      )}

      {(isCompleted || isCancelled) && (
        <ActionButton
          label="Reopen"
          action="missing_details"
          loadingAction={loadingAction}
          onClick={() => updateStatus("missing_details")}
          icon={<RotateCcw size={15} />}
        />
      )}
    </div>
  )
}

function ActionButton({
  label,
  action,
  loadingAction,
  onClick,
  icon,
  danger,
}: {
  label: string
  action: string
  loadingAction: string | null
  onClick: () => void
  icon: React.ReactNode
  danger?: boolean
}) {
  const loading = loadingAction === action

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={Boolean(loadingAction)}
      className={
        danger
          ? "inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          : "inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
      }
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon}
      {loading ? "Saving..." : label}
    </button>
  )
}