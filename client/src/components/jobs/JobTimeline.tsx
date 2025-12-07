import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";

interface TimelineStage {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface JobTimelineProps {
  stages: TimelineStage[];
  onToggleStage?: (stageId: string) => void;
  isLoading?: boolean;
  loadingStageId?: string | null;
}

function getIconComponent(iconName?: string) {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as Record<string, any>)[iconName];
  return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
}

export function JobTimeline({ stages, onToggleStage, isLoading, loadingStageId }: JobTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Job Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isStageLoading = loadingStageId === stage.id;
            
            return (
              <div
                key={stage.id}
                className="flex gap-3"
                data-testid={`timeline-stage-${stage.id}`}
              >
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 p-0 rounded-full",
                      stage.isCompleted 
                        ? "text-success hover:text-success/80" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onToggleStage?.(stage.id)}
                    disabled={isLoading}
                    data-testid={`toggle-stage-${stage.id}`}
                  >
                    {isStageLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : stage.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </Button>
                  {index < stages.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 mt-2",
                        stage.isCompleted ? "bg-success" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stage.icon && (
                        <span className={cn(
                          "text-muted-foreground",
                          stage.isCompleted && "text-success"
                        )}>
                          {getIconComponent(stage.icon)}
                        </span>
                      )}
                      <span
                        className={cn(
                          "font-medium text-sm",
                          !stage.isCompleted && "text-muted-foreground"
                        )}
                      >
                        {stage.title}
                      </span>
                    </div>
                    {stage.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(stage.completedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
