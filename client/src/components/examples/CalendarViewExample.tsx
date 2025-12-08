import { CalendarView } from "@/components/schedule/CalendarView";

export default function CalendarViewExample() {
  const events = [
    {
      id: "1",
      jobNumber: "JOB-2024-089",
      clientName: "Williams",
      time: "8:00",
      type: "install" as const,
      installer: "Jake M",
    },
    {
      id: "2",
      jobNumber: "JOB-2024-091",
      clientName: "Harbor Homes",
      time: "10:30",
      type: "delivery" as const,
    },
    {
      id: "3",
      jobNumber: "JOB-2024-093",
      clientName: "Coastal Living",
      time: "14:00",
      type: "measure" as const,
    },
    {
      id: "4",
      jobNumber: "JOB-2024-094",
      clientName: "Smith",
      time: "9:00",
      type: "pickup" as const,
    },
  ];

  return (
    <div className="p-4">
      <CalendarView
        events={events}
        onEventClick={(event) => console.log("Event clicked:", event)}
        onAddEvent={(date) => console.log("Add event on:", date)}
      />
    </div>
  );
}
