import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/applications - Get all job applications with pagination, search, and filtering
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
    const position = searchParams.get("position") || "all";
    const limit = 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    // Create search query for applicants (users with role "applicant")
    let searchQuery: any = { role: "applicant" };

    // Add search conditions if search term is provided
    if (search) {
      searchQuery = {
        ...searchQuery,
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Add status filter if not 'all'
    if (status !== "all") {
      searchQuery["status"] = status;
    }

    // Add position filter if not 'all'
    if (position !== "all") {
      searchQuery["position"] = position;
    }

    // Get applications with pagination
    const applicants = await UserModel.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await UserModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    // Format the applicants as job applications
    const applications = applicants.map((applicant: any) => {
      // In a real app, you'd have more fields from an applications collection
      // This is a simplified version based on user data
      const fullName =
        `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() ||
        "Unknown";

      // Determine a status (in a real app, this would come from the application)
      const statuses = [
        "new",
        "reviewing",
        "interview",
        "rejected",
        "accepted",
      ];
      const randomStatus =
        applicant.status ||
        statuses[Math.floor(Math.random() * statuses.length)];

      return {
        _id: applicant._id.toString(),
        name: fullName,
        email: applicant.email,
        phone: applicant.phone || "",
        position: applicant.position || "BAMF-Lehrkraft", // Default position
        coverLetter: applicant.coverLetter || "",
        resumeUrl: applicant.resumeUrl || "",
        status: randomStatus,
        createdAt: applicant.createdAt.toISOString(),
      };
    });

    // Get unique positions for the position filter
    const uniquePositions = Array.from(
      new Set(applications.map((app) => app.position))
    );

    return NextResponse.json({
      success: true,
      applications,
      totalPages,
      currentPage: page,
      total,
      positions: uniquePositions,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
