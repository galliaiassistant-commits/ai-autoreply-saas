import { NextResponse } from "next/server"
import { getCurrentBusiness } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const graphVersion =
  process.env.META_GRAPH_VERSION || "v20.0"

export async function POST(req: Request) {
  try {
    const business = await getCurrentBusiness()

    if (!business) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      accessToken,
      phoneNumberId,
      wabaId,
    } = body

    if (!accessToken || !phoneNumberId || !wabaId) {
      return NextResponse.json(
        {
          error:
            "Missing Meta WhatsApp credentials",
        },
        { status: 400 }
      )
    }

    // Verify the WhatsApp number with Meta
    const verifyResponse = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}?fields=display_phone_number,verified_name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const verifyData =
      await verifyResponse.json()

    if (!verifyResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Meta verification failed",
          details: verifyData,
        },
        { status: 400 }
      )
    }

    // Save connection to business
    const { error } = await supabaseAdmin
      .from("businesses")
      .update({
        whatsapp_access_token: accessToken,
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_business_account_id: wabaId,
        whatsapp_connected: true,
      })
      .eq("id", business.id)

    if (error) {
      console.error(
        "Supabase update error:",
        error
      )

      return NextResponse.json(
        {
          error:
            "Failed saving WhatsApp connection",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        "WhatsApp connected successfully",
      phone:
        verifyData.display_phone_number,
      name:
        verifyData.verified_name,
    })
  } catch (error) {
    console.error(
      "WhatsApp connect error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      { status: 500 }
    )
  }
}