import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SettingModel from "@/models/SettingModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

// Middleware function to check if the user is an admin
async function checkAdminAuth() {
  // Try both authentication methods
  const session = await getServerSession(authOptions);
  const currentUser = await getCurrentUser();

  // Check if user is authenticated and is an admin
  const isAdmin =
    session?.user?.role === "admin" || currentUser?.role === "admin";

  return { isAdmin, session, currentUser };
}

// GET /api/admin/settings - Get all website settings
export async function GET(req: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get all settings by category
    const generalSettings = await SettingModel.find({
      category: "general",
    }).lean();
    const contactSettings = await SettingModel.find({
      category: "contact",
    }).lean();
    const jobSettings = await SettingModel.find({ category: "jobs" }).lean();
    const seoSettings = await SettingModel.find({ category: "seo" }).lean();

    // Default settings values
    const defaultSettings = {
      general: {
        siteName: "GOA",
        siteDescription: "Global Office Automation",
        logo: "/logo.svg",
        favicon: "/favicon.ico",
        enableMaintenanceMode: false,
        maintenanceMessage:
          "Unsere Website wird gerade gewartet. Bitte versuchen Sie es später erneut.",
        googleAnalyticsId: "",
      },
      contact: {
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
      job: {
        enableApplications: true,
        notificationEmail: "jobs@goa.com",
        automaticResponses: true,
        applicationFormFields: {
          requireCoverLetter: true,
          requirePhone: true,
          requireResume: true,
        },
      },
      seo: {
        metaTitle: "GOA - Global Office Automation",
        metaDescription:
          "GOA bietet innovative Lösungen für moderne Büroautomation.",
        ogImage: "/og-image.jpg",
        enableSitemap: true,
        robotsTxt: "User-agent: *\nAllow: /",
      },
    };

    // Convert the MongoDB array format to key-value object
    function convertSettingsArrayToObject(settingsArray: any[]) {
      const result: Record<string, any> = {};
      settingsArray.forEach((setting) => {
        result[setting.key] = setting.value;
      });
      return result;
    }

    // Format settings for the frontend
    const settings = {
      general:
        generalSettings.length > 0
          ? convertSettingsArrayToObject(generalSettings)
          : defaultSettings.general,
      contact:
        contactSettings.length > 0
          ? convertSettingsArrayToObject(contactSettings)
          : defaultSettings.contact,
      job:
        jobSettings.length > 0
          ? convertSettingsArrayToObject(jobSettings)
          : defaultSettings.job,
      seo:
        seoSettings.length > 0
          ? convertSettingsArrayToObject(seoSettings)
          : defaultSettings.seo,
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
    const { isAdmin, session, currentUser } = await checkAdminAuth();

    if (!isAdmin) {
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

    // Get the user email from either auth method
    const userEmail = session?.user?.email || currentUser?.email;

    // Helper function to update or create settings
    async function updateSettings(
      categoryName: string,
      categorySettings: Record<string, any>
    ) {
      // First delete all existing settings for the category
      await SettingModel.deleteMany({ category: categoryName });

      // Then create new settings for each key
      const settingsToInsert = Object.entries(categorySettings).map(
        ([key, value]) => ({
          key,
          value,
          category: categoryName,
          label:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
          type: Array.isArray(value)
            ? "array"
            : typeof value === "object" && value !== null
            ? "object"
            : typeof value,
          updatedAt: new Date(),
        })
      );

      if (settingsToInsert.length > 0) {
        await SettingModel.insertMany(settingsToInsert);
      }
    }

    // Update settings for each category
    if (settings.general) {
      await updateSettings("general", settings.general);
    }

    if (settings.contact) {
      await updateSettings("contact", settings.contact);
    }

    if (settings.job) {
      await updateSettings("jobs", settings.job);
    }

    if (settings.seo) {
      await updateSettings("seo", settings.seo);
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
