"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";

interface Contact {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  status: "new" | "in-progress" | "completed";
}

export default function RecentContacts() {
  const { t } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translations
  const title = t("admin.contacts.recentTitle") || "Recent Contact Requests";
  const viewAll = t("admin.contacts.viewAll") || "View all contact requests";
  const nameLabel = t("admin.contacts.name") || "Name";
  const emailLabel = t("admin.contacts.email") || "Email";
  const serviceLabel = t("admin.contacts.service") || "Service";
  const dateLabel = t("admin.contacts.date") || "Date";
  const statusLabel = t("admin.contacts.status") || "Status";
  const statusNew = t("admin.contacts.statusNew") || "New";
  const statusInProgress =
    t("admin.contacts.statusInProgress") || "In Progress";
  const statusCompleted = t("admin.contacts.statusCompleted") || "Completed";
  const loadingText = t("admin.loading") || "Loading...";
  const noContactsText =
    t("admin.contacts.noContacts") || "No contact requests found";

  useEffect(() => {
    const fetchRecentContacts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard/recent-contacts");
        const result = await response.json();

        if (result.success) {
          setContacts(result.contacts);
        } else {
          setError(result.message || "Failed to fetch contact requests");
        }
      } catch (err) {
        setError("An error occurred while fetching contact requests");
        console.error("Error fetching recent contacts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentContacts();
  }, []);

  // Function to get the translated status text based on status value
  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return statusNew;
      case "in-progress":
        return statusInProgress;
      case "completed":
        return statusCompleted;
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
                {serviceLabel}
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
            ) : contacts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {noContactsText}
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {contact.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.service}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contact.status === "new"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : contact.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                      {getStatusText(contact.status)}
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
          href="/admin/contacts"
          className="text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300">
          {viewAll}
        </Link>
      </div>
    </div>
  );
}
