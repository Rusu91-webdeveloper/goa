import { NextResponse } from "next/server"
import { hashPassword, generateVerificationToken, getUserByEmail } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import clientPromise from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: "Alle Felder sind erforderlich" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Das Passwort muss mindestens 8 Zeichen lang sein" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Diese E-Mail-Adresse wird bereits verwendet" },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date()
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24) // 24 hours

    // Create user
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("users").insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      success: true,
      message: "Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "Bei der Registrierung ist ein Fehler aufgetreten" },
      { status: 500 },
    )
  }
}
