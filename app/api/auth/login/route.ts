import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, generateToken } from "@/lib/auth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data (without sensitive information)
    const {
      password: _,
      verificationToken: __,
      verificationTokenExpires: ___,
      ...userData
    } = user;

    // Create the response with the cookie
    const response = NextResponse.json({
      success: true,
      message: "Anmeldung erfolgreich",
      user: userData,
    });

    // Set the cookie in the response
    response.cookies.set("goa_auth_token", token, COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Bei der Anmeldung ist ein Fehler aufgetreten",
      },
      { status: 500 }
    );
  }
}
