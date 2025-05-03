import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: "Token ist erforderlich" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Find user with this token
    const user = await db.collection("users").findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "Ungültiger oder abgelaufener Token" }, { status: 400 })
    }

    // Update user
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          verificationToken: "",
          verificationTokenExpires: "",
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "E-Mail-Adresse erfolgreich bestätigt",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { success: false, message: "Bei der E-Mail-Bestätigung ist ein Fehler aufgetreten" },
      { status: 500 },
    )
  }
}
