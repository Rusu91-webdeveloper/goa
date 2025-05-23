"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardStats from "@/components/admin/DashboardStats";
import RecentContacts from "@/components/admin/RecentContacts";
import RecentApplications from "@/components/admin/RecentApplications";
import AnalyticsChart from "@/components/admin/AnalyticsChart";

export default function AdminDashboardPage() {
  const { t } = useI18n();

  // Translation variables
  const dashboardTitle = t("admin.dashboard.title") || "Dashboard";
  const dashboardSubtitle =
    t("admin.dashboard.subtitle") ||
    "Overview of all important metrics and activities";

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {dashboardTitle}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{dashboardSubtitle}</p>
      </div>

      <DashboardStats />

      <div className="mt-8">
        <AnalyticsChart />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentContacts />
        <RecentApplications />
      </div>
    </AdminLayout>
  );
}
