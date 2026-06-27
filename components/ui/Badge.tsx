type BadgeProps = {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

export function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  const styles = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-600 text-white",
    danger: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm ${styles[variant]}`}
    >
      {children}
    </span>
  )
}