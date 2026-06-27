type InputProps = {
  label?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  type?: string
}

export function Input({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-gray-300">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-white"
      />
    </div>
  )
}