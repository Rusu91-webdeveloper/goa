import { getServerSession } from "next-auth/next";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/dashboard/UserDashboard";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";

export const metadata: Metadata = {
  title: "User Dashboard - GOA Erwachsenenbildung",
  description: "Manage your applications, services, and account settings.",
};

// Helper function to safely serialize anything to a plain JavaScript object
// This properly handles MongoDB ObjectId conversion to string
function safeSerialize<T>(obj: T): T {
  // First convert to string and then parse back to handle any MongoDB specific types
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // Handle MongoDB ObjectId or any other non-serializable values
      if (
        value &&
        typeof value === "object" &&
        value.toString &&
        key === "_id"
      ) {
        return value.toString();
      }
      return value;
    })
  );
}

export default async function DashboardPage() {
  // Try both authentication methods
  const session = await getServerSession(authOptions);
  const currentUser = await getCurrentUser();

  // Check if user is authenticated with either method
  if (!session?.user && !currentUser) {
    // Redirect to login if not authenticated
    redirect("/login?redirect=/dashboard");
  }

  // Build a clean user object from both session and currentUser
  const userInfo = {
    id:
      session?.user?.id || (currentUser?._id ? currentUser._id.toString() : ""),
    email: session?.user?.email || currentUser?.email || "",
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    name:
      session?.user?.name ||
      `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() ||
      "",
    role: session?.user?.role || currentUser?.role || "user",
  };

  // Validate user info
  if (!userInfo.id || !userInfo.email) {
    // If we have a session but missing critical info, redirect to complete profile
    return redirect("/profile/complete?redirect=/dashboard");
  }

  // Safely serialize the user object to avoid non-serializable properties
  const serializedUser = safeSerialize(userInfo);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            GOA Benutzerdashboard
          </h1>
          <p className="text-violet-100">
            Willkommen bei GOA Erwachsenenbildung. Hier können Sie Ihre Dienste
            verwalten, sich auf Jobs bewerben und Ihr Profil aktualisieren.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <Suspense fallback={<Loading />}>
            <UserDashboard user={serializedUser} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
