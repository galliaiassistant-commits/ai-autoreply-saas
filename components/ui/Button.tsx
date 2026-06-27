type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger"
}

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"

  const styles = {
    primary: "bg-white text-black hover:bg-gray-200",
    secondary: "bg-gray-900 text-white border border-gray-800 hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  )
}