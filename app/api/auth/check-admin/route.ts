import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";

// GET /api/auth/check-admin - Check admin authentication status
export async function GET(req: NextRequest) {
  try {
    // Try both authentication methods
    const session = await getServerSession(authOptions);
    const currentUser = await getCurrentUser();

    // Check if the user is admin in either method
    const isNextAuthAdmin = session?.user?.role === "admin";
    const isTokenAdmin = currentUser?.role === "admin";
    const isAdmin = isNextAuthAdmin || isTokenAdmin;

    // Return detailed information about authentication status
    return NextResponse.json({
      success: true,
      authentication: {
        nextAuthSession: {
          authenticated: !!session,
          isAdmin: isNextAuthAdmin,
          user: session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
              }
            : null,
        },
        customAuth: {
          authenticated: !!currentUser,
          isAdmin: isTokenAdmin,
          user: currentUser
            ? {
                id: currentUser._id.toString(),
                email: currentUser.email,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                role: currentUser.role,
              }
            : null,
        },
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Error checking admin authentication:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
