import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/dashboard/recent-applications - Get recent applications
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

    // Get 5 most recent applicants (users with role "applicant")
    const recentApplicants = await UserModel.find({ role: "applicant" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format the applicants for display
    const formattedApplicants = recentApplicants.map((applicant) => {
      // Determine a random status for demonstration
      // In a real app, you would have an applications collection with status
      const statuses = ["new", "reviewing", "interviewed", "hired", "rejected"];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      const fullName =
        `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() ||
        "Unknown";

      return {
        id: applicant._id.toString(),
        name: fullName,
        email: applicant.email,
        position: "BAMF-Lehrkraft", // Default position, in a real app this would come from the application
        date: applicant.createdAt.toISOString().split("T")[0],
        status: randomStatus,
      };
    });

    return NextResponse.json({
      success: true,
      applications: formattedApplicants,
    });
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
