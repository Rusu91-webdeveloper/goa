"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ServiceBooking from "./ServiceBooking";
import JobApplications from "./JobApplications";
import MyBookings from "./MyBookings";
import MyApplications from "./MyApplications";
import UserProfile from "./UserProfile";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  Calendar,
  UserRound,
  Briefcase,
  CalendarCheck,
  FileCheck2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/components/ui/loading";
import { useRouter } from "next/navigation";

interface UserDashboardProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("services");
  const [isLoading, setIsLoading] = useState(false);
  const [hasBookings, setHasBookings] = useState(false);
  const [hasApplications, setHasApplications] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Determine user's display name
  const userName =
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email;

  // Check if user has any bookings or applications
  useEffect(() => {
    const checkUserActivity = async () => {
      if (!user.id) return;

      setIsLoading(true);
      try {
        // Check for bookings
        const bookingsRes = await fetch("/api/service-bookings");
        if (bookingsRes.status === 401) {
          setAuthError(true);
          // Handle session expiration
          setTimeout(() => {
            router.push("/login?redirect=/dashboard");
          }, 1500);
          return;
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setHasBookings(bookingsData.data && bookingsData.data.length > 0);
        }

        // Check for applications
        const applicationsRes = await fetch("/api/job-applications");
        if (applicationsRes.status === 401) {
          setAuthError(true);
          // Handle session expiration
          setTimeout(() => {
            router.push("/login?redirect=/dashboard");
          }, 1500);
          return;
        }

        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          setHasApplications(
            applicationsData.data && applicationsData.data.length > 0
          );
        }
      } catch (error) {
        console.error("Error checking user activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserActivity();
  }, [user.id, router]);

  // Handle data refresh after a new booking or application
  const handleDataUpdate = async (type: "booking" | "application") => {
    if (type === "booking") {
      setHasBookings(true);
      toast({
        title: t("dashboard.services.bookingSuccess"),
        description: t("dashboard.services.bookingConfirmation"),
      });
    } else {
      setHasApplications(true);
      toast({
        title: t("dashboard.jobs.applicationSuccess"),
        description: t("dashboard.jobs.applicationConfirmation"),
      });
    }
  };

  if (authError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t("auth.sessionExpired")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t("auth.sessionExpiredMessage")}
        </p>
        <div className="mt-4 animate-pulse">
          <Loading text={t("auth.redirecting")} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">
          {t("dashboard.welcome")}, {userName}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <Loading text={t("common.loading")} />
      ) : (
        <Tabs
          defaultValue="services"
          value={activeTab}
          onValueChange={setActiveTab}>
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
                <TabsTrigger
                  value="services"
                  className="flex items-center justify-center py-2 md:py-3">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">
                    {t("dashboard.services")}
                  </span>
                  <span className="md:hidden">
                    {t("dashboard.shortServices")}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="flex items-center justify-center py-2 md:py-3">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">
                    {t("dashboard.jobs")}
                  </span>
                  <span className="md:hidden">{t("dashboard.shortJobs")}</span>
                </TabsTrigger>
                {hasBookings && (
                  <TabsTrigger
                    value="my-bookings"
                    className="flex items-center justify-center py-2 md:py-3">
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">
                      {t("dashboard.myBookings")}
                    </span>
                    <span className="md:hidden">
                      {t("dashboard.shortBookings")}
                    </span>
                  </TabsTrigger>
                )}
                {hasApplications && (
                  <TabsTrigger
                    value="my-applications"
                    className="flex items-center justify-center py-2 md:py-3">
                    <FileCheck2 className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">
                      {t("dashboard.myApplications")}
                    </span>
                    <span className="md:hidden">
                      {t("dashboard.shortApps")}
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="profile"
                  className="flex items-center justify-center py-2 md:py-3">
                  <UserRound className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">
                    {t("dashboard.profile")}
                  </span>
                  <span className="md:hidden">
                    {t("dashboard.shortProfile")}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="services"
              className="p-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl text-violet-700 dark:text-violet-400">
                    {t("dashboard.services.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("dashboard.services.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pt-4">
                  <ServiceBooking
                    userId={user.id || ""}
                    onBookingCreated={() => handleDataUpdate("booking")}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="jobs"
              className="p-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl text-violet-700 dark:text-violet-400">
                    {t("dashboard.jobs.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("dashboard.jobs.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pt-4">
                  <JobApplications
                    userId={user.id || ""}
                    onApplicationSubmitted={() =>
                      handleDataUpdate("application")
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {hasBookings && (
              <TabsContent
                value="my-bookings"
                className="p-6">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl text-violet-700 dark:text-violet-400">
                      {t("dashboard.myBookings.title")}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {t("dashboard.myBookings.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pt-4">
                    <MyBookings userId={user.id || ""} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {hasApplications && (
              <TabsContent
                value="my-applications"
                className="p-6">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl text-violet-700 dark:text-violet-400">
                      {t("dashboard.myApplications.title")}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {t("dashboard.myApplications.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pt-4">
                    <MyApplications userId={user.id || ""} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent
              value="profile"
              className="p-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl text-violet-700 dark:text-violet-400">
                    {t("dashboard.profile.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("dashboard.profile.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pt-4">
                  <UserProfile user={user} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
