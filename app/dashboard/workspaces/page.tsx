import {
  redirect,
} from "next/navigation"
import {
  getCurrentBusiness,
  getCurrentBusinesses,
} from "@/lib/auth"
import {
  businessCanUseFeature,
} from "@/lib/plans"
import { PageHeader } from "@/components/dashboard/PageHeader"
import WorkspaceManager from "./WorkspaceManager"

const MAX_BUSINESS_WORKSPACES =
  5

export default async function WorkspacesPage() {
  const currentBusiness =
    await getCurrentBusiness()

  if (!currentBusiness) {
    redirect("/auth/sign-in")
  }

  if (
    !businessCanUseFeature(
      currentBusiness,
      "multiple_businesses"
    )
  ) {
    redirect(
      "/dashboard/billing?upgrade=business"
    )
  }

  const primaryBusinessId =
    currentBusiness
      .billing_business_id ||
    currentBusiness.id

  const allBusinesses =
    await getCurrentBusinesses()

  const workspaces =
    allBusinesses
      .filter(
        (business) =>
          business.id ===
            primaryBusinessId ||
          business.billing_business_id ===
            primaryBusinessId
      )
      .map((business) => ({
        id: String(business.id),

        business_name:
          business.business_name ||
          business.name ||
          "Unnamed Business",

        billing_business_id:
          business.billing_business_id ||
          null,
      }))

  return (
    <div>
      <PageHeader
        title="Business Workspaces"
        description="Manage separate businesses under your Jhyro AI Business subscription."
      />

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <p className="font-semibold text-cyan-200">
          Business plan feature
        </p>

        <p className="mt-1 text-sm leading-relaxed text-cyan-300/70">
          Billing is shared, but each
          workspace has separate
          customers, conversations,
          bookings, services, AI
          settings, WhatsApp, and Google
          Calendar connections.
        </p>
      </div>

      <WorkspaceManager
        workspaces={workspaces}
        currentBusinessId={String(
          currentBusiness.id
        )}
        primaryBusinessId={String(
          primaryBusinessId
        )}
        maximumWorkspaces={
          MAX_BUSINESS_WORKSPACES
        }
      />
    </div>
  )
}