import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/admin/settings - Get all website settings
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

    await connectToDatabase();

    // Get all settings
    const generalSettings =
      (await Setting.findOne({ category: "general" }).lean()) || {};
    const contactSettings =
      (await Setting.findOne({ category: "contact" }).lean()) || {};
    const jobSettings =
      (await Setting.findOne({ category: "job" }).lean()) || {};
    const seoSettings =
      (await Setting.findOne({ category: "seo" }).lean()) || {};

    // Format settings for the frontend
    const settings = {
      general: generalSettings.settings || {
        siteName: "GOA",
        siteDescription: "Global Office Automation",
        logo: "/logo.svg",
        favicon: "/favicon.ico",
        enableMaintenanceMode: false,
        maintenanceMessage:
          "Unsere Website wird gerade gewartet. Bitte versuchen Sie es später erneut.",
        googleAnalyticsId: "",
      },
      contact: contactSettings.settings || {
        email: "info@goa.com",
        phone: "+49 123 456789",
        address: "Hauptstraße 1, 10178 Berlin",
        showSocialLinks: true,
        socialLinks: {
          facebook: "https://facebook.com/goa",
          instagram: "https://instagram.com/goa",
          linkedin: "https://linkedin.com/company/goa",
          twitter: "https://twitter.com/goa",
        },
      },
      job: jobSettings.settings || {
        enableApplications: true,
        notificationEmail: "jobs@goa.com",
        automaticResponses: true,
        applicationFormFields: {
          requireCoverLetter: true,
          requirePhone: true,
          requireResume: true,
        },
      },
      seo: seoSettings.settings || {
        metaTitle: "GOA - Global Office Automation",
        metaDescription:
          "GOA bietet innovative Lösungen für moderne Büroautomation.",
        ogImage: "/og-image.jpg",
        enableSitemap: true,
        robotsTxt: "User-agent: *\nAllow: /",
      },
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update website settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { settings } = await req.json();

    if (!settings) {
      return NextResponse.json(
        { success: false, message: "Settings data is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update or create settings for each category
    if (settings.general) {
      await Setting.findOneAndUpdate(
        { category: "general" },
        {
          category: "general",
          settings: settings.general,
          updatedBy: session.user.email,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    }

    if (settings.contact) {
      await Setting.findOneAndUpdate(
        { category: "contact" },
        {
          category: "contact",
          settings: settings.contact,
          updatedBy: session.user.email,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    }

    if (settings.job) {
      await Setting.findOneAndUpdate(
        { category: "job" },
        {
          category: "job",
          settings: settings.job,
          updatedBy: session.user.email,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    }

    if (settings.seo) {
      await Setting.findOneAndUpdate(
        { category: "seo" },
        {
          category: "seo",
          settings: settings.seo,
          updatedBy: session.user.email,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
