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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  CircleAlert,
  CheckCircle2,
  Loader2,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n/i18n-context";
import { toast } from "@/components/ui/use-toast";

interface ServiceBookingProps {
  userId: string;
  onBookingCreated?: () => void;
}

// Sample service data (In a real app, these would come from an API)
const services = [
  {
    id: "bamf",
    title: "BAMF Integration Kurs",
    description:
      "Deutschkurs mit BAMF-Zulassung für Integration in Deutschland",
    price: "Kontaktieren für Preisdetails",
  },
  {
    id: "dtz",
    title: "Deutsch-Test für Zuwanderer (DTZ)",
    description: "Offizieller Deutsch-Test für Zuwanderer (A2-B1 Niveau)",
    price: "€120",
  },
  {
    id: "telc-b1",
    title: "telc Deutsch B1",
    description: "Prüfungsvorbereitung und Test für telc Deutsch B1 Zertifikat",
    price: "€150",
  },
  {
    id: "telc-b2",
    title: "telc Deutsch B2",
    description: "Prüfungsvorbereitung und Test für telc Deutsch B2 Zertifikat",
    price: "€180",
  },
  {
    id: "online",
    title: "Online Deutschkurse",
    description: "Flexible Deutschkurse online von zu Hause aus",
    price: "€99",
  },
  {
    id: "business",
    title: "Business Deutsch",
    description: "Spezielle Deutschkurse für den Berufsalltag",
    price: "Kontaktieren für Preisdetails",
  },
];

export default function ServiceBooking({
  userId,
  onBookingCreated,
}: ServiceBookingProps) {
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [bookingStatus, setBookingStatus] = useState<
    "success" | "error" | null
  >(null);

  const handleBookService = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsDialogOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate) {
      toast({
        title: t("dashboard.services.error"),
        description: t("dashboard.services.selectDateError"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Make an actual API call
      const response = await fetch("/api/service-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          serviceId: selectedService,
          date: selectedDate,
          notes,
        }),
      });

      if (response.ok) {
        setBookingStatus("success");

        // Call the callback function if provided
        if (onBookingCreated) {
          onBookingCreated();
        } else {
          // If no callback, show toast directly
          toast({
            title: t("dashboard.services.bookingSuccess"),
            description: t("dashboard.services.bookingConfirmation"),
          });
        }

        // Reset form
        setTimeout(() => {
          setIsDialogOpen(false);
          setSelectedService(null);
          setSelectedDate(undefined);
          setNotes("");
          setBookingStatus(null);
        }, 2000);
      } else {
        setBookingStatus("error");
        toast({
          title: t("dashboard.services.bookingError"),
          description: t("dashboard.services.bookingErrorMessage"),
          variant: "destructive",
        });
      }
    } catch (error) {
      setBookingStatus("error");
      toast({
        title: t("dashboard.services.bookingError"),
        description: t("dashboard.services.bookingErrorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        {t("dashboard.services.intro")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Card
            key={service.id}
            className="flex flex-col h-full transform transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border border-gray-200 dark:border-gray-700 relative">
            <CardHeader className="bg-violet-50 dark:bg-violet-900/20 pb-4">
              <CardTitle className="text-xl text-violet-800 dark:text-violet-300 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-violet-600 dark:text-violet-400" />
                {service.title}
              </CardTitle>
              <CardDescription className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-6 px-6">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-4">
                <Tag className="h-4 w-4 mr-2 text-violet-600 dark:text-violet-400" />
                <span className="font-medium">
                  {t("dashboard.services.price")}:
                </span>
                <span className="ml-2 font-bold text-violet-600 dark:text-violet-300">
                  {service.price}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 px-6 pb-6">
              <div
                onClick={() => handleBookService(service.id)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center justify-center rounded-md px-4 py-2 cursor-pointer">
                <Calendar className="h-4 w-4 mr-2" />
                {t("dashboard.services.book")}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-gray-200 dark:border-gray-700 shadow-lg">
          <DialogHeader className="bg-violet-50 dark:bg-violet-900/20 -mx-6 -my-2 px-6 py-4 rounded-t-lg">
            <DialogTitle className="text-xl text-violet-700 dark:text-violet-300 flex items-center">
              {bookingStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  {t("dashboard.services.bookingConfirmed")}
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2 text-violet-600 dark:text-violet-400" />
                  {t("dashboard.services.bookService")}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {bookingStatus === "success"
                ? t("dashboard.services.bookingSuccessDescription")
                : selectedService
                ? services.find((s) => s.id === selectedService)?.title
                : ""}
            </DialogDescription>
          </DialogHeader>

          {bookingStatus === "success" ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-gray-700 dark:text-gray-300">
                {t("dashboard.services.thankYou")}
              </p>
            </div>
          ) : bookingStatus === "error" ? (
            <div className="flex flex-col items-center py-8">
              <CircleAlert className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center text-red-700 dark:text-red-300">
                {t("dashboard.services.bookingErrorMessage")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("dashboard.services.selectDate")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className={`w-full px-3 py-2 text-left font-normal flex justify-between items-center cursor-pointer border border-gray-200 dark:border-gray-700 rounded-md hover:border-violet-500 dark:hover:border-violet-400 transition-colors ${
                          !selectedDate
                            ? "text-gray-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}>
                        <span>
                          {selectedDate ? (
                            format(selectedDate, "PPP")
                          ) : (
                            <span>{t("dashboard.services.pickDate")}</span>
                          )}
                        </span>
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-[100]"
                      align="start"
                      side="bottom"
                      sideOffset={8}>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("dashboard.services.additionalNotes")}
                  </label>
                  <Textarea
                    placeholder={t("dashboard.services.notesPlaceholder")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] p-3 text-base"
                  />
                </div>
              </div>

              <DialogFooter className="flex space-x-4 justify-end mt-2">
                <div
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer"
                  style={{
                    opacity: isSubmitting ? 0.5 : 1,
                    pointerEvents: isSubmitting ? "none" : "auto",
                  }}>
                  {t("common.cancel")}
                </div>
                <div
                  onClick={handleSubmitBooking}
                  className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                  style={{
                    opacity: isSubmitting || !selectedDate ? 0.5 : 1,
                    pointerEvents:
                      isSubmitting || !selectedDate ? "none" : "auto",
                  }}>
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dashboard.services.processing")}
                    </div>
                  ) : (
                    t("dashboard.services.confirmBooking")
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
