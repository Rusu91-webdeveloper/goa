import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function GET() {
  try {
    removeAuthCookie();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
