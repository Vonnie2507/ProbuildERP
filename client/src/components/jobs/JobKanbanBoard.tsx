import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobKanbanCard } from "./JobKanbanCard";
import type { Job, Client, User } from "@shared/schema";

interface KanbanColumn {
  id: string;
  title: string;
  statuses: string[];
  color: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "accepted",
    title: "New Jobs",
    statuses: ["accepted", "awaiting_deposit"],
    color: "bg-slate-100",
  },
  {
    id: "pipeline",
    title: "Pipeline",
    statuses: ["deposit_paid", "ready_for_production"],
    color: "bg-blue-50",
  },
  {
    id: "production",
    title: "Production",
    statuses: ["manufacturing_posts", "manufacturing_panels", "manufacturing_gates", "qa_check"],
    color: "bg-purple-50",
  },
  {
    id: "scheduling",
    title: "Ready to Schedule",
    statuses: ["ready_for_scheduling"],
    color: "bg-amber-50",
  },
  {
    id: "scheduled",
    title: "Scheduled",
    statuses: ["scheduled", "install_posts", "install_panels", "install_gates"],
    color: "bg-green-50",
  },
  {
    id: "complete",
    title: "Completing",
    statuses: ["install_complete", "awaiting_final_payment", "paid_in_full"],
    color: "bg-emerald-50",
  },
];

interface JobKanbanBoardProps {
  jobs: Job[];
  clients: Client[];
  users: User[];
  isLoading: boolean;
  onJobClick: (job: Job) => void;
}

export function JobKanbanBoard({ jobs, clients, users, isLoading, onJobClick }: JobKanbanBoardProps) {
  const getClientName = (clientId: string | null): string => {
    if (!clientId) return "Unknown";
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Unknown";
  };

  const getInstallerName = (installerId: string | null): string | undefined => {
    if (!installerId) return undefined;
    const user = users.find(u => u.id === installerId);
    return user ? `${user.firstName} ${user.lastName}` : undefined;
  };

  const getJobsForColumn = (column: KanbanColumn): Job[] => {
    return jobs.filter(job => column.statuses.includes(job.status));
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {KANBAN_COLUMNS.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap" data-testid="kanban-board">
      <div className="flex gap-4 p-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnJobs = getJobsForColumn(column);
          const columnTotal = columnJobs.reduce(
            (sum, job) => sum + parseFloat(job.totalAmount || "0"), 
            0
          );

          return (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-72"
              data-testid={`kanban-column-${column.id}`}
            >
              <Card className={`h-full ${column.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="font-normal">
                      {columnJobs.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat("en-AU", {
                      style: "currency",
                      currency: "AUD",
                      minimumFractionDigits: 0,
                    }).format(columnTotal)}
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="space-y-3 pr-2">
                      {columnJobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No jobs</p>
                        </div>
                      ) : (
                        columnJobs.map((job) => (
                          <JobKanbanCard
                            key={job.id}
                            job={{
                              id: job.id,
                              jobNumber: job.jobNumber,
                              clientName: getClientName(job.clientId),
                              siteAddress: job.siteAddress,
                              jobType: job.jobType,
                              hasGate: job.hasGate || false,
                              totalAmount: job.totalAmount,
                              assignedInstallerName: getInstallerName(job.assignedInstaller),
                              scheduledStartDate: job.scheduledStartDate?.toString(),
                              isDelayed: job.isDelayed || false,
                              isWaitingOnClient: job.isWaitingOnClient || false,
                              stagesCompleted: (job.stagesCompleted as number[]) || [],
                              status: job.status,
                            }}
                            onClick={() => onJobClick(job)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
