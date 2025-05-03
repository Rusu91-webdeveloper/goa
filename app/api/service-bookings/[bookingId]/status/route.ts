import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Get the ServiceBooking model
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
  const isAdmin =
    session?.user?.role === "admin" || currentUser?.role === "admin";
  return { isAuthenticated: true, userId, isAdmin };
}

// PUT /api/service-bookings/[bookingId]/status - Update a booking status
export async function PUT(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, userId, isAdmin } = await checkAuth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId } = params;

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Get status from request body
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the booking
    const booking = await ServiceBooking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the booking or an admin
    if (booking.userId !== userId && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Update the booking status
    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking status" },
      { status: 500 }
    );
  }
}

// DELETE /api/service-bookings/[bookingId]/status - Cancel a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // Check if user is authenticated
    const { isAuthenticated, userId, isAdmin } = await checkAuth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId } = params;

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the booking
    const booking = await ServiceBooking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner of the booking or an admin
    if (booking.userId !== userId && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Not authorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Cancel the booking by changing status to "cancelled"
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    await booking.save();

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
