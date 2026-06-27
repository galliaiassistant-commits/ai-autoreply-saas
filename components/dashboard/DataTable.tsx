type DataTableProps = {
  title: string
  children: React.ReactNode
}

export function DataTable({
  title,
  children,
}: DataTableProps) {
  return (
    <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-2xl font-bold">
        {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {children}
        </table>
      </div>
    </div>
  )
}