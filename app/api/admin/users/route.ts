import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { createResetToken } from "@/lib/tokens";
import { sendAdminCreatedAccountEmail } from "@/lib/email";

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
    const { firstName, lastName, email, role, sendResetLink } = userData;

    console.log("[ADMIN CREATE USER] Request Data:", userData); // Log incoming data

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

    // Generate a random password for the account
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create new user with all provided data
    const newUserData = {
      ...userData,
      password: tempPassword, // This will be hashed in the UserModel pre-save hook
      role: role || "user",
      isEmailVerified: true, // Auto-verify admin-created accounts
    };

    const newUser = new UserModel(newUserData);
    await newUser.save();
    console.log(
      "[ADMIN CREATE USER] New user saved to DB:",
      newUser._id.toString()
    );

    let emailSent = false;
    let resetToken = "";
    let emailError = null;
    let resetLink = "";

    try {
      resetToken = await createResetToken(newUser._id.toString());
      resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;
      console.log("[ADMIN CREATE USER] Reset token generated:", resetToken);
    } catch (error) {
      console.error("[ADMIN CREATE USER] Error generating reset token:", error);
      emailError = "Failed to generate password reset token";
    }

    if (resetToken) {
      console.log(`[ADMIN CREATE USER] Attempting to send email to: ${email}`);
      console.log(`[ADMIN CREATE USER] Using reset token: ${resetToken}`);
      if (!sendResetLink) {
        console.log(
          `[ADMIN CREATE USER] Sending with temp password: ${tempPassword}`
        );
      } else {
        console.log(
          `[ADMIN CREATE USER] Sending with reset link: ${resetLink}`
        );
      }

      try {
        if (sendResetLink) {
          await sendAdminCreatedAccountEmail(email, resetToken);
          console.log(
            `[ADMIN CREATE USER] Reset link email supposedly sent to ${email}`
          );
        } else {
          await sendAdminCreatedAccountEmail(email, resetToken, tempPassword);
          console.log(
            `[ADMIN CREATE USER] Temp password email supposedly sent to ${email}`
          );
        }
        emailSent = true;
        console.log(
          "[ADMIN CREATE USER] Email send attempt successful (emailSent = true)"
        );
      } catch (error) {
        console.error(
          "[ADMIN CREATE USER] Error caught from sendAdminCreatedAccountEmail:",
          error
        );
        emailError = String(error); // Ensure it's a string
        console.log(
          "[ADMIN CREATE USER] Email send attempt failed (emailSent = false, emailError set)"
        );
      }
    } else {
      console.log(
        "[ADMIN CREATE USER] Skipped email sending because resetToken was not generated."
      );
      if (!emailError) {
        // If no prior error, set one for clarity
        emailError = "Skipped email sending due to missing reset token.";
      }
    }

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

    console.log("[ADMIN CREATE USER] API Response:", {
      success: true,
      message: emailSent
        ? "User created successfully and email sent"
        : "User created successfully but email failed to send",
      user: userResponse, // Log this carefully or parts of it, avoid logging sensitive data if userResponse contains it.
      tempPassword: !sendResetLink ? tempPassword : undefined,
      resetLink: sendResetLink ? resetLink : undefined,
      emailSent,
      emailError,
    });

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "User created successfully and email sent"
        : "User created successfully but email failed to send",
      user: userResponse,
      tempPassword: !sendResetLink ? tempPassword : undefined,
      resetLink: sendResetLink ? resetLink : undefined,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error("[ADMIN CREATE USER] Outer catch block error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
