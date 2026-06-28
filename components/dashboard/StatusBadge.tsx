type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-600 text-white",
    confirmed: "bg-blue-600 text-white",
    completed: "bg-green-600 text-white",
    cancelled: "bg-red-600 text-white",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm ${
        styles[status] || "bg-slate-600 text-white"
      }`}
    >
      {status}
    </span>
  )
}