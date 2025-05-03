"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  showSocialLinks: boolean;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
}

interface JobSettings {
  enableApplications: boolean;
  notificationEmail: string;
  automaticResponses: boolean;
  applicationFormFields: {
    requireCoverLetter: boolean;
    requirePhone: boolean;
    requireResume: boolean;
  };
}

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  enableMaintenanceMode: boolean;
  maintenanceMessage: string;
  googleAnalyticsId: string;
}

interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  enableSitemap: boolean;
  robotsTxt: string;
}

interface Settings {
  general: GeneralSettings;
  contact: ContactSettings;
  job: JobSettings;
  seo: SeoSettings;
}

export default function SettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      } else {
        console.error("Failed to fetch settings:", data.message);
        // Set default settings
        setSettings({
          general: {
            siteName: "GOA",
            siteDescription: "Global Office Automation",
            logo: "/logo.svg",
            favicon: "/favicon.ico",
            enableMaintenanceMode: false,
            maintenanceMessage:
              "Unsere Website wird gerade gewartet. Bitte versuchen Sie es später erneut.",
            googleAnalyticsId: "",
          },
          contact: {
            email: "info@goa.com",
            phone: "+49 123 456789",
            address: "Hauptstraße 1, 10178 Berlin",
            showSocialLinks: true,
            socialLinks: {
              facebook: "https://facebook.com/goa",
              instagram: "https://instagram.com/goa",
              linkedin: "https://linkedin.com/company/goa",
              twitter: "https://twitter.com/goa",
            },
          },
          job: {
            enableApplications: true,
            notificationEmail: "jobs@goa.com",
            automaticResponses: true,
            applicationFormFields: {
              requireCoverLetter: true,
              requirePhone: true,
              requireResume: true,
            },
          },
          seo: {
            metaTitle: "GOA - Global Office Automation",
            metaDescription:
              "GOA bietet innovative Lösungen für moderne Büroautomation.",
            ogImage: "/og-image.jpg",
            enableSitemap: true,
            robotsTxt: "User-agent: *\nAllow: /",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      // Handle file uploads if any
      if (logoFile || faviconFile || ogImageFile) {
        const formData = new FormData();

        if (logoFile) {
          formData.append("logo", logoFile);
        }

        if (faviconFile) {
          formData.append("favicon", faviconFile);
        }

        if (ogImageFile) {
          formData.append("ogImage", ogImageFile);
        }

        const uploadResponse = await fetch("/api/admin/uploads", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          if (uploadData.files.logo) {
            settings.general.logo = uploadData.files.logo;
          }

          if (uploadData.files.favicon) {
            settings.general.favicon = uploadData.files.favicon;
          }

          if (uploadData.files.ogImage) {
            settings.seo.ogImage = uploadData.files.ogImage;
          }
        }
      }

      // Save settings
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: t("admin.settings.success"),
          description: t("admin.settings.success.message"),
        });
        setLogoFile(null);
        setFaviconFile(null);
        setOgImageFile(null);
      } else {
        toast({
          title: t("admin.settings.error"),
          description: data.message || t("admin.settings.error.message"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t("admin.settings.error"),
        description: t("admin.settings.error.message"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon" | "ogImage"
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      switch (type) {
        case "logo":
          setLogoFile(file);
          break;
        case "favicon":
          setFaviconFile(file);
          break;
        case "ogImage":
          setOgImageFile(file);
          break;
      }
    }
  };

  const updateGeneralSettings = (
    key: keyof GeneralSettings,
    value: string | boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [key]: value,
      },
    });
  };

  const updateContactSettings = (
    key: keyof ContactSettings,
    value: string | boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      contact: {
        ...settings.contact,
        [key]: value,
      },
    });
  };

  const updateSocialLink = (
    network: keyof ContactSettings["socialLinks"],
    value: string
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      contact: {
        ...settings.contact,
        socialLinks: {
          ...settings.contact.socialLinks,
          [network]: value,
        },
      },
    });
  };

  const updateJobSettings = (
    key: keyof JobSettings,
    value: string | boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      job: {
        ...settings.job,
        [key]: value,
      },
    });
  };

  const updateApplicationField = (
    field: keyof JobSettings["applicationFormFields"],
    value: boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      job: {
        ...settings.job,
        applicationFormFields: {
          ...settings.job.applicationFormFields,
          [field]: value,
        },
      },
    });
  };

  const updateSeoSettings = (
    key: keyof SeoSettings,
    value: string | boolean
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      seo: {
        ...settings.seo,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Fehler beim Laden der Einstellungen.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.settings.title")}
          </h1>
          <p className="text-gray-500">{t("admin.settings.subtitle")}</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("admin.settings.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("admin.settings.save")}
            </>
          )}
        </Button>
      </div>

      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}>
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <TabsList className="grid grid-cols-4 gap-4">
              <TabsTrigger value="general">
                {t("admin.settings.general")}
              </TabsTrigger>
              <TabsTrigger value="contact">
                {t("admin.settings.contact")}
              </TabsTrigger>
              <TabsTrigger value="job">{t("admin.settings.job")}</TabsTrigger>
              <TabsTrigger value="seo">{t("admin.settings.seo")}</TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings Tab */}
          <TabsContent
            value="general"
            className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.general")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">
                      {t("admin.settings.general.siteName")}
                    </Label>
                    <Input
                      id="siteName"
                      value={settings?.general.siteName || ""}
                      onChange={(e) =>
                        updateGeneralSettings("siteName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">
                      {t("admin.settings.general.siteDescription")}
                    </Label>
                    <Textarea
                      id="siteDescription"
                      value={settings?.general.siteDescription || ""}
                      onChange={(e) =>
                        updateGeneralSettings("siteDescription", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.settings.general.logo")}</Label>
                    <div className="flex items-center space-x-4">
                      {settings?.general.logo && (
                        <img
                          src={settings.general.logo}
                          alt="Logo"
                          className="h-12 w-auto"
                        />
                      )}
                      <div className="flex-grow">
                        <div className="relative">
                          <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "logo")}
                          />
                          <Label
                            htmlFor="logo"
                            className="cursor-pointer flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded-md text-sm">
                            <UploadCloud size={16} />
                            {t("admin.settings.general.uploadLogo")}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.settings.general.favicon")}</Label>
                    <div className="flex items-center space-x-4">
                      {settings?.general.favicon && (
                        <img
                          src={settings.general.favicon}
                          alt="Favicon"
                          className="h-8 w-auto"
                        />
                      )}
                      <div className="flex-grow">
                        <div className="relative">
                          <Input
                            id="favicon"
                            type="file"
                            accept="image/x-icon,image/png"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "favicon")}
                          />
                          <Label
                            htmlFor="favicon"
                            className="cursor-pointer flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded-md text-sm">
                            <UploadCloud size={16} />
                            {t("admin.settings.general.uploadFavicon")}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={settings?.general.enableMaintenanceMode || false}
                      onCheckedChange={(checked) =>
                        updateGeneralSettings("enableMaintenanceMode", checked)
                      }
                    />
                    <Label htmlFor="maintenanceMode">
                      {t("admin.settings.general.maintenanceMode")}
                    </Label>
                  </div>

                  {settings?.general.enableMaintenanceMode && (
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceMessage">
                        {t("admin.settings.general.maintenanceMessage")}
                      </Label>
                      <Textarea
                        id="maintenanceMessage"
                        value={settings.general.maintenanceMessage || ""}
                        onChange={(e) =>
                          updateGeneralSettings(
                            "maintenanceMessage",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId">
                      {t("admin.settings.general.googleAnalytics")}
                    </Label>
                    <Input
                      id="googleAnalyticsId"
                      value={settings?.general.googleAnalyticsId || ""}
                      onChange={(e) =>
                        updateGeneralSettings(
                          "googleAnalyticsId",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings Tab */}
          <TabsContent
            value="contact"
            className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.contact")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("admin.settings.contact.email")}
                    </Label>
                    <Input
                      id="email"
                      value={settings?.contact.email || ""}
                      onChange={(e) =>
                        updateContactSettings("email", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t("admin.settings.contact.phone")}
                    </Label>
                    <Input
                      id="phone"
                      value={settings?.contact.phone || ""}
                      onChange={(e) =>
                        updateContactSettings("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t("admin.settings.contact.address")}
                    </Label>
                    <Textarea
                      id="address"
                      value={settings?.contact.address || ""}
                      onChange={(e) =>
                        updateContactSettings("address", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showSocialLinks"
                      checked={settings?.contact.showSocialLinks || false}
                      onCheckedChange={(checked) =>
                        updateContactSettings("showSocialLinks", checked)
                      }
                    />
                    <Label htmlFor="showSocialLinks">
                      {t("admin.settings.contact.showSocialLinks")}
                    </Label>
                  </div>

                  {settings?.contact.showSocialLinks && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        {t("admin.settings.contact.socialLinks")}
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">
                          {t("admin.settings.contact.facebook")}
                        </Label>
                        <Input
                          id="facebook"
                          value={settings?.contact.socialLinks?.facebook || ""}
                          onChange={(e) =>
                            updateSocialLink("facebook", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">
                          {t("admin.settings.contact.instagram")}
                        </Label>
                        <Input
                          id="instagram"
                          value={settings?.contact.socialLinks?.instagram || ""}
                          onChange={(e) =>
                            updateSocialLink("instagram", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">
                          {t("admin.settings.contact.linkedin")}
                        </Label>
                        <Input
                          id="linkedin"
                          value={settings?.contact.socialLinks?.linkedin || ""}
                          onChange={(e) =>
                            updateSocialLink("linkedin", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">
                          {t("admin.settings.contact.twitter")}
                        </Label>
                        <Input
                          id="twitter"
                          value={settings?.contact.socialLinks?.twitter || ""}
                          onChange={(e) =>
                            updateSocialLink("twitter", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Settings Tab */}
          <TabsContent
            value="job"
            className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.job")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableApplications"
                      checked={settings?.job.enableApplications || false}
                      onCheckedChange={(checked) =>
                        updateJobSettings("enableApplications", checked)
                      }
                    />
                    <Label htmlFor="enableApplications">
                      {t("admin.settings.job.enableApplications")}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail">
                      {t("admin.settings.job.notificationEmail")}
                    </Label>
                    <Input
                      id="notificationEmail"
                      value={settings?.job.notificationEmail || ""}
                      onChange={(e) =>
                        updateJobSettings("notificationEmail", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="automaticResponses"
                      checked={settings?.job.automaticResponses || false}
                      onCheckedChange={(checked) =>
                        updateJobSettings("automaticResponses", checked)
                      }
                    />
                    <Label htmlFor="automaticResponses">
                      {t("admin.settings.job.automaticResponses")}
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      {t("admin.settings.job.applicationFormFields")}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireCoverLetter"
                          checked={
                            settings?.job.applicationFormFields
                              ?.requireCoverLetter || false
                          }
                          onCheckedChange={(checked) =>
                            updateApplicationField(
                              "requireCoverLetter",
                              checked
                            )
                          }
                        />
                        <Label htmlFor="requireCoverLetter">
                          {t("admin.settings.job.requireCoverLetter")}
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requirePhone"
                          checked={
                            settings?.job.applicationFormFields?.requirePhone ||
                            false
                          }
                          onCheckedChange={(checked) =>
                            updateApplicationField("requirePhone", checked)
                          }
                        />
                        <Label htmlFor="requirePhone">
                          {t("admin.settings.job.requirePhone")}
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireResume"
                          checked={
                            settings?.job.applicationFormFields
                              ?.requireResume || false
                          }
                          onCheckedChange={(checked) =>
                            updateApplicationField("requireResume", checked)
                          }
                        />
                        <Label htmlFor="requireResume">
                          {t("admin.settings.job.requireResume")}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings Tab */}
          <TabsContent
            value="seo"
            className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.settings.seo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">
                      {t("admin.settings.seo.metaTitle")}
                    </Label>
                    <Input
                      id="metaTitle"
                      value={settings?.seo.metaTitle || ""}
                      onChange={(e) =>
                        updateSeoSettings("metaTitle", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">
                      {t("admin.settings.seo.metaDescription")}
                    </Label>
                    <Textarea
                      id="metaDescription"
                      value={settings?.seo.metaDescription || ""}
                      onChange={(e) =>
                        updateSeoSettings("metaDescription", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.settings.seo.ogImage")}</Label>
                    <div className="flex items-center space-x-4">
                      {settings?.seo.ogImage && (
                        <img
                          src={settings.seo.ogImage}
                          alt="OG Image"
                          className="h-16 w-auto rounded"
                        />
                      )}
                      <div className="flex-grow">
                        <div className="relative">
                          <Input
                            id="ogImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "ogImage")}
                          />
                          <Label
                            htmlFor="ogImage"
                            className="cursor-pointer flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded-md text-sm">
                            <UploadCloud size={16} />
                            {t("admin.settings.seo.uploadOgImage")}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableSitemap"
                      checked={settings?.seo.enableSitemap || false}
                      onCheckedChange={(checked) =>
                        updateSeoSettings("enableSitemap", checked)
                      }
                    />
                    <Label htmlFor="enableSitemap">
                      {t("admin.settings.seo.enableSitemap")}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="robotsTxt">
                      {t("admin.settings.seo.robotsTxt")}
                    </Label>
                    <Textarea
                      id="robotsTxt"
                      value={settings?.seo.robotsTxt || ""}
                      onChange={(e) =>
                        updateSeoSettings("robotsTxt", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </AdminLayout>
  );
}
