import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { sendContactNotification } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.email) {
      return NextResponse.json({ success: false, message: "E-Mail ist erforderlich" }, { status: 400 })
    }

    // Store in database
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("contacts").insertOne({
      ...data,
      createdAt: new Date(),
    })

    // Send email notification
    await sendContactNotification(data)

    // Track event
    // This would be handled by the client-side analytics

    return NextResponse.json({
      success: true,
      message: "Formular erfolgreich übermittelt",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ success: false, message: "Fehler bei der Verarbeitung des Formulars" }, { status: 500 })
  }
}
