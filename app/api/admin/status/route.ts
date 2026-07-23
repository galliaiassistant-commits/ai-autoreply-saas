import { NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const admin = await getCurrentAdmin()

  return NextResponse.json(
    { isAdmin: Boolean(admin) },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  )
}