"use client";

import { useState, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  Users,
  MessageSquare,
  Briefcase,
  Eye,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface StatData {
  total: number;
  change: number;
}

interface DashboardData {
  users: StatData;
  contacts: StatData;
  applications: StatData;
  pageViews: StatData;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  isLoading: boolean;
  changeText: string;
}

function StatCard({
  title,
  value,
  change,
  icon,
  isLoading,
  changeText,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse mt-1 rounded"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {value}
            </p>
          )}
        </div>
        <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-full">
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-4">
        {isLoading ? (
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <>
            <div
              className={`flex items-center ${
                isPositive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
              {isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {changeText}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translation variables
  const usersTitle = t("admin.stats.users") || "Users";
  const contactsTitle = t("admin.stats.contacts") || "Contact Requests";
  const applicationsTitle = t("admin.stats.applications") || "Applications";
  const pageViewsTitle = t("admin.stats.pageViews") || "Page Views";
  const changeText = t("admin.stats.sinceLastMonth") || "since last month";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard/stats");
        const result = await response.json();

        if (result.success) {
          setData(result.stats);
        } else {
          setError(result.message || "Failed to fetch dashboard stats");
        }
      } catch (err) {
        setError("An error occurred while fetching dashboard statistics");
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatNumber = (num: number): string => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title={usersTitle}
        value={data ? formatNumber(data.users.total) : "0"}
        change={data ? data.users.change : 0}
        icon={
          <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        }
        isLoading={isLoading}
        changeText={changeText}
      />
      <StatCard
        title={contactsTitle}
        value={data ? formatNumber(data.contacts.total) : "0"}
        change={data ? data.contacts.change : 0}
        icon={
          <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        }
        isLoading={isLoading}
        changeText={changeText}
      />
      <StatCard
        title={applicationsTitle}
        value={data ? formatNumber(data.applications.total) : "0"}
        change={data ? data.applications.change : 0}
        icon={
          <Briefcase className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        }
        isLoading={isLoading}
        changeText={changeText}
      />
      <StatCard
        title={pageViewsTitle}
        value={data ? formatNumber(data.pageViews.total) : "0"}
        change={data ? data.pageViews.change : 0}
        icon={<Eye className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
        isLoading={isLoading}
        changeText={changeText}
      />
    </div>
  );
}
