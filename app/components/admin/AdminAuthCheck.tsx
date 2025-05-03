"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-admin");

        if (!response.ok) {
          throw new Error("Failed to verify admin access");
        }

        const data = await response.json();

        if (data.success && data.authentication.isAdmin) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
          setError("You do not have admin privileges");
          // Redirect after a delay to show the error message
          setTimeout(() => router.push("/login"), 2000);
        }
      } catch (err) {
        console.error("Admin auth check error:", err);
        setIsVerified(false);
        setError("Authentication verification failed");
        // Redirect after a delay
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    checkAdminAuth();
  }, [router]);

  if (isVerified === null) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-lg">Verifying access...</span>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <div className="rounded bg-red-100 p-4 text-red-700">
          <p className="font-semibold">{error}</p>
          <p className="text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
