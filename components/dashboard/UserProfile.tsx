"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { toast } from "@/components/ui/use-toast";
import { UserRound } from "lucide-react";

interface UserProfileProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (response.ok) {
        toast({
          title: t("profile.updateSuccess"),
          description: t("profile.profileUpdated"),
        });
      } else {
        toast({
          title: t("profile.updateError"),
          description: t("profile.somethingWentWrong"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("profile.updateError"),
        description: t("profile.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast({
        title: t("profile.updateError"),
        description: t("profile.allFieldsRequired"),
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: t("profile.updateError"),
        description: t("profile.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: t("profile.updateError"),
        description: t("profile.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: t("profile.passwordUpdateSuccess"),
          description: t("profile.passwordUpdated"),
        });

        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const data = await response.json();
        toast({
          title: t("profile.updateError"),
          description: data.message || t("profile.somethingWentWrong"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: t("profile.updateError"),
        description: t("profile.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-violet-50 dark:bg-violet-900/20">
          <CardTitle className="text-xl flex items-center text-violet-700 dark:text-violet-300">
            <UserRound className="h-5 w-5 mr-2 text-violet-600 dark:text-violet-400" />
            {t("profile.personalInfo")}
          </CardTitle>
          <CardDescription>{t("profile.editProfile")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleProfileUpdate}
            className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="font-medium">
                  {t("profile.firstName")}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t("profile.firstNamePlaceholder")}
                  className="border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="font-medium">
                  {t("profile.lastName")}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t("profile.lastNamePlaceholder")}
                  className="border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-medium">
                {t("profile.email")}
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("profile.emailNotEditable")}
              </p>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("profile.changing")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t("profile.editProfile")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-violet-50 dark:bg-violet-900/20">
          <CardTitle className="text-xl flex items-center text-violet-700 dark:text-violet-300">
            <Lock className="h-5 w-5 mr-2 text-violet-600 dark:text-violet-400" />
            {t("profile.changePassword")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handlePasswordChange}
            className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="font-medium">
                {t("profile.currentPassword")}
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder={t("profile.currentPasswordPlaceholder")}
                className="border-gray-300 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="font-medium">
                {t("profile.newPassword")}
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={t("profile.newPasswordPlaceholder")}
                className="border-gray-300 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="font-medium">
                {t("profile.confirmNewPassword")}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("profile.confirmPasswordPlaceholder")}
                className="border-gray-300 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("profile.changing")}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t("profile.changePassword")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
