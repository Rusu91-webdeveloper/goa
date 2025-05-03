import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/auth";

// GET /api/user/profile - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id)
      .select(
        "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update current user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const updateData = await req.json();

    await connectToDatabase();

    // Find the user
    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Fields that users are allowed to update
    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "address",
      "city",
      "country",
      "zipCode",
      "educationLevel",
      "germanProficiencyLevel",
      "fieldsOfInterest",
      "preferredLearningMode",
      "preferredContactMethod",
      "marketingConsent",
      "profilePicture",
    ];

    // Check for password change
    if (updateData.password) {
      if (!updateData.currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required" },
          { status: 400 }
        );
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        updateData.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password and update
      user.password = await hashPassword(updateData.password);

      // Remove these fields from updateData so they aren't applied below
      delete updateData.password;
      delete updateData.currentPassword;
    }

    // Update allowed fields
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        // @ts-ignore - We're dynamically setting properties
        user[key] = updateData[key];
      }
    });

    await user.save();

    // Return updated user without sensitive information
    const updatedUser = await UserModel.findById(session.user.id)
      .select(
        "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires"
      )
      .lean();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
