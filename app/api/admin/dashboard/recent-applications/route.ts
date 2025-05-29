import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// Define the JobApplication schema
const JobApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jobId: { type: String, required: true },
  coverLetter: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  status: {
    type: String,
    default: "new",
    enum: ["new", "reviewing", "interview", "accepted", "rejected"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Get or create the JobApplication model
const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", JobApplicationSchema);

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

    // Get 5 most recent job applications
    const recentApplications = await JobApplication.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get user IDs from applications
    const userIds = recentApplications.map((app) => app.userId);

    // Fetch user data for these applications
    const users = await UserModel.find({
      _id: { $in: userIds },
    }).lean();

    // Create a lookup map for users
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Format the applications for display
    const formattedApplicants = recentApplications.map((application) => {
      const user = userMap[application.userId];
      const fullName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : "Unknown";

      return {
        id: application._id.toString(),
        name: fullName,
        email: user ? user.email : "Unknown",
        position: application.jobId || "BAMF-Lehrkraft",
        date: new Date(application.createdAt).toISOString().split("T")[0],
        status: application.status || "new",
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
