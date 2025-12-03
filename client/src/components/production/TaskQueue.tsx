import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TaskType = "cutting" | "routing" | "assembly" | "qa";
type TaskStatus = "pending" | "in_progress" | "complete";

interface ProductionTask {
  id: string;
  jobNumber: string;
  clientName: string;
  taskType: TaskType;
  status: TaskStatus;
  assignedTo?: string;
  estimatedTime: number;
  timeSpent: number;
  materials: string[];
}

interface TaskQueueProps {
  tasks: ProductionTask[];
  onStartTask?: (task: ProductionTask) => void;
  onPauseTask?: (task: ProductionTask) => void;
  onCompleteTask?: (task: ProductionTask) => void;
}

const taskTypeConfig: Record<TaskType, { label: string; color: string }> = {
  cutting: { label: "Cutting", color: "bg-chart-1" },
  routing: { label: "Routing", color: "bg-chart-2" },
  assembly: { label: "Assembly", color: "bg-chart-3" },
  qa: { label: "QA", color: "bg-chart-4" },
};

export function TaskQueue({
  tasks,
  onStartTask,
  onPauseTask,
  onCompleteTask,
}: TaskQueueProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Production Queue</CardTitle>
          <Badge variant="secondary">{tasks.filter(t => t.status !== "complete").length} pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => {
          const config = taskTypeConfig[task.taskType];
          const progress = task.estimatedTime > 0 
            ? Math.min((task.timeSpent / task.estimatedTime) * 100, 100)
            : 0;
          const isExpanded = expandedTask === task.id;

          return (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-md border",
                task.status === "in_progress" && "border-accent bg-accent/5",
                task.status === "complete" && "opacity-60"
              )}
              data-testid={`task-${task.id}`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === "complete"}
                  onCheckedChange={() => onCompleteTask?.(task)}
                  disabled={task.status === "pending"}
                  data-testid={`checkbox-task-${task.id}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {task.jobNumber}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", config.color, "text-white")}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    task.status === "complete" && "line-through"
                  )}>
                    {task.clientName}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(task.timeSpent)} / {formatTime(task.estimatedTime)}</span>
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {task.status === "in_progress" && (
                    <Progress value={progress} className="h-1 mt-2" />
                  )}

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-1">Materials:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {task.materials.map((material, idx) => (
                          <li key={idx}>- {material}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {task.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onStartTask?.(task)}
                      data-testid={`button-start-task-${task.id}`}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {task.status === "in_progress" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onPauseTask?.(task)}
                      data-testid={`button-pause-task-${task.id}`}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  >
                    {isExpanded ? "Less" : "More"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
