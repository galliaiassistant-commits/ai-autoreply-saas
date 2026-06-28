type DashboardSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}