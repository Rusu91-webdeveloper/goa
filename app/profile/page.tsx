"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n/i18n-context";
import { BadgeCheck, Calendar, Mail, Shield, HelpCircle } from "lucide-react";

interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Translation fallbacks
  const translations = {
    title: t("profile.title") || "Profile",
    role: t("profile.role") || "Role",
    emailVerified: t("profile.emailVerified") || "Email Verification",
    verified: t("profile.verified") || "Verified",
    notVerified: t("profile.notVerified") || "Not Verified",
    memberSince: t("profile.memberSince") || "Member Since",
    editProfile: t("profile.editProfile") || "Edit Profile",
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/profile");
        const data = await response.json();

        if (!data.success) {
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 mt-12">
        <Card className="max-w-2xl mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-blue-300 to-purple-300 h-32 animate-pulse"></div>
          <div className="px-6 -mt-16 relative">
            <div className="h-24 w-24 rounded-full bg-gray-300 animate-pulse border-4 border-white"></div>
          </div>

          <CardHeader className="pt-2">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="h-5 w-5 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2"></div>
                      <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-gray-50/50 px-6 py-4">
            <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 mt-12">
        <Card className="max-w-3xl mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-6 -mt-16 relative">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                  user.name || user.email
                }`}
              />
              <AvatarFallback className="text-lg">
                {user.name?.[0] || user.email[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardHeader className="pt-2">
            <CardTitle className="text-2xl font-bold">
              {user.name || user.email}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">{translations.role}</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <BadgeCheck
                          className={
                            user.isEmailVerified
                              ? "h-5 w-5 text-green-500"
                              : "h-5 w-5 text-red-500"
                          }
                        />
                        <HelpCircle className="h-3 w-3 ml-1 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 max-w-xs">
                      {user.isEmailVerified
                        ? "Your email has been verified. You have full access to all features."
                        : "Please verify your email to access all features."}
                    </TooltipContent>
                  </Tooltip>
                  <div>
                    <p className="text-sm text-gray-500">
                      {translations.emailVerified}
                    </p>
                    <p
                      className={
                        user.isEmailVerified
                          ? "font-medium text-green-600"
                          : "font-medium text-red-600"
                      }>
                      {user.isEmailVerified
                        ? translations.verified
                        : translations.notVerified}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {translations.memberSince}
                    </p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-gray-50/50 dark:bg-gray-800/10 px-6 py-4">
            <Button
              className="w-full sm:w-auto"
              onClick={() => router.push("/profile/edit")}>
              {translations.editProfile}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}
