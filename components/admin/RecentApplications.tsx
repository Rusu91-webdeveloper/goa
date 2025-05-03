"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  date: string;
  status: "new" | "reviewing" | "interviewed" | "hired" | "rejected";
}

export default function RecentApplications() {
  const { t } = useI18n();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translations
  const title = t("admin.applications.recentTitle") || "Recent Applications";
  const viewAll = t("admin.applications.viewAll") || "View all applications";
  const nameLabel = t("admin.applications.name") || "Name";
  const emailLabel = t("admin.applications.email") || "Email";
  const positionLabel = t("admin.applications.position") || "Position";
  const dateLabel = t("admin.applications.date") || "Date";
  const statusLabel = t("admin.applications.status") || "Status";
  const statusNew = t("admin.applications.statusNew") || "New";
  const statusReviewing =
    t("admin.applications.statusReviewing") || "Reviewing";
  const statusInterviewed =
    t("admin.applications.statusInterviewed") || "Interviewed";
  const statusHired = t("admin.applications.statusHired") || "Hired";
  const statusRejected = t("admin.applications.statusRejected") || "Rejected";
  const loadingText = t("admin.loading") || "Loading...";
  const noApplicationsText =
    t("admin.applications.noApplications") || "No applications found";

  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "/api/admin/dashboard/recent-applications"
        );
        const result = await response.json();

        if (result.success) {
          setApplications(result.applications);
        } else {
          setError(result.message || "Failed to fetch applications");
        }
      } catch (err) {
        setError("An error occurred while fetching applications");
        console.error("Error fetching recent applications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentApplications();
  }, []);

  // Function to get the translated status text based on status value
  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return statusNew;
      case "reviewing":
        return statusReviewing;
      case "interviewed":
        return statusInterviewed;
      case "hired":
        return statusHired;
      case "rejected":
        return statusRejected;
      default:
        return statusNew;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {nameLabel}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {emailLabel}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {positionLabel}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {dateLabel}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {statusLabel}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center">
                  <div className="animate-pulse text-gray-500 dark:text-gray-400">
                    {loadingText}
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center">
                  <div className="text-red-500">{error}</div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {noApplicationsText}
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr
                  key={application.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {application.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {application.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {application.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {application.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === "new"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : application.status === "reviewing"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : application.status === "interviewed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : application.status === "hired"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                      {getStatusText(application.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/admin/applications"
          className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300">
          {viewAll}
        </Link>
      </div>
    </div>
  );
}
