export default function StatusBadge({ status }: { status?: string | null }) {
  const normalized = status || "booked"

  const styles: Record<string, string> = {
    booked: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
    missing_details: "bg-yellow-500/20 text-yellow-400",
  }

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[normalized] || "bg-slate-500/20 text-slate-400"}`}>
      {normalized.replace("_", " ")}
    </span>
  )
}