import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
    const { firstName, lastName } = await request.json();

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Update the user in the database
    const client = await clientPromise;
    const db = client.db();

    const userId = new ObjectId(user._id);

    const updateResult = await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          firstName,
          lastName,
          updatedAt: new Date(),
        },
      }
    );

    if (!updateResult.modifiedCount) {
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating profile" },
      { status: 500 }
    );
  }
}
