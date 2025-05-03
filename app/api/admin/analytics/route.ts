import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import JobApplication from "@/models/JobApplication";
import PageView from "@/models/PageView";
import Visitor from "@/models/Visitor";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/admin/analytics - Get analytics data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30d"; // Default to 30 days

    await connectToDatabase();

    // Calculate date range based on timeRange parameter
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "6m":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "12m":
        startDate.setMonth(endDate.getMonth() - 12);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get analytics data
    const analytics = {
      visitors: await getVisitorAnalytics(startDate, endDate),
      pageViews: await getPageViewAnalytics(startDate, endDate),
      interactions: await getInteractionAnalytics(startDate, endDate),
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get visitor analytics
async function getVisitorAnalytics(startDate: Date, endDate: Date) {
  // For a production app, this would be querying the database for real visitor data
  // As a placeholder, we'll return fake data based on the date range

  // Calculate date ranges for various time periods
  const dailyStartDate = new Date(endDate);
  dailyStartDate.setDate(dailyStartDate.getDate() - 6); // Last 7 days

  const weeklyStartDate = new Date(endDate);
  weeklyStartDate.setDate(weeklyStartDate.getDate() - 28); // Last 4 weeks

  const monthlyStartDate = new Date(endDate);
  monthlyStartDate.setMonth(monthlyStartDate.getMonth() - 5); // Last 6 months

  try {
    // In a real application, we would query the database for this data
    // For now, we'll generate placeholder data

    // Generate daily visitors (last 7 days)
    const daily = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(dailyStartDate);
      date.setDate(date.getDate() + i);
      return {
        name: date.toLocaleDateString("de-DE", { weekday: "short" }),
        value: Math.floor(Math.random() * 500 + 500), // Total visits
        unique: Math.floor(Math.random() * 300 + 200), // Unique visitors
      };
    });

    // Generate weekly visitors (last 4 weeks)
    const weekly = Array.from({ length: 4 }, (_, i) => {
      return {
        name: `Woche ${i + 1}`,
        value: Math.floor(Math.random() * 2000 + 3000),
        unique: Math.floor(Math.random() * 1000 + 1500),
      };
    });

    // Generate monthly visitors (last 6 months)
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(monthlyStartDate);
      date.setMonth(date.getMonth() + i);
      return {
        name: date.toLocaleDateString("de-DE", { month: "short" }),
        value: Math.floor(Math.random() * 8000 + 6000),
        unique: Math.floor(Math.random() * 4000 + 3000),
      };
    });

    return { daily, weekly, monthly };
  } catch (error) {
    console.error("Error generating visitor analytics:", error);
    throw error;
  }
}

// Helper function to get page view analytics
async function getPageViewAnalytics(startDate: Date, endDate: Date) {
  try {
    // In a real application, we would query the database for this data
    // For now, we'll return placeholder data

    // Top pages by views
    const topPages = [
      { name: "Startseite", views: 4253 },
      { name: "Über Uns", views: 2164 },
      { name: "Karriere", views: 1879 },
      { name: "Dienstleistungen", views: 1563 },
      { name: "Kontakt", views: 986 },
    ];

    // Device distribution
    const byDevice = [
      { name: "Desktop", value: 58 },
      { name: "Mobile", value: 34 },
      { name: "Tablet", value: 8 },
    ];

    return { topPages, byDevice };
  } catch (error) {
    console.error("Error generating page view analytics:", error);
    throw error;
  }
}

// Helper function to get interaction analytics
async function getInteractionAnalytics(startDate: Date, endDate: Date) {
  try {
    // In a real implementation, we would:
    // 1. Get contact forms submitted in the date range
    // 2. Get job applications submitted in the date range
    // 3. Format the data for charts

    // For now, we'll generate placeholder data

    // Contact form submissions by month
    const contactForms = [
      { name: "Jan", value: 12 },
      { name: "Feb", value: 19 },
      { name: "Mär", value: 15 },
      { name: "Apr", value: 21 },
      { name: "Mai", value: 25 },
      { name: "Jun", value: 18 },
    ];

    // Job applications by month
    const applications = [
      { name: "Jan", value: 5 },
      { name: "Feb", value: 8 },
      { name: "Mär", value: 6 },
      { name: "Apr", value: 9 },
      { name: "Mai", value: 12 },
      { name: "Jun", value: 7 },
    ];

    return { contactForms, applications };
  } catch (error) {
    console.error("Error generating interaction analytics:", error);
    throw error;
  }
}
