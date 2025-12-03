import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: "complete" | "current" | "pending";
}

interface JobTimelineProps {
  events: TimelineEvent[];
}

export function JobTimeline({ events }: JobTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Job Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex gap-3"
              data-testid={`timeline-event-${event.id}`}
            >
              <div className="flex flex-col items-center">
                {event.status === "complete" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : event.status === "current" ? (
                  <Clock className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                {index < events.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 mt-2",
                      event.status === "complete" ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "font-medium text-sm",
                      event.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {event.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{event.date}</span>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
