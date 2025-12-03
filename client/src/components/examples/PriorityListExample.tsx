import { PriorityList } from "@/components/dashboard/PriorityList";

export default function PriorityListExample() {
  const items = [
    {
      id: "1",
      title: "Smith Residence",
      subtitle: "Hampton Style - 25m fence",
      status: "new" as const,
      timeAgo: "2m ago",
      urgent: true,
    },
    {
      id: "2",
      title: "Johnson Property",
      subtitle: "Colonial - 40m with gate",
      status: "contacted" as const,
      timeAgo: "1h ago",
    },
    {
      id: "3",
      title: "Pacific Builders",
      subtitle: "Picket Style - Trade order",
      status: "quoted" as const,
      timeAgo: "3h ago",
    },
  ];

  return (
    <PriorityList
      title="New Leads"
      items={items}
      onItemClick={(item) => console.log("Clicked:", item)}
      onViewAll={() => console.log("View all clicked")}
    />
  );
}
