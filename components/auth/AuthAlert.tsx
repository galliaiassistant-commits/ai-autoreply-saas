"use client"

import { CheckCircle2, AlertCircle } from "lucide-react"

interface AuthAlertProps {
  type: "success" | "error"
  message: string
}

export default function AuthAlert({
  type,
  message,
}: AuthAlertProps) {
  const success = type === "success"

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${
        success
          ? "border-green-500/30 bg-green-500/10 text-green-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      {success ? (
        <CheckCircle2
          size={20}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <AlertCircle
          size={20}
          className="mt-0.5 shrink-0"
        />
      )}

      <span>{message}</span>
    </div>
  )
}