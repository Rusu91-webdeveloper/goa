import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

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

// PUT /api/users/profile - Update the current user's profile
export async function PUT(req: NextRequest) {
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

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// GET /api/users/profile - Get the current user's profile
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

    // Get User model
    const User = mongoose.models.User;

    if (!User) {
      return NextResponse.json(
        { success: false, message: "User model not found" },
        { status: 500 }
      );
    }

    // Get user profile
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get user profile" },
      { status: 500 }
    );
  }
}
