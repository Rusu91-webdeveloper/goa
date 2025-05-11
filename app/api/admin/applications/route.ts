import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// Define the JobApplication schema (same as in job-applications route)
const JobApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jobId: { type: String, required: true },
  coverLetter: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "review", "interview", "accepted", "rejected"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Get or create the JobApplication model
const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", JobApplicationSchema);

// Helper function to check if user is admin
async function checkAdminAuth() {
  // Try both authentication methods
  const session = await getServerSession(authOptions);
  const currentUser = await getCurrentUser();

  // Check if user is authenticated and is an admin
  const isAdmin =
    session?.user?.role === "admin" || currentUser?.role === "admin";

  return { isAdmin, session, currentUser };
}

// GET /api/admin/applications - Get all job applications
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 10; // Items per page
    const skip = (page - 1) * limit;
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status");
    const position = url.searchParams.get("position");

    // Connect to database
    await connectToDatabase();

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (position && position !== "all") {
      query.jobId = position;
    }

    // Get total count for pagination
    const total = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get applications with pagination
    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get unique positions for filter
    const positions = await JobApplication.distinct("jobId");

    return NextResponse.json({
      success: true,
      applications,
      totalPages,
      positions,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/applications/[id] - Delete a job application
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Delete the application
    await JobApplication.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete application" },
      { status: 500 }
    );
  }
}
