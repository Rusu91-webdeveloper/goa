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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        const data = await response.json();

        if (!data.success) {
          router.push("/login");
          return;
        }

        setUser(data.user);
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("profile.updateSuccess"),
          description: t("profile.profileUpdated"),
          variant: "default",
        });

        // Add success message inside the form
        setProfileSuccessMessage(t("profile.profileUpdated"));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setProfileSuccessMessage("");
        }, 3000);
      } else {
        toast({
          title: t("profile.updateError"),
          description: data.message || t("profile.somethingWentWrong"),
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
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    });
    // Clear any previous errors when user types
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccessMessage("");

    const { currentPassword, newPassword, confirmNewPassword } =
      passwordFormData;

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError(t("profile.allFieldsRequired"));
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t("profile.passwordMismatch"));
      setChangingPassword(false);
      return;
    }

    // Basic password strength validation
    if (newPassword.length < 8) {
      setPasswordError(t("profile.passwordTooShort"));
      setChangingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("profile.passwordUpdateSuccess"),
          description: t("profile.passwordUpdated"),
          variant: "default",
        });

        // Set success message inside the form
        setPasswordSuccessMessage(t("profile.passwordUpdated"));

        // Reset form
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccessMessage("");
        }, 3000);
      } else {
        setPasswordError(data.message || t("profile.somethingWentWrong"));
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(t("profile.somethingWentWrong"));
    } finally {
      setChangingPassword(false);
    }
  };

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
          <CardTitle>{t("profile.editProfile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">
                {t("profile.personalInfo")}
              </TabsTrigger>
              <TabsTrigger value="password">
                {t("profile.changePassword")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {t("profile.firstName")}
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder={t("profile.firstNamePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder={t("profile.lastNamePlaceholder")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("profile.email")}</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                    <p className="text-sm text-gray-500">
                      {t("profile.emailNotEditable")}
                    </p>
                  </div>

                  {profileSuccessMessage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {profileSuccessMessage}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}>
                    {saving ? t("common.saving") : t("common.save")}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="password">
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {t("profile.currentPassword")}
                    </Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("profile.currentPasswordPlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t("profile.newPassword")}
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("profile.newPasswordPlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">
                      {t("profile.confirmNewPassword")}
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      type="password"
                      value={passwordFormData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder={t("profile.confirmPasswordPlaceholder")}
                    />
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {passwordError}
                      </div>
                    </div>
                  )}

                  {passwordSuccessMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {passwordSuccessMessage}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={changingPassword}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={changingPassword}>
                    {changingPassword
                      ? t("profile.changing")
                      : t("profile.changePassword")}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
