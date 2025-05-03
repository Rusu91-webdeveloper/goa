import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Get the JobApplication model
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

// Middleware function to check if the user is authenticated
async function checkAuth() {
  // Try both authentication methods
  const session = await getServerSession(authOptions);
  const currentUser = await getCurrentUser();

  // If neither authentication method worked, user is not authenticated
  if (!session?.user && !currentUser) {
    return { isAuthenticated: false };
  }

  // User is authenticated with at least one method
  const userId = session?.user?.id || currentUser?._id.toString();
  const isAdmin =
    session?.user?.role === "admin" || currentUser?.role === "admin";
  return { isAuthenticated: true, userId, isAdmin };
}

// PUT /api/job-applications/[applicationId]/status - Update an application status
export async function PUT(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, userId, isAdmin } = await checkAuth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { applicationId } = params;

    if (!applicationId || !ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Get status from request body
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "pending",
      "review",
      "interview",
      "accepted",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the application
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the application or an admin
    // Only the owner can withdraw an application (set status to 'pending')
    // Only admins can set other statuses
    if (
      (application.userId !== userId && !isAdmin) ||
      (status !== "pending" && application.userId === userId && !isAdmin)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized to update this application",
        },
        { status: 403 }
      );
    }

    // Update the application status
    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application status" },
      { status: 500 }
    );
  }
}

// DELETE /api/job-applications/[applicationId]/status - Withdraw an application (only by the owner)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, userId } = await checkAuth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { applicationId } = params;

    if (!applicationId || !ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the application
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the application
    if (application.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized to withdraw this application",
        },
        { status: 403 }
      );
    }

    // Check if application can be withdrawn (only pending or review status)
    if (application.status !== "pending" && application.status !== "review") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot withdraw application in its current status",
        },
        { status: 400 }
      );
    }

    // Withdraw the application by setting status to "withdrawn"
    application.status = "withdrawn";
    application.updatedAt = new Date();
    await application.save();

    return NextResponse.json(
      { success: true, data: application },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to withdraw application" },
      { status: 500 }
    );
  }
}
