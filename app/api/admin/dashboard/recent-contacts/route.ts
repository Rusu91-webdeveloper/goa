import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ContactModel from "@/models/ContactModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/dashboard/recent-contacts - Get recent contact requests
export async function GET(req: NextRequest) {
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

    await connectToDatabase();

    // Get 5 most recent contact requests
    const recentContacts = await ContactModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format the contacts for display
    const formattedContacts = recentContacts.map((contact) => ({
      id: contact._id.toString(),
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      service: contact.service,
      date: contact.createdAt.toISOString().split("T")[0],
      status: contact.status || "new", // Default to "new" if status not set
    }));

    return NextResponse.json({
      success: true,
      contacts: formattedContacts,
    });
  } catch (error) {
    console.error("Error fetching recent contacts:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
