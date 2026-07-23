import { getCurrentBusiness } from "@/lib/auth"
import { businessCanUseFeature } from "@/lib/plans"
import OnboardingWizard from "./OnboardingWizard"

export default async function OnboardingPage() {
  const business =
    await getCurrentBusiness()

  const canManageServices =
    business
      ? businessCanUseFeature(
          business,
          "service_management"
        )
      : false

  return (
    <OnboardingWizard
      canManageServices={
        canManageServices
      }
    />
  )
}