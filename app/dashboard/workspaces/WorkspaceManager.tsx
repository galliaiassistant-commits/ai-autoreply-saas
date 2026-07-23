"use client"

import {
  useState,
  useTransition,
} from "react"
import {
  useRouter,
} from "next/navigation"
import {
  Building2,
  CheckCircle2,
  Plus,
} from "lucide-react"
import {
  createBusinessWorkspace,
  switchBusinessWorkspace,
} from "./actions"

type Workspace = {
  id: string
  business_name:
    | string
    | null
  billing_business_id:
    | string
    | null
}

type WorkspaceManagerProps = {
  workspaces: Workspace[]
  currentBusinessId: string
  primaryBusinessId: string
  maximumWorkspaces: number
}

export default function WorkspaceManager({
  workspaces,
  currentBusinessId,
  primaryBusinessId,
  maximumWorkspaces,
}: WorkspaceManagerProps) {
  const router = useRouter()

  const [
    businessName,
    setBusinessName,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  const [
    isPending,
    startTransition,
  ] = useTransition()

  const canCreate =
    workspaces.length <
    maximumWorkspaces

  function selectWorkspace(
    businessId: string
  ) {
    if (
      businessId ===
      currentBusinessId
    ) {
      return
    }

    setError("")

    startTransition(async () => {
      const result =
        await switchBusinessWorkspace(
          businessId
        )

      if (!result.ok) {
        setError(
          result.error ||
            "Could not switch businesses."
        )

        return
      }

      router.push("/dashboard")
      router.refresh()
    })
  }

  function createWorkspace(
    event: React.FormEvent
  ) {
    event.preventDefault()

    const cleanName =
      businessName.trim()

    if (!cleanName) {
      setError(
        "Enter a business name."
      )
      return
    }

    setError("")

    startTransition(async () => {
      const result =
        await createBusinessWorkspace(
          cleanName
        )

      if (!result.ok) {
        setError(
          result.error ||
            "Could not create the business."
        )

        return
      }

      setBusinessName("")
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Your businesses
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Each business keeps its
              own customers, messages,
              bookings, settings, and
              integrations.
            </p>
          </div>

          <span className="w-fit rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
            {workspaces.length} of{" "}
            {maximumWorkspaces}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {workspaces.map(
            (workspace) => {
              const isCurrent =
                workspace.id ===
                currentBusinessId

              const isPrimary =
                workspace.id ===
                primaryBusinessId

              return (
                <button
                  key={workspace.id}
                  type="button"
                  disabled={
                    isPending
                  }
                  onClick={() =>
                    selectWorkspace(
                      workspace.id
                    )
                  }
                  className={
                    isCurrent
                      ? "flex w-full items-center justify-between gap-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5 text-left"
                      : "flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-slate-700 hover:bg-slate-800/50 disabled:opacity-60"
                  }
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={
                        isCurrent
                          ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"
                          : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-300"
                      }
                    >
                      <Building2
                        size={22}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {workspace.business_name ||
                          "Unnamed Business"}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {isPrimary && (
                          <span className="text-slate-400">
                            Main billing
                            business
                          </span>
                        )}

                        {!isPrimary && (
                          <span className="text-slate-500">
                            Additional
                            workspace
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-cyan-300">
                      <CheckCircle2
                        size={16}
                      />
                      Current
                    </span>
                  )}
                </button>
              )
            }
          )}
        </div>
      </section>

      <section className="h-fit rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
          <Plus size={22} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          Add another business
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Business plans can manage up
          to {maximumWorkspaces} separate
          businesses under one
          subscription.
        </p>

        <form
          onSubmit={createWorkspace}
          className="mt-6"
        >
          <label className="text-sm font-semibold text-slate-300">
            Business name
          </label>

          <input
            value={businessName}
            disabled={
              isPending ||
              !canCreate
            }
            onChange={(event) =>
              setBusinessName(
                event.target.value
              )
            }
            placeholder="Enter business name"
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:border-slate-600 disabled:opacity-50"
          />

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!canCreate && (
            <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              You have reached the
              five-business limit.
            </div>
          )}

          <button
            type="submit"
            disabled={
              isPending ||
              !canCreate ||
              !businessName.trim()
            }
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />

            {isPending
              ? "Saving..."
              : "Create Business"}
          </button>
        </form>
      </section>
    </div>
  )
}