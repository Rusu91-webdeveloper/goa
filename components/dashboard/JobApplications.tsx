"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  Upload,
  Briefcase,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { toast } from "@/components/ui/use-toast";

interface JobApplicationsProps {
  userId: string;
  onApplicationSubmitted?: () => void;
}

// Sample job data (In a real app, these would come from an API)
const jobs = [
  {
    id: "teacher-bamf",
    title: "BAMF-Lehrkraft",
    category: "teaching",
    location: "Berlin",
    type: "Vollzeit",
    description:
      "Unterricht in Integrationskursen mit BAMF-Zulassung. Erfahrung im Unterrichten von Erwachsenen erforderlich.",
  },
  {
    id: "teacher-daf",
    title: "DaF/DaZ-Lehrkraft",
    category: "teaching",
    location: "Brandenburg",
    type: "Teilzeit",
    description:
      "Deutsch als Fremdsprache/Zweitsprache Lehrkraft für verschiedene Niveaustufen. Flexible Arbeitszeiten.",
  },
  {
    id: "teacher-alpha",
    title: "Alpha-Lehrkraft",
    category: "teaching",
    location: "Berlin",
    type: "Teilzeit",
    description:
      "Alphabetisierungskurse für Erwachsene mit geringen Deutschkenntnissen. Spezialkenntnisse in der Alphabetisierung erforderlich.",
  },
  {
    id: "admin-assistant",
    title: "Verwaltungsassistenz",
    category: "admin",
    location: "Berlin",
    type: "Vollzeit",
    description:
      "Administrative Unterstützung im Schulbüro. Gute Deutschkenntnisse und organisatorisches Talent erforderlich.",
  },
];

export default function JobApplications({
  userId,
  onApplicationSubmitted,
}: JobApplicationsProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<
    "success" | "error" | null
  >(null);

  // Filter jobs based on selected category
  const filteredJobs =
    activeTab === "all"
      ? jobs
      : jobs.filter((job) => job.category === activeTab);

  const handleApplyJob = (jobId: string) => {
    setSelectedJob(jobId);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob || !coverLetter) {
      toast({
        title: t("dashboard.jobs.error"),
        description: t("dashboard.jobs.formError"),
        variant: "destructive",
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: t("dashboard.jobs.error"),
        description: t("dashboard.jobs.resumeRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call with FormData to upload the file
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("jobId", selectedJob);
      formData.append("coverLetter", coverLetter);
      formData.append("resume", resumeFile);

      // Make an actual API call
      const response = await fetch("/api/job-applications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Application submission failed");
      }

      setApplicationStatus("success");

      // Call the callback function if provided
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      } else {
        // If no callback, show toast directly
        toast({
          title: t("dashboard.jobs.applicationSuccess"),
          description: t("dashboard.jobs.applicationConfirmation"),
        });
      }

      // Reset form
      setTimeout(() => {
        setIsDialogOpen(false);
        setSelectedJob(null);
        setCoverLetter("");
        setResumeFile(null);
        setApplicationStatus(null);
      }, 2000);
    } catch (error) {
      setApplicationStatus("error");
      toast({
        title: t("dashboard.jobs.applicationError"),
        description: t("dashboard.jobs.applicationErrorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        {t("dashboard.jobs.intro")}
      </p>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6">
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-md">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
            {t("dashboard.jobs.allJobs")}
          </TabsTrigger>
          <TabsTrigger
            value="teaching"
            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
            {t("dashboard.jobs.teaching")}
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/30 dark:data-[state=active]:text-violet-300">
            {t("dashboard.jobs.admin")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            {t("dashboard.jobs.noJobs")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="border-l-4 border-l-violet-500 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-violet-700 dark:text-violet-300 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-violet-600 dark:text-violet-400" />
                  {job.title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <span>{job.location}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                  <span>{job.type}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button
                  variant="outline"
                  onClick={() => handleApplyJob(job.id)}
                  className="border-violet-300 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                  {t("dashboard.jobs.viewDetails")}
                </Button>
                <Button
                  onClick={() => handleApplyJob(job.id)}
                  className="bg-violet-600 hover:bg-violet-700 text-white flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {t("dashboard.jobs.apply")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {applicationStatus === "success"
                ? t("dashboard.jobs.applicationConfirmed")
                : t("dashboard.jobs.applyForJob")}
            </DialogTitle>
            <DialogDescription>
              {applicationStatus === "success"
                ? t("dashboard.jobs.applicationSuccessDescription")
                : selectedJob && jobs.find((j) => j.id === selectedJob)?.title}
            </DialogDescription>
          </DialogHeader>

          {applicationStatus === "success" ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-gray-700 dark:text-gray-300">
                {t("dashboard.jobs.thankYou")}
              </p>
            </div>
          ) : applicationStatus === "error" ? (
            <div className="flex flex-col items-center py-8">
              <CircleAlert className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center text-gray-700 dark:text-gray-300">
                {t("dashboard.jobs.applicationErrorMessage")}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitApplication}
              className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="coverLetter"
                  className="font-medium">
                  {t("dashboard.jobs.coverLetter")} *
                </Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={t("dashboard.jobs.coverLetterPlaceholder")}
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="resume"
                  className="font-medium">
                  {t("dashboard.jobs.resume")} * (PDF)
                </Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {resumeFile
                      ? resumeFile.name
                      : t("dashboard.jobs.dragAndDrop")}
                  </p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                  />
                  <Label
                    htmlFor="resume"
                    className="bg-primary text-white px-4 py-2 rounded-md mt-2 cursor-pointer">
                    {t("dashboard.jobs.browseFiles")}
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="font-medium">
                  {t("dashboard.jobs.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-medium">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dashboard.jobs.submitting")}
                    </>
                  ) : (
                    t("dashboard.jobs.submitApplication")
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
