type CardProps = {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({
  title,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-white">
          {title}
        </h2>
      )}

      {children}
    </div>
  )
}