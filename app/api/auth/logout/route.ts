import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Cookie name consistent with the one used for authentication
const COOKIE_NAME = "goa_auth_token";

// Cookie options to match how it was set
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST() {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete({
      name: COOKIE_NAME,
      ...COOKIE_OPTIONS,
    });

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
