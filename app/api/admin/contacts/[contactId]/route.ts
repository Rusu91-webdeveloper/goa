import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ContactModel from "@/models/ContactModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/contacts/[contactId] - Get a specific contact
export async function GET(
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

    await connectToDatabase();

    const contact = await ContactModel.findById(contactId).lean();

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/[contactId] - Delete a contact
export async function DELETE(
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

    await connectToDatabase();

    const result = await ContactModel.findByIdAndDelete(contactId);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
