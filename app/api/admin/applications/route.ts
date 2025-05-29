import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// Define interface for application
interface IJobApplication {
  _id: mongoose.Types.ObjectId;
  userId: string;
  jobId: string;
  coverLetter: string;
  resumeUrl: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define interface for user
interface IUser {
  _id: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
}

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

// Define the User schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String },
  role: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Get or create the User model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

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
      .limit(limit)
      .lean();

    // Get unique positions for filter
    const positions = await JobApplication.distinct("jobId");

    // Get user information for each application
    const userIds = applications.map((app) => app.userId as string);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    // Create a lookup map for users
    const userMap: Record<string, any> = {};
    users.forEach((user) => {
      userMap[(user._id as any).toString()] = user;
    });

    // Filter applications if search is provided
    let filteredApplications = applications;
    if (search) {
      filteredApplications = applications.filter((app) => {
        const user = userMap[app.userId as string];
        if (!user) return false;

        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.trim();
        return (
          fullName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Format applications with user data
    const formattedApplications = filteredApplications.map((app) => {
      const user = userMap[app.userId as string];
      const fullName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : "Unknown";

      return {
        _id: (app._id as any).toString(),
        name: fullName,
        email: user ? user.email : "Unknown",
        phone: user ? user.phone || "Not provided" : "Not provided",
        position: app.jobId || "Not specified",
        coverLetter: app.coverLetter,
        resumeUrl: app.resumeUrl,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
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
