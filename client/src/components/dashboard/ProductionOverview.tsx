import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Scissors, Router, Hammer, CheckCircle } from "lucide-react";

interface ProductionStage {
  stage: "cutting" | "routing" | "assembly" | "qa";
  jobCount: number;
  progress: number;
}

interface ProductionOverviewProps {
  stages: ProductionStage[];
  totalActiveJobs: number;
  onViewProduction?: () => void;
}

const stageConfig = {
  cutting: {
    label: "Cutting",
    icon: Scissors,
    color: "bg-chart-1",
  },
  routing: {
    label: "Routing",
    icon: Router,
    color: "bg-chart-2",
  },
  assembly: {
    label: "Assembly",
    icon: Hammer,
    color: "bg-chart-3",
  },
  qa: {
    label: "QA",
    icon: CheckCircle,
    color: "bg-chart-4",
  },
};

export function ProductionOverview({
  stages,
  totalActiveJobs,
  onViewProduction,
}: ProductionOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Production Overview</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{totalActiveJobs} jobs in production</p>
        </div>
        {onViewProduction && (
          <Button variant="ghost" size="sm" onClick={onViewProduction} data-testid="button-view-production">
            Manage
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage) => {
          const config = stageConfig[stage.stage];
          const Icon = config.icon;
          return (
            <div key={stage.stage} className="space-y-2" data-testid={`production-stage-${stage.stage}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded ${config.color}/10`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stage.jobCount} jobs</span>
                  <span className="text-xs font-medium">{stage.progress}%</span>
                </div>
              </div>
              <Progress value={stage.progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
