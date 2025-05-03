import { NextResponse } from "next/server";
import { trackPageView } from "@/lib/analytics";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { path, referrer } = await request.json();

    const headersList = await headers();
    const userAgent = (await headersList.get("user-agent")) || "";
    const ip =
      (await headersList.get("x-forwarded-for")) ||
      (await headersList.get("x-real-ip")) ||
      "unknown";

    await trackPageView({
      path,
      referrer,
      userAgent,
      ip: typeof ip === "string" ? ip.split(",")[0].trim() : "unknown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
