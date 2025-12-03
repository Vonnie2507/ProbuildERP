import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskQueue } from "@/components/production/TaskQueue";
import { StatCard } from "@/components/shared/StatCard";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scissors,
  Router,
  Hammer,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProductionTask as DBProductionTask, Job } from "@shared/schema";

type TaskType = "cutting" | "routing" | "assembly" | "qa";
type TaskStatus = "pending" | "in_progress" | "complete";

interface DisplayTask {
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

export default function Production() {
  const { toast } = useToast();

  const { data: productionTasks = [], isLoading: tasksLoading } = useQuery<DBProductionTask[]>({
    queryKey: ["/api/production-tasks"],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBProductionTask> }) => {
      return apiRequest("PATCH", `/api/production-tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-tasks"] });
    },
  });

  const getJobInfo = (jobId: string | null) => {
    if (!jobId) return { jobNumber: "Unknown", clientName: "Unknown" };
    const job = jobs.find(j => j.id === jobId);
    return {
      jobNumber: job?.jobNumber || "Unknown",
      clientName: `${job?.fenceStyle || "Unknown"} - ${job?.totalLength || "?"}m`,
    };
  };

  const mapTaskStatus = (status: string): TaskStatus => {
    if (status === "completed") return "complete";
    if (status === "in_progress") return "in_progress";
    return "pending";
  };

  const tasks: DisplayTask[] = productionTasks.map((task) => {
    const jobInfo = getJobInfo(task.jobId);
    return {
      id: task.id,
      jobNumber: jobInfo.jobNumber,
      clientName: jobInfo.clientName,
      taskType: task.taskType as TaskType,
      status: mapTaskStatus(task.status),
      assignedTo: task.assignedTo || undefined,
      estimatedTime: 120,
      timeSpent: task.timeSpentMinutes || 0,
      materials: [],
    };
  });

  const handleStartTask = (task: DisplayTask) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { 
        status: "in_progress",
        startTime: new Date(),
      },
    });
    toast({
      title: "Task Started",
      description: `Started ${task.taskType} for ${task.jobNumber}`,
    });
  };

  const handlePauseTask = (task: DisplayTask) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: "pending" },
    });
    toast({
      title: "Task Paused",
      description: `Paused ${task.taskType} for ${task.jobNumber}`,
    });
  };

  const handleCompleteTask = (task: DisplayTask) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { 
        status: "completed",
        endTime: new Date(),
      },
    });
    toast({
      title: "Task Completed",
      description: `Completed ${task.taskType} for ${task.jobNumber}`,
    });
  };

  const cuttingTasks = tasks.filter(t => t.taskType === "cutting");
  const routingTasks = tasks.filter(t => t.taskType === "routing");
  const assemblyTasks = tasks.filter(t => t.taskType === "assembly");
  const qaTasks = tasks.filter(t => t.taskType === "qa");

  const activeTasks = tasks.filter(t => t.status === "in_progress").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const completedToday = tasks.filter(t => t.status === "complete").length;
  const totalTime = tasks.reduce((acc, t) => acc + t.timeSpent, 0);

  if (tasksLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-production-title">Production Manager</h1>
          <p className="text-sm text-muted-foreground">
            Track manufacturing tasks, time, and quality control
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-view-schedule">View Schedule</Button>
          <Button data-testid="button-allocate-staff">
            <Users className="h-4 w-4 mr-2" />
            Allocate Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tasks"
          value={activeTasks}
          description="Currently in progress"
          icon={Clock}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          description="Awaiting start"
          icon={AlertTriangle}
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          description="Tasks finished"
          icon={CheckCircle}
        />
        <StatCard
          title="Time Logged"
          value={`${Math.floor(totalTime / 60)}h ${totalTime % 60}m`}
          description="Today's production"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scissors className="h-4 w-4 text-chart-1" />
              Cutting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuttingTasks.length}</div>
            <Progress value={cuttingTasks.length > 0 ? (cuttingTasks.filter(t => t.status === "complete").length / cuttingTasks.length * 100) : 0} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Router className="h-4 w-4 text-chart-2" />
              Routing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routingTasks.length}</div>
            <Progress value={routingTasks.length > 0 ? (routingTasks.filter(t => t.status === "complete").length / routingTasks.length * 100) : 0} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hammer className="h-4 w-4 text-chart-3" />
              Assembly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assemblyTasks.length}</div>
            <Progress value={assemblyTasks.length > 0 ? (assemblyTasks.filter(t => t.status === "complete").length / assemblyTasks.length * 100) : 0} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-chart-4" />
              QA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qaTasks.length}</div>
            <Progress value={qaTasks.length > 0 ? (qaTasks.filter(t => t.status === "complete").length / qaTasks.length * 100) : 0} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="cutting" data-testid="tab-cutting">Cutting</TabsTrigger>
          <TabsTrigger value="routing" data-testid="tab-routing">Routing</TabsTrigger>
          <TabsTrigger value="assembly" data-testid="tab-assembly">Assembly</TabsTrigger>
          <TabsTrigger value="qa" data-testid="tab-qa">QA</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TaskQueue
            tasks={tasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
          />
        </TabsContent>

        <TabsContent value="cutting" className="mt-6">
          <TaskQueue
            tasks={cuttingTasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
          />
        </TabsContent>

        <TabsContent value="routing" className="mt-6">
          <TaskQueue
            tasks={routingTasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
          />
        </TabsContent>

        <TabsContent value="assembly" className="mt-6">
          <TaskQueue
            tasks={assemblyTasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
          />
        </TabsContent>

        <TabsContent value="qa" className="mt-6">
          <TaskQueue
            tasks={qaTasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
