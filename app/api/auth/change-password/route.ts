import { NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the form data
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    // Verify that current password is correct
    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    const client = await clientPromise;
    const db = client.db();

    const userId = new ObjectId(user._id);

    const updateResult = await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (!updateResult.modifiedCount) {
      return NextResponse.json(
        { success: false, message: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating password" },
      { status: 500 }
    );
  }
}
