import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { sendJobApplicationNotification } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.email || !data.lastName || !data.firstName) {
      return NextResponse.json(
        { success: false, message: "Alle Pflichtfelder müssen ausgefüllt sein" },
        { status: 400 },
      )
    }

    // Store in database
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("jobApplications").insertOne({
      ...data,
      createdAt: new Date(),
      status: "new",
    })

    // Send email notification
    await sendJobApplicationNotification(data)

    return NextResponse.json({
      success: true,
      message: "Bewerbung erfolgreich übermittelt",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error processing job application:", error)
    return NextResponse.json({ success: false, message: "Fehler bei der Verarbeitung der Bewerbung" }, { status: 500 })
  }
}
