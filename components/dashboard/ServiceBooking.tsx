"use client";

import { useState, useEffect } from "react";
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import {
  CircleAlert,
  CheckCircle2,
  Loader2,
  Tag,
  Calendar,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { toast } from "@/components/ui/use-toast";
import "@/styles/mui-calendar.css";

// Suppress React 19 ref warning (this is a temporary workaround)
const originalConsoleError = console.error;
console.error = function (...args) {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    args[0].includes("Accessing element.ref was removed in React 19")
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [displayDate, setDisplayDate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [bookingStatus, setBookingStatus] = useState<
    "success" | "error" | null
  >(null);

  // Update display date whenever selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setDisplayDate(format(selectedDate, "dd.MM.yyyy"));
    } else {
      setDisplayDate("");
    }
  }, [selectedDate]);

  const handleBookService = (serviceId: string) => {
    // Reset any previous state
    setSelectedDate(null);
    setNotes("");
    setBookingStatus(null);

    // Set new service and open dialog
    setSelectedService(serviceId);
    setIsDialogOpen(true);

    // Show feedback that booking form is opened
    const serviceName = services.find((s) => s.id === serviceId)?.title;
    toast({
      title: t("dashboard.services.bookingStarted"),
      description: serviceName,
      duration: 3000,
    });
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || selectedDate === null) {
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
          setSelectedDate(null);
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

  const handleDateChange = (value: Date | null) => {
    // Log the selection for debugging
    console.log("Date selected:", value);

    // Ensure we always have a consistent type (Date or null, never undefined)
    setSelectedDate(value);

    // Show feedback that the date was selected
    if (value) {
      toast({
        title: "Date selected",
        description: format(value, "dd.MM.yyyy"),
        variant: "default",
        duration: 1500,
      });
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={de}>
      <div>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {t("dashboard.services.intro")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className="flex flex-col h-full transform transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border border-gray-200 dark:border-gray-700">
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
                <Button
                  onClick={() => handleBookService(service.id)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("dashboard.services.book")}
                </Button>
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
                    <div className="w-full date-picker-container">
                      <style
                        jsx
                        global>{`
                        /* Ensure the popover is on top of the dialog */
                        .MuiPickersPopper-root {
                          z-index: 2000 !important;
                        }
                        /* Make calendar controls clickable */
                        .MuiPickersCalendarHeader-root button,
                        .MuiDayCalendar-root button,
                        .MuiPickersDay-root,
                        .MuiPickersArrowSwitcher-root button {
                          pointer-events: auto !important;
                          cursor: pointer !important;
                        }
                        /* Make calendar have proper size */
                        .MuiPickersPopper-root .MuiPaper-root {
                          transform: scale(1) !important;
                        }
                      `}</style>
                      <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        minDate={today}
                        format="dd.MM.yyyy"
                        autoFocus
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "transparent",
                            "& fieldset": {
                              borderColor: "rgba(0, 0, 0, 0.23)",
                              borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#8b5cf6", // Violet color
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#8b5cf6", // Violet color
                              borderWidth: "2px",
                            },
                          },
                        }}
                        slotProps={{
                          popper: {
                            placement: "bottom-start",
                            modifiers: [
                              {
                                name: "preventOverflow",
                                options: {
                                  boundary: "viewport",
                                },
                              },
                              {
                                name: "flip",
                                options: {
                                  fallbackPlacements: ["top-start"],
                                },
                              },
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 10],
                                },
                              },
                            ],
                          },
                        }}
                      />
                      {/* Show the selected date below the picker for clarity */}
                      {selectedDate && (
                        <div className="mt-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                          Selected date: {displayDate}
                        </div>
                      )}
                    </div>
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
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    disabled={isSubmitting}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleSubmitBooking}
                    disabled={isSubmitting || selectedDate === null}
                    className="bg-violet-600 hover:bg-violet-700 text-white">
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("dashboard.services.processing")}
                      </div>
                    ) : (
                      t("dashboard.services.confirmBooking")
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
}
