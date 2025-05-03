import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { isLoggedIn: false, user: null },
        { status: 401 }
      );
    }

    // Remove sensitive information
    const {
      password,
      verificationToken,
      verificationTokenExpires,
      resetPasswordToken,
      resetPasswordExpires,
      ...safeUser
    } = user;

    return NextResponse.json({
      isLoggedIn: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      {
        isLoggedIn: false,
        user: null,
        message: "An error occurred while getting user information",
      },
      { status: 500 }
    );
  }
}
