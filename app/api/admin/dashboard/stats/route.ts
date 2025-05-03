import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import ContactModel from "@/models/ContactModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Helper function to calculate percentage change
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// GET /api/admin/dashboard/stats - Get dashboard statistics
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

    // Calculate dates for current month and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const twoMonthsAgoStart = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    // Get total users count
    const totalUsers = await UserModel.countDocuments();

    // Get users registered this month
    const usersThisMonth = await UserModel.countDocuments({
      createdAt: { $gte: currentMonthStart },
    });

    // Get users registered last month
    const usersLastMonth = await UserModel.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart },
    });

    // Get contact requests
    const totalContacts = await ContactModel.countDocuments();

    // Get contacts this month
    const contactsThisMonth = await ContactModel.countDocuments({
      createdAt: { $gte: currentMonthStart },
    });

    // Get contacts last month
    const contactsLastMonth = await ContactModel.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart },
    });

    // For applications and page views, we'll create a placeholder implementation
    // In a real app, you would fetch this from your database
    const totalApplications = await UserModel.countDocuments({
      role: "applicant",
    });

    const applicationsThisMonth = await UserModel.countDocuments({
      role: "applicant",
      createdAt: { $gte: currentMonthStart },
    });

    const applicationsLastMonth = await UserModel.countDocuments({
      role: "applicant",
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart },
    });

    // Page views would typically come from an analytics service
    // For now, we'll use placeholder data
    const totalPageViews = 1000;
    const pageViewsThisMonth = 400;
    const pageViewsLastMonth = 350;

    // Calculate month-over-month changes
    const userChange = calculateChange(usersThisMonth, usersLastMonth);
    const contactChange = calculateChange(contactsThisMonth, contactsLastMonth);
    const applicationChange = calculateChange(
      applicationsThisMonth,
      applicationsLastMonth
    );
    const pageViewChange = calculateChange(
      pageViewsThisMonth,
      pageViewsLastMonth
    );

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          change: userChange,
        },
        contacts: {
          total: totalContacts,
          change: contactChange,
        },
        applications: {
          total: totalApplications,
          change: applicationChange,
        },
        pageViews: {
          total: totalPageViews,
          change: pageViewChange,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
