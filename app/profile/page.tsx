"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";

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
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 mt-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                  user.name || user.email
                }`}
              />
              <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name || user.email}</h2>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm mt-1">
                {t("profile.role")}: {user.role}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {t("profile.accountDetails")}
              </h3>
              <div className="space-y-2">
                <p>
                  {t("profile.emailVerified")}:{" "}
                  <span
                    className={
                      user.isEmailVerified ? "text-green-600" : "text-red-600"
                    }>
                    {user.isEmailVerified
                      ? t("profile.verified")
                      : t("profile.notVerified")}
                  </span>
                </p>
                <p>
                  {t("profile.memberSince")}:{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/profile/edit")}>
                {t("profile.editProfile")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
