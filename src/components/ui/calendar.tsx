import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = false, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center gap-1",
        caption_label: "text-base font-semibold tracking-tight",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background/80 p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 hover:border-primary/30 rounded-lg transition-all duration-200 flex items-center justify-center",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse",
        // v8 class names
        head_row: "hidden",
        head_cell: "hidden",
        // v9 class names
        weekdays: "hidden",
        weekday: "hidden",
        row: "flex w-full mt-1",
        week: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
          "[&:has([aria-selected])]:bg-primary/10",
          "[&:has([aria-selected].day-outside)]:bg-primary/5"
        ),
        day: cn(
          "inline-flex items-center justify-center h-10 w-10 p-0 font-medium text-sm rounded-full transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          "aria-selected:opacity-100"
        ),
        day_button: cn(
          "inline-flex items-center justify-center h-10 w-10 p-0 font-medium text-sm rounded-full transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/30"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground font-semibold rounded-full",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "shadow-md shadow-primary/30"
        ),
        selected: cn(
          "bg-primary text-primary-foreground font-semibold rounded-full",
          "hover:bg-primary hover:text-primary-foreground",
          "shadow-md shadow-primary/30"
        ),
        day_today: cn(
          "bg-accent/50 text-accent-foreground font-semibold",
          "ring-2 ring-primary/20 rounded-full"
        ),
        today: cn(
          "bg-accent/50 text-accent-foreground font-semibold",
          "ring-2 ring-primary/20 rounded-full"
        ),
        day_outside: cn(
          "day-outside text-muted-foreground/40",
          "aria-selected:bg-primary/5 aria-selected:text-muted-foreground/50"
        ),
        outside: "text-muted-foreground/40",
        day_disabled: "text-muted-foreground/30 cursor-not-allowed hover:bg-transparent",
        disabled: "text-muted-foreground/30 cursor-not-allowed hover:bg-transparent",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
