import { JobTimeline } from "@/components/jobs/JobTimeline";

export default function JobTimelineExample() {
  const events = [
    {
      id: "1",
      title: "Quote Accepted",
      description: "Client approved quote and paid deposit",
      date: "28 Nov",
      status: "complete" as const,
    },
    {
      id: "2",
      title: "Production Started",
      description: "Materials allocated, cutting commenced",
      date: "30 Nov",
      status: "complete" as const,
    },
    {
      id: "3",
      title: "Cutting Complete",
      description: "All posts and rails cut to size",
      date: "2 Dec",
      status: "complete" as const,
    },
    {
      id: "4",
      title: "Assembly In Progress",
      description: "Panels being assembled",
      date: "4 Dec",
      status: "current" as const,
    },
    {
      id: "5",
      title: "QA Check",
      date: "5 Dec",
      status: "pending" as const,
    },
    {
      id: "6",
      title: "Ready for Install",
      date: "6 Dec",
      status: "pending" as const,
    },
    {
      id: "7",
      title: "Installation",
      description: "Scheduled with Jake M",
      date: "11 Dec",
      status: "pending" as const,
    },
  ];

  return (
    <div className="p-4 max-w-md">
      <JobTimeline events={events} />
    </div>
  );
}
