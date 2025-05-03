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
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Separator } from "@/components/ui/separator";
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

interface MyBookingsProps {
  userId: string;
}

// Sample service data (should match what's in ServiceBooking.tsx)
const services = {
  bamf: {
    title: "BAMF Integration Kurs",
    description:
      "Deutschkurs mit BAMF-Zulassung für Integration in Deutschland",
  },
  dtz: {
    title: "Deutsch-Test für Zuwanderer (DTZ)",
    description: "Offizieller Deutsch-Test für Zuwanderer (A2-B1 Niveau)",
  },
  "telc-b1": {
    title: "telc Deutsch B1",
    description: "Prüfungsvorbereitung und Test für telc Deutsch B1 Zertifikat",
  },
  "telc-b2": {
    title: "telc Deutsch B2",
    description: "Prüfungsvorbereitung und Test für telc Deutsch B2 Zertifikat",
  },
  online: {
    title: "Online Deutschkurse",
    description: "Flexible Deutschkurse online von zu Hause aus",
  },
  business: {
    title: "Business Deutsch",
    description: "Spezielle Deutschkurse für den Berufsalltag",
  },
};

interface ServiceBooking {
  _id: string;
  userId: string;
  serviceId: string;
  date: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export default function MyBookings({ userId }: MyBookingsProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const fetchBookings = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/service-bookings");

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(t("dashboard.myBookings.error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId, t]);

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    try {
      const response = await fetch(
        `/api/service-bookings/${bookingToCancel}/status`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Update bookings list
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingToCancel
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast({
        title: t("dashboard.myBookings.cancelSuccess"),
        description: t("dashboard.myBookings.cancelSuccessDescription"),
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: t("dashboard.myBookings.cancelError"),
        description: t("dashboard.myBookings.cancelErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge
            variant="success"
            className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("dashboard.myBookings.confirmed")}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            {t("dashboard.myBookings.cancelled")}
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t("dashboard.myBookings.pending")}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return <Loading text={t("dashboard.myBookings.loading")} />;
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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          {t("dashboard.myBookings.noBookings")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {t("dashboard.myBookings.noBookingsDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => {
            const service =
              services[booking.serviceId as keyof typeof services];
            return (
              <Card
                key={booking._id}
                className="hover:shadow-md transition-shadow duration-300 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-violet-700 dark:text-violet-300">
                      {service ? service.title : booking.serviceId}
                    </CardTitle>
                    {getStatusBadge(booking.status)}
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {service ? service.description : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                    <CalendarClock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <span className="font-medium">
                      {booking.date
                        ? format(new Date(booking.date), "PPP p")
                        : t("dashboard.myBookings.dateNotSet")}
                    </span>
                  </div>
                  {booking.notes && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="font-medium">
                          {t("dashboard.myBookings.notes")}:
                        </span>{" "}
                        {booking.notes}
                      </p>
                    </>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("dashboard.myBookings.bookedOn")}{" "}
                    {format(new Date(booking.createdAt), "PPP")}
                  </p>
                  {booking.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                      onClick={() => handleCancelClick(booking._id)}>
                      {t("dashboard.myBookings.cancel")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.myBookings.confirmCancel")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.myBookings.confirmCancelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600">
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("dashboard.myBookings.cancelling")}
                </>
              ) : (
                t("dashboard.myBookings.confirmCancelAction")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
