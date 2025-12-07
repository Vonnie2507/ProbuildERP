import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  jobNumber: string;
  clientName: string;
  address: string;
  installer: {
    name: string;
    initials: string;
  };
  time: string;
  type: "install" | "delivery" | "pickup" | "measure";
}

interface ScheduleSnapshotProps {
  date: string;
  items: ScheduleItem[];
  onItemClick?: (item: ScheduleItem) => void;
  onViewSchedule?: () => void;
}

const typeColors = {
  install: "bg-success/10 text-success",
  delivery: "bg-warning/10 text-warning",
  pickup: "bg-primary/10 text-primary",
  measure: "bg-accent text-accent-foreground",
};

const typeLabels = {
  install: "Install",
  delivery: "Delivery",
  pickup: "Pickup",
  measure: "Measure",
};

export function ScheduleSnapshot({
  date,
  items,
  onItemClick,
  onViewSchedule,
}: ScheduleSnapshotProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{date}</p>
        </div>
        {onViewSchedule && (
          <Button variant="ghost" size="sm" onClick={onViewSchedule} data-testid="button-view-schedule">
            Full Calendar
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No scheduled items for today</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-md hover-elevate cursor-pointer"
              onClick={() => onItemClick?.(item)}
              data-testid={`schedule-item-${item.id}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold">{item.time}</span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded", typeColors[item.type])}>
                  {typeLabels[item.type]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{item.jobNumber}</span>
                  <span className="font-medium text-sm truncate">{item.clientName}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{item.address}</span>
                </div>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-muted">
                  {item.installer.initials}
                </AvatarFallback>
              </Avatar>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
