import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 
  | "new" 
  | "contacted" 
  | "quoted" 
  | "approved" 
  | "declined"
  | "in_progress"
  | "production"
  | "ready"
  | "scheduled"
  | "complete"
  | "paid"
  | "overdue"
  | "pending"
  | "low_stock"
  | "public"
  | "trade";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  new: {
    label: "NEW",
    className: "bg-accent text-accent-foreground",
  },
  contacted: {
    label: "CONTACTED",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  quoted: {
    label: "QUOTED",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  approved: {
    label: "APPROVED",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  declined: {
    label: "DECLINED",
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  in_progress: {
    label: "IN PROGRESS",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  production: {
    label: "PRODUCTION",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  ready: {
    label: "READY",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  scheduled: {
    label: "SCHEDULED",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  complete: {
    label: "COMPLETE",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  paid: {
    label: "PAID",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  overdue: {
    label: "OVERDUE",
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  pending: {
    label: "PENDING",
    className: "bg-muted text-muted-foreground",
  },
  low_stock: {
    label: "LOW STOCK",
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  public: {
    label: "PUBLIC",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  trade: {
    label: "TRADE",
    className: "bg-accent text-accent-foreground",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5",
        config.className,
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
