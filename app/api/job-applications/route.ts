import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import { writeFile } from "fs/promises";
import path from "path";

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

    // Parse the multipart form data
    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const resumeFile = formData.get("resume") as File;

    // Validate required fields
    if (!jobId || !coverLetter || !resumeFile) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await writeFile(path.join(uploadDir, "test.txt"), "test");
    } catch (error) {
      console.error("Error creating uploads directory:", error);
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate a unique filename
    const fileExtension = resumeFile.name.split(".").pop();
    const uniqueFilename = `${userId}-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Convert File to Buffer and save it
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate the URL for the uploaded file
    const resumeUrl = `/uploads/${uniqueFilename}`;

    // Connect to database
    await connectToDatabase();

    // Create new job application
    const jobApplication = await JobApplication.create({
      userId,
      jobId,
      coverLetter,
      resumeUrl,
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
