import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

// POST /api/admin/uploads - Upload files
export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const uploadedFiles: Record<string, string> = {};

    // Handle logo upload
    const logo = formData.get("logo") as File;
    if (logo) {
      const fileName = await saveFile(logo, "logos");
      uploadedFiles.logo = `/uploads/logos/${fileName}`;
    }

    // Handle favicon upload
    const favicon = formData.get("favicon") as File;
    if (favicon) {
      const fileName = await saveFile(favicon, "favicons");
      uploadedFiles.favicon = `/uploads/favicons/${fileName}`;
    }

    // Handle ogImage upload
    const ogImage = formData.get("ogImage") as File;
    if (ogImage) {
      const fileName = await saveFile(ogImage, "og-images");
      uploadedFiles.ogImage = `/uploads/og-images/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to save a file
async function saveFile(file: File, subDirectory: string): Promise<string> {
  // Create a unique filename with timestamp
  const timestamp = new Date().getTime();
  const fileName = `${timestamp}-${file.name.replace(/\s+/g, "-")}`;

  // Create the upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "public", "uploads", subDirectory);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error(`Error creating upload directory: ${err}`);
  }

  // Write the file to the uploads directory
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return fileName;
}
