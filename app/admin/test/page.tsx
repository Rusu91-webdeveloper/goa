"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";

export default function AdminTestPage() {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">(
    "loading"
  );
  const [collections, setCollections] = useState<string[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/admin/db-status");

        if (!response.ok) {
          throw new Error("Failed to fetch database status");
        }

        const data = await response.json();
        setDbStatus("connected");
        setCollections(data.collections || []);
        setUserCount(data.userCount || 0);
      } catch (err) {
        setDbStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    checkDbStatus();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Database Connection Test
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Verify your MongoDB connection is working properly
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Connection Status
          </h2>
          <div className="mt-2">
            {dbStatus === "loading" && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-600 mr-2"></div>
                <span className="text-gray-500 dark:text-gray-400">
                  Testing connection...
                </span>
              </div>
            )}

            {dbStatus === "connected" && (
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-green-600 dark:text-green-400">
                  Connected to MongoDB
                </span>
              </div>
            )}

            {dbStatus === "error" && (
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                <span className="text-red-600 dark:text-red-400">
                  Connection error: {error}
                </span>
              </div>
            )}
          </div>
        </div>

        {dbStatus === "connected" && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Database Collections
              </h2>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                {collections.map((collection) => (
                  <div
                    key={collection}
                    className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                    {collection}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                User Information
              </h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Total users in database: {userCount}
              </p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
