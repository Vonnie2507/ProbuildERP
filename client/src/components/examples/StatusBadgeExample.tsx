import { StatusBadge } from "@/components/shared/StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <StatusBadge status="new" />
      <StatusBadge status="contacted" />
      <StatusBadge status="quoted" />
      <StatusBadge status="approved" />
      <StatusBadge status="declined" />
      <StatusBadge status="in_progress" />
      <StatusBadge status="production" />
      <StatusBadge status="ready" />
      <StatusBadge status="scheduled" />
      <StatusBadge status="complete" />
      <StatusBadge status="paid" />
      <StatusBadge status="overdue" />
      <StatusBadge status="pending" />
      <StatusBadge status="low_stock" />
      <StatusBadge status="public" />
      <StatusBadge status="trade" />
    </div>
  );
}
