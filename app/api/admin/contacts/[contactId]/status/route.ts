import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PUT /api/admin/contacts/[contactId]/status - Update a contact's status
export async function PUT(
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
    const { status } = await req.json();

    // Validate status
    if (!status || !["new", "inProgress", "completed"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and update contact
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    contact.status = status;
    await contact.save();

    return NextResponse.json({
      success: true,
      message: "Contact status updated successfully",
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
