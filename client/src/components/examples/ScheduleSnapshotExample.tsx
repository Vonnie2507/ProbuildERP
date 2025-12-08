import { ScheduleSnapshot } from "@/components/dashboard/ScheduleSnapshot";

export default function ScheduleSnapshotExample() {
  const items = [
    {
      id: "1",
      jobNumber: "JOB-2024-089",
      clientName: "Williams Family",
      address: "42 Ocean Drive, Scarborough",
      installer: { name: "Jake M", initials: "JM" },
      time: "8:00",
      type: "install" as const,
    },
    {
      id: "2",
      jobNumber: "JOB-2024-091",
      clientName: "Harbor Homes",
      address: "15 Marina Bay, Fremantle",
      installer: { name: "Jarrad K", initials: "JK" },
      time: "10:30",
      type: "delivery" as const,
    },
    {
      id: "3",
      jobNumber: "JOB-2024-093",
      clientName: "Coastal Living",
      address: "8 Sunset Blvd, Cottesloe",
      installer: { name: "Jake M", initials: "JM" },
      time: "14:00",
      type: "measure" as const,
    },
  ];

  return (
    <ScheduleSnapshot
      date="Wednesday, 4 December 2024"
      items={items}
      onItemClick={(item) => console.log("Clicked:", item)}
      onViewSchedule={() => console.log("View schedule clicked")}
    />
  );
}
