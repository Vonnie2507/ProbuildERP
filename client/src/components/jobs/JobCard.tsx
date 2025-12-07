import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Package, MoreHorizontal, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type JobStatus = "in_progress" | "production" | "ready" | "scheduled" | "complete";

interface Job {
  id: string;
  jobNumber: string;
  clientName: string;
  address: string;
  fenceStyle: string;
  jobType: "supply" | "supply_install";
  status: JobStatus;
  productionProgress: number;
  scheduledDate?: string;
  installer?: {
    name: string;
    initials: string;
  };
  totalValue: number;
  depositPaid: boolean;
}

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onUpdateStatus?: () => void;
  onViewMaterials?: () => void;
  onViewSchedule?: () => void;
}

export function JobCard({
  job,
  onClick,
  onUpdateStatus,
  onViewMaterials,
  onViewSchedule,
}: JobCardProps) {
  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`job-card-${job.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">{job.jobNumber}</span>
              <StatusBadge status={job.status} />
            </div>
            <h3 className="font-semibold">{job.clientName}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-job-actions-${job.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(); }}>
                Update Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewMaterials?.(); }}>
                View Materials
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewSchedule?.(); }}>
                View Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{job.fenceStyle}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{job.address}</span>
          </div>
          {job.scheduledDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{job.scheduledDate}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{job.jobType === "supply_install" ? "Supply + Install" : "Supply Only"}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Production Progress</span>
            <span className="font-medium">{job.productionProgress}%</span>
          </div>
          <Progress value={job.productionProgress} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {job.installer ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-muted">
                    {job.installer.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{job.installer.name}</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-semibold">${job.totalValue.toLocaleString()}</span>
            {job.depositPaid && (
              <StatusBadge status="paid" className="ml-1" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
