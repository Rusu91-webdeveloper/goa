"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import AdminAuthCheck from "./AdminAuthCheck";
import { useI18n } from "@/lib/i18n/i18n-context";
import LanguageSwitcher from "../language-switcher";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useI18n();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigation = [
    {
      name: t("admin.navigation.dashboard") || "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("admin.navigation.users") || "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: t("admin.navigation.contacts") || "Contacts",
      href: "/admin/contacts",
      icon: MessageSquare,
    },
    {
      name: t("admin.navigation.applications") || "Applications",
      href: "/admin/applications",
      icon: Briefcase,
    },
    {
      name: t("admin.navigation.analytics") || "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      name: t("admin.navigation.settings") || "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <AdminAuthCheck>
      <div className="flex h-screen bg-gray-100">
        {/* Mobile sidebar toggle */}
        <div className="fixed top-0 left-0 z-40 md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-4 text-gray-600 focus:outline-none focus:bg-gray-100"
            aria-label={
              isSidebarOpen
                ? t("admin.closeSidebar") || "Close sidebar"
                : t("admin.openSidebar") || "Open sidebar"
            }>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 bg-emerald-700 text-white">
              <h2 className="text-xl font-bold">GOA Admin</h2>
              <div className="text-white">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}>
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-emerald-700" : "text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200">
              <Link
                href="/api/auth/logout"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                <LogOut
                  className="mr-3 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                {t("admin.logout") || "Logout"}
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:ml-64">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>

        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}></div>
        )}
      </div>
    </AdminAuthCheck>
  );
}
