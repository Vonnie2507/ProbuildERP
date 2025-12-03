import { TaskQueue } from "@/components/production/TaskQueue";

export default function TaskQueueExample() {
  const tasks = [
    {
      id: "task-001",
      jobNumber: "JOB-2024-089",
      clientName: "Williams Family - Hampton 25m",
      taskType: "cutting" as const,
      status: "in_progress" as const,
      assignedTo: "George",
      estimatedTime: 120,
      timeSpent: 45,
      materials: ["PVC Post 100x100 x 6", "PVC Rail 50x100 x 12", "PVC Picket x 48"],
    },
    {
      id: "task-002",
      jobNumber: "JOB-2024-091",
      clientName: "Harbor Homes - Colonial 40m",
      taskType: "routing" as const,
      status: "pending" as const,
      assignedTo: "George",
      estimatedTime: 90,
      timeSpent: 0,
      materials: ["PVC Rail 50x100 x 20", "PVC Cap x 10"],
    },
    {
      id: "task-003",
      jobNumber: "JOB-2024-087",
      clientName: "Pacific Builders - Picket",
      taskType: "assembly" as const,
      status: "complete" as const,
      assignedTo: "David T",
      estimatedTime: 180,
      timeSpent: 165,
      materials: ["Pre-cut posts x 8", "Pre-routed rails x 16", "Pickets x 64"],
    },
  ];

  return (
    <div className="p-4 max-w-lg">
      <TaskQueue
        tasks={tasks}
        onStartTask={(task) => console.log("Start:", task)}
        onPauseTask={(task) => console.log("Pause:", task)}
        onCompleteTask={(task) => console.log("Complete:", task)}
      />
    </div>
  );
}
