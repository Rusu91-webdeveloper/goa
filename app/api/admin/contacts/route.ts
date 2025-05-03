import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ContactModel from "@/models/ContactModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/contacts - Get all contacts with pagination, search, and filtering
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const limit = 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    // Create search query
    let searchQuery: any = {};

    // Add search conditions if search term is provided
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Add status filter if not 'all'
    if (status !== "all") {
      searchQuery.status = status;
    }

    // Get contacts with pagination
    const contacts = await ContactModel.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await ContactModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      contacts,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
