import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ContactModel from "@/models/ContactModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// POST /api/admin/contacts/[contactId]/reply - Send a reply to a contact
export async function POST(
  req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    // Try both authentication methods
    const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();

    // Check if user is authenticated and is an admin
    const isAdmin =
      session?.user?.role === "admin" || currentUser?.role === "admin";

    if (!isAdmin) {
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
    const contact = await ContactModel.findById(contactId);

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
        html: replyText.replace(/\n/g, "<br />"),
      });

      // Update contact status to resolved and add reply to history
      contact.status = "resolved";

      // Add reply to contact history
      if (!contact.replies) {
        contact.replies = [];
      }

      // Get user email from either auth method
      const userEmail = session?.user?.email || currentUser?.email;

      contact.replies.push({
        date: new Date(),
        message: replyText,
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
