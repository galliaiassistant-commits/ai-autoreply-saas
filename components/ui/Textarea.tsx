type TextareaProps = {
  label?: string
  value: string
  placeholder?: string
  rows?: number
  onChange: (value: string) => void
}

export function Textarea({
  label,
  value,
 placeholder,
  rows = 5,
  onChange,
}: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-gray-300">
          {label}
        </label>
      )}

      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-white resize-none"
      />
    </div>
  )
}