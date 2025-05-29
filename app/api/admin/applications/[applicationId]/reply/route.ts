import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/email"; // Import the email sending function

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
  lastContactDate: { type: Date },
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

// POST /api/admin/applications/[applicationId]/reply - Send a reply to an applicant
export async function POST(
  req: NextRequest,
  context: { params: { applicationId: string } }
) {
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

    // Get the application ID from params with async/await handling
    const params = await Promise.resolve(context.params);
    if (!params?.applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      );
    }

    const applicationId = params.applicationId;

    if (!ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID format" },
        { status: 400 }
      );
    }

    // Get reply text from request body
    const body = await req.json();
    const { replyText } = body;

    if (!replyText || replyText.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Reply text is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the application
    const application = await JobApplication.findOne({
      _id: new ObjectId(applicationId),
    }).lean();

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Find the user associated with this application
    const user = await User.findOne({
      _id: (application as any).userId,
    }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    try {
      // Actually send the email using the email service
      await sendEmail({
        to: (user as any).email,
        subject: `Ihre Bewerbung als ${(application as any).jobId} bei GOA`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #047857;">Bewerbung Update</h2>
            <div style="white-space: pre-line;">
              ${replyText}
            </div>
          </div>
        `,
      });

      console.log(`Email sent successfully to: ${(user as any).email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }

    // Update the last contact date
    await JobApplication.updateOne(
      { _id: new ObjectId(applicationId) },
      { $set: { lastContactDate: new Date(), updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
