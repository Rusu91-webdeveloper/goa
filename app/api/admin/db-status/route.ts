import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";

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

    const client = await clientPromise;
    const db = client.db();

    // Get collections
    const collectionsArray = await db.listCollections().toArray();
    const collections = collectionsArray.map((c) => c.name);

    // Get user count
    const userCount = await db.collection("users").countDocuments();

    return NextResponse.json({
      status: "connected",
      collections,
      userCount,
    });
  } catch (error) {
    console.error("Error checking database status:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to connect to database" },
      { status: 500 }
    );
  }
}
