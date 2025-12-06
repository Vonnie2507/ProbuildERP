import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Factory, Columns, DoorOpen, CheckCircle, Cog } from "lucide-react";

interface ProductionStage {
  statusKey: string;
  label: string;
  jobCount: number;
  progress: number;
}

interface ProductionOverviewProps {
  stages: ProductionStage[];
  totalActiveJobs: number;
  onViewProduction?: () => void;
}

const iconMap: Record<string, typeof Factory> = {
  manufacturing_posts: Columns,
  manufacturing_panels: Factory,
  manufacturing_gates: DoorOpen,
  qa_check: CheckCircle,
  cutting: Factory,
  routing: Cog,
  assembly: Factory,
  qa: CheckCircle,
};

const colorMap: Record<string, string> = {
  manufacturing_posts: "bg-chart-1",
  manufacturing_panels: "bg-chart-2",
  manufacturing_gates: "bg-chart-3",
  qa_check: "bg-chart-4",
  cutting: "bg-chart-1",
  routing: "bg-chart-2",
  assembly: "bg-chart-3",
  qa: "bg-chart-4",
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
        {stages.map((stage, index) => {
          const Icon = iconMap[stage.statusKey] || Factory;
          const colorClass = colorMap[stage.statusKey] || `bg-chart-${(index % 4) + 1}`;
          return (
            <div key={stage.statusKey} className="space-y-2" data-testid={`production-stage-${stage.statusKey}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded ${colorClass}/10`}>
                    <Icon className={`h-3.5 w-3.5 ${colorClass.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm font-medium">{stage.label}</span>
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
