import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// Define a schema for service bookings
const ServiceBookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  serviceId: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "confirmed", "cancelled"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Get or create the ServiceBooking model
const ServiceBooking =
  mongoose.models.ServiceBooking ||
  mongoose.model("ServiceBooking", ServiceBookingSchema);

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

// POST /api/service-bookings - Create a new service booking
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
    if (!body.serviceId || !body.date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create new service booking
    const serviceBooking = await ServiceBooking.create({
      userId: body.userId || userId,
      serviceId: body.serviceId,
      date: new Date(body.date),
      notes: body.notes || "",
    });

    return NextResponse.json(
      { success: true, data: serviceBooking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create service booking" },
      { status: 500 }
    );
  }
}

// GET /api/service-bookings - Get all service bookings for the current user
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

    // Get all service bookings for the current user
    const serviceBookings = await ServiceBooking.find({ userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      { success: true, data: serviceBookings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting service bookings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get service bookings" },
      { status: 500 }
    );
  }
}
