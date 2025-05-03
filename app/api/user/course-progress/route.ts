import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET /api/user/course-progress - Get course progress for current user
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
      .select("courseProgress")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      courseProgress: user.courseProgress || [],
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/course-progress - Update course progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { courseId, courseName, progress } = await req.json();

    // Validate input
    if (!courseId || progress === undefined) {
      return NextResponse.json(
        { success: false, message: "Course ID and progress are required" },
        { status: 400 }
      );
    }

    // Ensure progress is between 0 and 100
    const validatedProgress = Math.min(Math.max(Number(progress), 0), 100);

    await connectToDatabase();

    // Check if course already exists in user's courseProgress
    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let courseObjectId;
    try {
      courseObjectId = new ObjectId(courseId);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID" },
        { status: 400 }
      );
    }

    // Initialize courseProgress if it doesn't exist
    if (!user.courseProgress) {
      user.courseProgress = [];
    }

    // Find the course in the user's courseProgress
    const courseIndex = user.courseProgress.findIndex(
      (course) => course.courseId.toString() === courseId
    );

    // Update if it exists, add if it doesn't
    if (courseIndex >= 0) {
      user.courseProgress[courseIndex].progress = validatedProgress;

      // Set completion date if progress is 100%
      if (
        validatedProgress === 100 &&
        !user.courseProgress[courseIndex].completionDate
      ) {
        user.courseProgress[courseIndex].completionDate = new Date();
      } else if (validatedProgress < 100) {
        // Remove completion date if progress is less than 100%
        user.courseProgress[courseIndex].completionDate = undefined;
      }
    } else {
      const newCourseProgress = {
        courseId: courseObjectId,
        courseName,
        progress: validatedProgress,
        startDate: new Date(),
        completionDate: validatedProgress === 100 ? new Date() : undefined,
      };
      user.courseProgress.push(newCourseProgress);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Course progress updated",
      courseProgress: user.courseProgress,
    });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
