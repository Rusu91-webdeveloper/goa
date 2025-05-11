"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption:
          "flex items-center justify-between h-12 px-2 border-b dark:border-gray-700 border-gray-200 mb-3",
        caption_label: "text-sm font-medium text-gray-900 dark:text-gray-50",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-md border-gray-300 dark:border-gray-600"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between w-full",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] h-9 flex items-center justify-center",
        row: "flex w-full justify-between mt-2",
        cell: "relative p-0 text-center text-sm h-9 w-9 flex items-center justify-center focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer flex items-center justify-center"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => (
          <div className="flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </div>
        ),
        IconRight: () => (
          <div className="flex items-center justify-center">
            <ChevronRight className="h-5 w-5" />
          </div>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
