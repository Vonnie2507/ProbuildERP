import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Truck, Wrench, Package, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "install" | "delivery" | "pickup" | "measure";

interface CalendarEvent {
  id: string;
  jobNumber: string;
  clientName: string;
  time: string;
  type: EventType;
  installer?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
}

const eventTypeConfig: Record<EventType, { icon: typeof Wrench; color: string; label: string }> = {
  install: { icon: Wrench, color: "bg-success text-success-foreground", label: "Install" },
  delivery: { icon: Truck, color: "bg-warning text-warning-foreground", label: "Delivery" },
  pickup: { icon: Package, color: "bg-primary text-primary-foreground", label: "Pickup" },
  measure: { icon: Ruler, color: "bg-accent text-accent-foreground", label: "Measure" },
};

export function CalendarView({ events, onEventClick, onAddEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.getTime() === today.getTime(),
        events: events.filter(e => {
          return true;
        }),
      });
    }
    return days;
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {formatMonthYear(currentDate)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              {(["day", "week", "month"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none first:rounded-l-md last:rounded-r-md",
                    viewMode === mode && "bg-muted"
                  )}
                  onClick={() => setViewMode(mode)}
                  data-testid={`button-view-${mode}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek(-1)}
                data-testid="button-prev-week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek(1)}
                data-testid="button-next-week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          {Object.entries(eventTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <Badge key={type} variant="outline" className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
          {dayNames.map((day) => (
            <div
              key={day}
              className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                "bg-background min-h-[120px] p-2 cursor-pointer hover-elevate",
                day.isToday && "ring-2 ring-accent ring-inset"
              )}
              onClick={() => onAddEvent?.(day.date)}
              data-testid={`calendar-day-${idx}`}
            >
              <div className={cn(
                "text-sm font-medium mb-2",
                !day.isCurrentMonth && "text-muted-foreground",
                day.isToday && "text-accent"
              )}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {events.slice(0, 3).map((event) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "text-[10px] p-1 rounded flex items-center gap-1 truncate",
                        config.color
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      data-testid={`calendar-event-${event.id}`}
                    >
                      <Icon className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="truncate">{event.time} {event.clientName}</span>
                    </div>
                  );
                })}
                {events.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
