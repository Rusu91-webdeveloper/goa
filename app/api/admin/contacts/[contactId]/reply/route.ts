import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// POST /api/admin/contacts/[contactId]/reply - Send a reply to a contact
export async function POST(
  req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { contactId } = params;
    const { replyText } = await req.json();

    if (!replyText || replyText.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Reply text is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find contact
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    // Send email
    try {
      await sendEmail({
        to: contact.email,
        subject: "Antwort auf Ihre Anfrage bei GOA",
        text: replyText,
        html: replyText.replace(/\n/g, "<br />"),
      });

      // Update contact status to completed and add reply to history
      contact.status = "completed";

      // Add reply to contact history if it doesn't exist
      if (!contact.replies) {
        contact.replies = [];
      }

      contact.replies.push({
        text: replyText,
        sentAt: new Date(),
        sentBy: session.user.email,
      });

      await contact.save();

      return NextResponse.json({
        success: true,
        message: "Reply sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error replying to contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
