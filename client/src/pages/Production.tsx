import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskQueue } from "@/components/production/TaskQueue";
import { StatCard } from "@/components/shared/StatCard";
import { Progress } from "@/components/ui/progress";
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

export default function Production() {
  const { toast } = useToast();

  // todo: remove mock functionality
  const [tasks, setTasks] = useState<ProductionTask[]>([
    {
      id: "task-001",
      jobNumber: "JOB-2024-089",
      clientName: "Williams Family - Hampton 25m",
      taskType: "cutting",
      status: "in_progress",
      assignedTo: "George",
      estimatedTime: 120,
      timeSpent: 45,
      materials: ["PVC Post 100x100 x 6", "PVC Rail 50x100 x 12", "PVC Picket x 48"],
    },
    {
      id: "task-002",
      jobNumber: "JOB-2024-091",
      clientName: "Harbor Homes - Colonial 60m",
      taskType: "cutting",
      status: "pending",
      estimatedTime: 180,
      timeSpent: 0,
      materials: ["PVC Post 125x125 x 15", "PVC Rail 50x100 x 30"],
    },
    {
      id: "task-003",
      jobNumber: "JOB-2024-088",
      clientName: "Coastal Living - Nautilus 35m",
      taskType: "routing",
      status: "in_progress",
      assignedTo: "David T",
      estimatedTime: 90,
      timeSpent: 60,
      materials: ["Pre-cut rails x 20", "Router bits set"],
    },
    {
      id: "task-004",
      jobNumber: "JOB-2024-086",
      clientName: "Johnson Property - Picket 15m",
      taskType: "assembly",
      status: "pending",
      estimatedTime: 150,
      timeSpent: 0,
      materials: ["Routed panels x 8", "Hardware kit"],
    },
    {
      id: "task-005",
      jobNumber: "JOB-2024-085",
      clientName: "Pacific Builders - Trade Order",
      taskType: "qa",
      status: "pending",
      estimatedTime: 30,
      timeSpent: 0,
      materials: ["Assembled panels x 12"],
    },
  ]);

  const handleStartTask = (task: ProductionTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, status: "in_progress" as TaskStatus, assignedTo: "George" } : t
    ));
    toast({
      title: "Task Started",
      description: `Started ${task.taskType} for ${task.jobNumber}`,
    });
  };

  const handlePauseTask = (task: ProductionTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, status: "pending" as TaskStatus } : t
    ));
    toast({
      title: "Task Paused",
      description: `Paused ${task.taskType} for ${task.jobNumber}`,
    });
  };

  const handleCompleteTask = (task: ProductionTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, status: "complete" as TaskStatus, timeSpent: t.estimatedTime } : t
    ));
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
            <Progress value={cuttingTasks.filter(t => t.status === "complete").length / cuttingTasks.length * 100 || 0} className="h-1 mt-2" />
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
            <Progress value={routingTasks.filter(t => t.status === "complete").length / routingTasks.length * 100 || 0} className="h-1 mt-2" />
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
            <Progress value={assemblyTasks.filter(t => t.status === "complete").length / assemblyTasks.length * 100 || 0} className="h-1 mt-2" />
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
            <Progress value={qaTasks.filter(t => t.status === "complete").length / qaTasks.length * 100 || 0} className="h-1 mt-2" />
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
