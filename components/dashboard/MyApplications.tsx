"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
  MapPin,
  XCircle,
  Users,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import Loading from "@/components/ui/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface MyApplicationsProps {
  userId: string;
}

// Sample job data (should match what's in JobApplications.tsx)
const jobs = {
  "teacher-bamf": {
    title: "BAMF-Lehrkraft",
    location: "Berlin",
    type: "Vollzeit",
  },
  "teacher-daf": {
    title: "DaF/DaZ-Lehrkraft",
    location: "Brandenburg",
    type: "Teilzeit",
  },
  "teacher-alpha": {
    title: "Alpha-Lehrkraft",
    location: "Berlin",
    type: "Teilzeit",
  },
  "admin-assistant": {
    title: "Verwaltungsassistenz",
    location: "Berlin",
    type: "Vollzeit",
  },
};

interface JobApplication {
  _id: string;
  userId: string;
  jobId: string;
  coverLetter: string;
  resumeUrl: string;
  status:
    | "pending"
    | "review"
    | "interview"
    | "accepted"
    | "rejected"
    | "withdrawn";
  createdAt: string;
}

export default function MyApplications({ userId }: MyApplicationsProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<
    string | null
  >(null);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const fetchApplications = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/job-applications");

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(t("dashboard.myApplications.error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [userId, t]);

  const handleWithdrawApplication = async () => {
    if (!applicationToWithdraw) return;

    setIsWithdrawing(true);
    try {
      const response = await fetch(
        `/api/job-applications/${applicationToWithdraw}/status`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to withdraw application");
      }

      // Update applications list
      setApplications(
        applications.map((application) =>
          application._id === applicationToWithdraw
            ? { ...application, status: "withdrawn" }
            : application
        )
      );

      toast({
        title: t("dashboard.myApplications.withdrawSuccess"),
        description: t("dashboard.myApplications.withdrawSuccessDescription"),
      });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast({
        title: t("dashboard.myApplications.withdrawError"),
        description: t("dashboard.myApplications.withdrawErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawDialog(false);
      setApplicationToWithdraw(null);
    }
  };

  const handleWithdrawClick = (applicationId: string) => {
    setApplicationToWithdraw(applicationId);
    setShowWithdrawDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge
            variant="success"
            className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("dashboard.myApplications.accepted")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            {t("dashboard.myApplications.rejected")}
          </Badge>
        );
      case "withdrawn":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600">
            <XCircle className="h-3.5 w-3.5" />
            {t("dashboard.myApplications.withdrawn")}
          </Badge>
        );
      case "interview":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t("dashboard.myApplications.interview")}
          </Badge>
        );
      case "review":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {t("dashboard.myApplications.review")}
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t("dashboard.myApplications.pending")}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return <Loading text={t("dashboard.myApplications.loading")} />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t("dashboard.myApplications.noApplications")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {t("dashboard.myApplications.noApplicationsDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {applications.map((application) => {
            const job = jobs[application.jobId as keyof typeof jobs];
            return (
              <Card
                key={application._id}
                className="hover:shadow-md transition-shadow duration-300 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-violet-700 dark:text-violet-300">
                      {job ? job.title : application.jobId}
                    </CardTitle>
                    {getStatusBadge(application.status)}
                  </div>
                  {job && (
                    <CardDescription className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-500" />
                      {job.location} - {job.type}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        {t("dashboard.myApplications.coverLetter")}:
                      </span>
                      <br />
                      {application.coverLetter.length > 120
                        ? `${application.coverLetter.substring(0, 120)}...`
                        : application.coverLetter}
                    </p>
                    {application.resumeUrl && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center text-xs"
                          onClick={() =>
                            window.open(application.resumeUrl, "_blank")
                          }>
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          {t("dashboard.myApplications.viewResume")}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("dashboard.myApplications.appliedOn")}{" "}
                    {format(new Date(application.createdAt), "PPP")}
                  </p>
                  {(application.status === "pending" ||
                    application.status === "review") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                      onClick={() => handleWithdrawClick(application._id)}>
                      {t("dashboard.myApplications.withdraw")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.myApplications.confirmWithdraw")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.myApplications.confirmWithdrawDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdrawApplication}
              disabled={isWithdrawing}
              className="bg-red-500 hover:bg-red-600">
              {isWithdrawing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("dashboard.myApplications.withdrawing")}
                </>
              ) : (
                t("dashboard.myApplications.confirmWithdrawAction")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
