"use client"

type ModalProps = {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}