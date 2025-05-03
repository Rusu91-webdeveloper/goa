import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// Define a schema for job applications
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
  return { isAuthenticated: true, userId };
}

// POST /api/job-applications - Create a new job application
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, userId } = await checkAuth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real implementation, you would handle file uploads here
    // using a service like AWS S3, Cloudinary, or similar

    // For demo purposes, we'll assume we have a direct URL to the resume
    // In a production app, you would:
    // 1. Parse the multipart form data
    // 2. Upload the file to a storage service
    // 3. Store the URL in the database

    // Parse request body (this is simplified - real implementation would handle multipart form data)
    const body = await req.json();

    // Validate required fields
    if (!body.jobId || !body.coverLetter) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create new job application
    const jobApplication = await JobApplication.create({
      userId: body.userId || userId,
      jobId: body.jobId,
      coverLetter: body.coverLetter,
      resumeUrl: body.resumeUrl || "https://example.com/placeholder.pdf", // In a real app, this would be the URL from your file upload
    });

    return NextResponse.json(
      { success: true, data: jobApplication },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create job application" },
      { status: 500 }
    );
  }
}

// GET /api/job-applications - Get all job applications for the current user
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, userId } = await checkAuth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get all job applications for the current user
    const jobApplications = await JobApplication.find({ userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      { success: true, data: jobApplications },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting job applications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get job applications" },
      { status: 500 }
    );
  }
}
