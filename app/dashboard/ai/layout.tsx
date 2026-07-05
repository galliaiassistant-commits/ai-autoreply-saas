import { redirect } from "next/navigation"
import { getCurrentBusiness } from "@/lib/auth"

export default async function AILayout({
  children,
}: {
  children: React.ReactNode
}) {
  const business = await getCurrentBusiness()

  if (!business) {
    redirect("/auth/sign-in")
  }

  return <>{children}</>
}