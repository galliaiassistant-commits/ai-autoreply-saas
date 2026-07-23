"use client"

import Link from "next/link"
import {
  useState,
  useTransition,
} from "react"
import {
  useRouter,
} from "next/navigation"
import {
  Building2,
  Plus,
} from "lucide-react"
import {
  switchBusinessWorkspace,
} from "@/app/dashboard/workspaces/actions"

type Workspace = {
  id: string
  business_name:
    | string
    | null
}

type WorkspaceSwitcherProps = {
  businesses: Workspace[]
  currentBusinessId:
    | string
    | null
}

export default function WorkspaceSwitcher({
  businesses,
  currentBusinessId,
}: WorkspaceSwitcherProps) {
  const router = useRouter()

  const [
    selectedBusinessId,
    setSelectedBusinessId,
  ] = useState(
    currentBusinessId || ""
  )

  const [
    switching,
    startTransition,
  ] = useTransition()

  function changeWorkspace(
    businessId: string
  ) {
    const previousBusinessId =
      selectedBusinessId

    setSelectedBusinessId(
      businessId
    )

    startTransition(async () => {
      const result =
        await switchBusinessWorkspace(
          businessId
        )

      if (!result.ok) {
        setSelectedBusinessId(
          previousBusinessId
        )

        alert(
          result.error ||
            "Could not switch businesses."
        )

        return
      }

      router.refresh()
    })
  }

  if (businesses.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Building2
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <select
          aria-label="Current business"
          value={selectedBusinessId}
          disabled={switching}
          onChange={(event) =>
            changeWorkspace(
              event.target.value
            )
          }
          className="h-11 max-w-48 appearance-none rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-8 text-sm font-semibold text-slate-200 outline-none transition hover:border-slate-700 disabled:cursor-wait disabled:opacity-60"
        >
          {businesses.map(
            (business) => (
              <option
                key={business.id}
                value={business.id}
              >
                {business.business_name ||
                  "Unnamed Business"}
              </option>
            )
          )}
        </select>

        {switching && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
          </div>
        )}
      </div>

      <Link
        href="/dashboard/workspaces"
        title="Manage business workspaces"
        aria-label="Manage business workspaces"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
      >
        <Plus size={18} />
      </Link>
    </div>
  )
}