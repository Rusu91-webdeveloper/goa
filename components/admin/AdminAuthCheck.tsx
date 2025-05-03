"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AdminAuthCheckProps {
  children: ReactNode;
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Use the dedicated admin check endpoint
        const response = await fetch("/api/auth/check-admin");

        if (!response.ok) {
          throw new Error(
            `Authentication check failed: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Check if the user is an admin using either authentication method
        const isAdminUser = data.authentication?.isAdmin;

        if (isAdminUser) {
          setIsAdmin(true);
        } else {
          console.error("User is not an admin:", data);
          setError("You do not have administrator privileges.");
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setError("An error occurred while verifying your admin status.");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-lg mb-2">Access Denied</div>
          <p className="text-gray-700">{error}</p>
          <p className="text-gray-500 text-sm mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
}
