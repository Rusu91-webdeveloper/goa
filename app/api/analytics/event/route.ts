import { NextResponse } from "next/server"
import { trackEvent } from "@/lib/analytics"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const { eventType, eventCategory, eventAction, eventLabel, eventValue, path } = await request.json()

    const headersList = headers()
    const userAgent = headersList.get("user-agent") || ""
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

    await trackEvent({
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      path,
      userAgent,
      ip: typeof ip === "string" ? ip.split(",")[0].trim() : "unknown",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking event:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
