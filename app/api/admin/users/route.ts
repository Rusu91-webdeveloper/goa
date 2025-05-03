import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";

// GET /api/admin/users - Get all users with pagination and search
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get additional filter fields
    const role = searchParams.get("role");
    const educationLevel = searchParams.get("educationLevel");
    const germanLevel = searchParams.get("germanProficiencyLevel");
    const learningMode = searchParams.get("preferredLearningMode");

    await connectToDatabase();

    // Create search query
    const searchQuery: any = {};

    // Add text search if provided
    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add filters if provided
    if (role) searchQuery.role = role;
    if (educationLevel) searchQuery.educationLevel = educationLevel;
    if (germanLevel) searchQuery.germanProficiencyLevel = germanLevel;
    if (learningMode) searchQuery.preferredLearningMode = learningMode;

    // Get users with pagination
    const users = await UserModel.find(searchQuery)
      .select(
        "_id firstName lastName email role isEmailVerified germanProficiencyLevel educationLevel createdAt lastLoginDate"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await UserModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      users,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
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

    const userData = await req.json();
    const { firstName, lastName, email, role } = userData;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate a random password (user will need to reset)
    const password = Math.random().toString(36).slice(-8);

    // Create new user with all provided data
    const newUserData = {
      ...userData,
      password, // This will be hashed in the UserModel pre-save hook
      role: role || "user",
      isEmailVerified: false,
    };

    const newUser = new UserModel(newUserData);
    await newUser.save();

    // TODO: Send email to user with their temporary password and instructions to reset

    // Return created user without sensitive information
    const createdUser = newUser.toObject();
    const userResponse = { ...createdUser };

    // Use optional chaining to fix TypeScript errors
    if ("password" in userResponse) {
      delete (userResponse as any).password;
    }
    if ("verificationToken" in userResponse) {
      delete (userResponse as any).verificationToken;
    }
    if ("resetPasswordToken" in userResponse) {
      delete (userResponse as any).resetPasswordToken;
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
