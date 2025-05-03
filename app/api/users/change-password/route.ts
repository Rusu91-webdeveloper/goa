import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

// POST /api/users/change-password - Change the current user's password
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

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get User model
    const User = mongoose.models.User;

    if (!User) {
      return NextResponse.json(
        { success: false, message: "User model not found" },
        { status: 500 }
      );
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if current password is correct
    const isPasswordValid = await bcrypt.compare(
      body.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(body.newPassword, 12);

    // Update user's password
    await User.findByIdAndUpdate(userId, {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 }
    );
  }
}
