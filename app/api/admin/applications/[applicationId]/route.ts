import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/applications/[applicationId] - Get a single application
export async function GET(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
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

    const { applicationId } = params;

    if (!applicationId || !ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the applicant (user with role "applicant")
    const applicant: any = await UserModel.findOne({
      _id: new ObjectId(applicationId),
      role: "applicant",
    }).lean();

    if (!applicant) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Format the applicant as a job application
    const fullName =
      `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() ||
      "Unknown";

    // In a real app, you'd have a dedicated applications collection
    // with more fields and better structure
    const application = {
      _id: applicant._id.toString(),
      name: fullName,
      email: applicant.email,
      phone: applicant.phone || "",
      position: applicant.position || "BAMF-Lehrkraft", // Default position
      coverLetter: applicant.coverLetter || "",
      resumeUrl: applicant.resumeUrl || "",
      status: applicant.status || "new",
      createdAt: applicant.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/applications/[applicationId] - Delete an application
export async function DELETE(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
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

    const { applicationId } = params;

    if (!applicationId || !ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and delete the applicant
    const result = await UserModel.deleteOne({
      _id: new ObjectId(applicationId),
      role: "applicant",
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
