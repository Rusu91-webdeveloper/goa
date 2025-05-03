import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Check if user is admin
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
