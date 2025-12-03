import { AlertsPanel } from "@/components/dashboard/AlertsPanel";

export default function AlertsPanelExample() {
  const alerts = [
    {
      id: "1",
      type: "stock" as const,
      title: "Low Stock Alert",
      message: "PVC Post Cap White - Only 12 remaining",
      actionLabel: "Reorder Now",
      onAction: () => console.log("Reorder clicked"),
    },
    {
      id: "2",
      type: "overdue" as const,
      title: "Quote Follow-up Overdue",
      message: "Johnson Property - Quote sent 5 days ago",
      actionLabel: "Contact Client",
      onAction: () => console.log("Contact clicked"),
    },
    {
      id: "3",
      type: "payment" as const,
      title: "Deposit Pending",
      message: "Smith Residence - Awaiting deposit for 3 days",
    },
  ];

  return (
    <AlertsPanel
      alerts={alerts}
      onDismiss={(id) => console.log("Dismissed:", id)}
    />
  );
}
