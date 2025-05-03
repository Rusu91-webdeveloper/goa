import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import ContactModel from "@/models/ContactModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// GET /api/admin/dashboard/analytics - Get analytics data for the chart
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

    await connectToDatabase();

    // Get last 6 months (including current)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(month);
    }

    // Get month labels in the correct format
    const labels = months.map((month) => {
      return month.toLocaleDateString("en-US", { month: "short" });
    });

    // Calculate start of next month for the end date of ranges
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get user signups per month
    const visitorData = [];
    const pageViewData = [];

    for (let i = 0; i < months.length; i++) {
      const startDate = months[i];
      const endDate = i === months.length - 1 ? nextMonth : months[i + 1];

      // Count users registered in this month
      const userCount = await UserModel.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
      });
      visitorData.push(userCount);

      // Count contacts received in this month (as a proxy for page views)
      const contactCount = await ContactModel.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
      });

      // Simulate page views (in a real app, you would get this from analytics)
      // Here we'll just use a multiplier on contact count as a rough estimate
      const pageViews = contactCount * 50 + userCount * 10;
      pageViewData.push(pageViews);
    }

    return NextResponse.json({
      success: true,
      analytics: {
        labels,
        datasets: [
          {
            label: "Page Views",
            data: pageViewData,
          },
          {
            label: "Visitors",
            data: visitorData,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
