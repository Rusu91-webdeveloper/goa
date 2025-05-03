import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// POST /api/admin/applications/[applicationId]/reply - Send a reply to an applicant
export async function POST(
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

    // Find the applicant
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

    // In a real app, you would send an email here
    // For demonstration purposes, we'll just log the email content
    console.log(`Sending email to: ${applicant.email}`);
    console.log(`Subject: GOA Application Update`);
    console.log(`Body: ${replyText}`);

    // Update the last contact date
    await UserModel.updateOne(
      { _id: new ObjectId(applicationId) },
      { $set: { lastContactDate: new Date() } }
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
