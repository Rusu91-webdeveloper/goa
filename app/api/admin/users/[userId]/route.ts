import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";

// GET /api/admin/users/[userId] - Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;

    // Connect to database
    await connectToDatabase();

    // Get user with all fields
    const user = await UserModel.findById(userId).lean();

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
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[userId] - Update a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;
    const updateData = await req.json();

    // Connect to database
    await connectToDatabase();

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await UserModel.findOne({ email: updateData.email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Fields that shouldn't be updated directly
    const restrictedFields = [
      "_id",
      "password",
      "resetPasswordToken",
      "resetPasswordExpires",
      "verificationToken",
      "verificationTokenExpires",
    ];

    // Update user with all provided fields
    Object.keys(updateData).forEach((key) => {
      if (!restrictedFields.includes(key)) {
        // @ts-ignore - We're dynamically setting properties
        user[key] = updateData[key];
      }
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: user.toObject(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;

    // Connect to database
    await connectToDatabase();

    // Prevent deleting self - check both auth methods
    const currentUserId = session?.user?.id || currentUser?._id.toString();
    if (currentUserId === userId) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists and delete
    const result = await UserModel.findByIdAndDelete(userId);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
