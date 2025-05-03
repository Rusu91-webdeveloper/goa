import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/admin/applications/[applicationId]/status - Update application status
export async function PUT(
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
      "new",
      "reviewing",
      "interview",
      "rejected",
      "accepted",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update the applicant status
    const result = await UserModel.updateOne(
      { _id: new ObjectId(applicationId), role: "applicant" },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
