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
          title: "Erfolg",
          description: "Die Einstellungen wurden erfolgreich gespeichert.",
        });
        setLogoFile(null);
        setFaviconFile(null);
        setOgImageFile(null);
      } else {
        toast({
          title: "Fehler",
          description:
            data.message ||
            "Beim Speichern der Einstellungen ist ein Fehler aufgetreten.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Fehler",
        description:
          "Beim Speichern der Einstellungen ist ein Fehler aufgetreten.",
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
          <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-gray-500">
            Konfigurieren Sie Ihre Website-Einstellungen
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </div>

      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="job">Stellenangebote</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>
                Grundlegende Einstellungen für Ihre Website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Website-Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      updateGeneralSettings("siteName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Website-Beschreibung</Label>
                  <Input
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) =>
                      updateGeneralSettings("siteDescription", e.target.value)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    {settings.general.logo && (
                      <img
                        src={settings.general.logo}
                        alt="Logo"
                        className="w-16 h-16 object-contain border rounded p-1"
                      />
                    )}
                    <div className="flex-1">
                      <Label
                        htmlFor="logo-upload"
                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                        <UploadCloud className="w-6 h-6 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          {logoFile ? logoFile.name : "Logo hochladen"}
                        </span>
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "logo")}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-4">
                    {settings.general.favicon && (
                      <img
                        src={settings.general.favicon}
                        alt="Favicon"
                        className="w-8 h-8 object-contain border rounded p-1"
                      />
                    )}
                    <div className="flex-1">
                      <Label
                        htmlFor="favicon-upload"
                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                        <UploadCloud className="w-6 h-6 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          {faviconFile ? faviconFile.name : "Favicon hochladen"}
                        </span>
                      </Label>
                      <Input
                        id="favicon-upload"
                        type="file"
                        accept="image/x-icon,image/png"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "favicon")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={settings.general.googleAnalyticsId}
                  onChange={(e) =>
                    updateGeneralSettings("googleAnalyticsId", e.target.value)
                  }
                  placeholder="z.B. G-XXXXXXXXXX oder UA-XXXXXXXX-X"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Wartungsmodus</Label>
                    <p className="text-sm text-gray-500">
                      Aktivieren Sie den Wartungsmodus, um Ihre Website
                      vorübergehend zu sperren.
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={settings.general.enableMaintenanceMode}
                    onCheckedChange={(checked) =>
                      updateGeneralSettings("enableMaintenanceMode", checked)
                    }
                  />
                </div>

                {settings.general.enableMaintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMessage">Wartungsmeldung</Label>
                    <Textarea
                      id="maintenanceMessage"
                      value={settings.general.maintenanceMessage}
                      onChange={(e) =>
                        updateGeneralSettings(
                          "maintenanceMessage",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Kontakteinstellungen</CardTitle>
              <CardDescription>
                Kontaktinformationen und soziale Medien
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Kontakt-E-Mail</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) =>
                      updateContactSettings("email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefonnummer</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contact.phone}
                    onChange={(e) =>
                      updateContactSettings("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactAddress">Adresse</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contact.address}
                  onChange={(e) =>
                    updateContactSettings("address", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showSocialLinks">
                      Soziale Medien anzeigen
                    </Label>
                    <p className="text-sm text-gray-500">
                      Zeigen Sie Links zu Ihren sozialen Medien auf der Website
                      an.
                    </p>
                  </div>
                  <Switch
                    id="showSocialLinks"
                    checked={settings.contact.showSocialLinks}
                    onCheckedChange={(checked) =>
                      updateContactSettings("showSocialLinks", checked)
                    }
                  />
                </div>

                {settings.contact.showSocialLinks && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={settings.contact.socialLinks.facebook}
                        onChange={(e) =>
                          updateSocialLink("facebook", e.target.value)
                        }
                        placeholder="https://facebook.com/ihre-seite"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={settings.contact.socialLinks.instagram}
                        onChange={(e) =>
                          updateSocialLink("instagram", e.target.value)
                        }
                        placeholder="https://instagram.com/ihr-account"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={settings.contact.socialLinks.linkedin}
                        onChange={(e) =>
                          updateSocialLink("linkedin", e.target.value)
                        }
                        placeholder="https://linkedin.com/company/ihre-firma"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={settings.contact.socialLinks.twitter}
                        onChange={(e) =>
                          updateSocialLink("twitter", e.target.value)
                        }
                        placeholder="https://twitter.com/ihr-account"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job">
          <Card>
            <CardHeader>
              <CardTitle>Stellenangebote-Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie den Bewerbungsprozess
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableApplications">
                    Bewerbungen aktivieren
                  </Label>
                  <p className="text-sm text-gray-500">
                    Aktivieren Sie Online-Bewerbungen auf Ihrer Website.
                  </p>
                </div>
                <Switch
                  id="enableApplications"
                  checked={settings.job.enableApplications}
                  onCheckedChange={(checked) =>
                    updateJobSettings("enableApplications", checked)
                  }
                />
              </div>

              {settings.job.enableApplications && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail">
                      Benachrichtigungs-E-Mail
                    </Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={settings.job.notificationEmail}
                      onChange={(e) =>
                        updateJobSettings("notificationEmail", e.target.value)
                      }
                      placeholder="bewerbungen@ihre-firma.de"
                    />
                    <p className="text-xs text-gray-500">
                      An diese E-Mail-Adresse werden Benachrichtigungen über
                      neue Bewerbungen gesendet.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="automaticResponses">
                        Automatische Antworten
                      </Label>
                      <p className="text-sm text-gray-500">
                        Senden Sie automatische Bestätigungsmails nach dem
                        Eingang von Bewerbungen.
                      </p>
                    </div>
                    <Switch
                      id="automaticResponses"
                      checked={settings.job.automaticResponses}
                      onCheckedChange={(checked) =>
                        updateJobSettings("automaticResponses", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Pflichtfelder im Bewerbungsformular
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireCoverLetter">Anschreiben</Label>
                        <Switch
                          id="requireCoverLetter"
                          checked={
                            settings.job.applicationFormFields
                              .requireCoverLetter
                          }
                          onCheckedChange={(checked) =>
                            updateApplicationField(
                              "requireCoverLetter",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requirePhone">Telefonnummer</Label>
                        <Switch
                          id="requirePhone"
                          checked={
                            settings.job.applicationFormFields.requirePhone
                          }
                          onCheckedChange={(checked) =>
                            updateApplicationField("requirePhone", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="requireResume">Lebenslauf-Upload</Label>
                        <Switch
                          id="requireResume"
                          checked={
                            settings.job.applicationFormFields.requireResume
                          }
                          onCheckedChange={(checked) =>
                            updateApplicationField("requireResume", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO-Einstellungen</CardTitle>
              <CardDescription>
                Suchmaschinenoptimierung und soziale Medien
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta-Titel</Label>
                  <Input
                    id="metaTitle"
                    value={settings.seo.metaTitle}
                    onChange={(e) =>
                      updateSeoSettings("metaTitle", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.seo.metaDescription}
                    onChange={(e) =>
                      updateSeoSettings("metaDescription", e.target.value)
                    }
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Social Media Bild (OG Image)</Label>
                <div className="flex items-center gap-4">
                  {settings.seo.ogImage && (
                    <img
                      src={settings.seo.ogImage}
                      alt="OG Image"
                      className="w-32 h-16 object-cover border rounded p-1"
                    />
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="ogimage-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        {ogImageFile
                          ? ogImageFile.name
                          : "OG Image hochladen (1200x630 empfohlen)"}
                      </span>
                    </Label>
                    <Input
                      id="ogimage-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "ogImage")}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableSitemap">Sitemap aktivieren</Label>
                  <p className="text-sm text-gray-500">
                    Generieren Sie automatisch eine sitemap.xml-Datei für
                    Suchmaschinen.
                  </p>
                </div>
                <Switch
                  id="enableSitemap"
                  checked={settings.seo.enableSitemap}
                  onCheckedChange={(checked) =>
                    updateSeoSettings("enableSitemap", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotsTxt">robots.txt Inhalt</Label>
                <Textarea
                  id="robotsTxt"
                  value={settings.seo.robotsTxt}
                  onChange={(e) =>
                    updateSeoSettings("robotsTxt", e.target.value)
                  }
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
