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
  | "trade"
  | "draft"
  | "sent"
  | "expired"
  | "accepted"
  | "awaiting_deposit"
  | "deposit_paid"
  | "ready_for_production"
  | "manufacturing_posts"
  | "manufacturing_panels"
  | "manufacturing_gates"
  | "qa_check"
  | "ready_for_scheduling"
  | "install_in_progress"
  | "install_posts"
  | "install_panels"
  | "install_gates"
  | "install_complete"
  | "final_payment_pending"
  | "awaiting_final_payment"
  | "completed"
  | "paid_in_full"
  | "cancelled"
  | "archived";

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
  draft: {
    label: "DRAFT",
    className: "bg-muted text-muted-foreground",
  },
  sent: {
    label: "SENT",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  expired: {
    label: "EXPIRED",
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  accepted: {
    label: "ACCEPTED",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  awaiting_deposit: {
    label: "AWAITING DEPOSIT",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  deposit_paid: {
    label: "DEPOSIT PAID",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  ready_for_production: {
    label: "READY FOR PRODUCTION",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  manufacturing_posts: {
    label: "MFG POSTS",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  manufacturing_panels: {
    label: "MFG PANELS",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  manufacturing_gates: {
    label: "MFG GATES",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  qa_check: {
    label: "QA CHECK",
    className: "bg-primary/10 text-primary dark:bg-primary/20",
  },
  ready_for_scheduling: {
    label: "READY TO SCHEDULE",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  install_in_progress: {
    label: "INSTALLING",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  install_posts: {
    label: "INSTALL POSTS",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  install_panels: {
    label: "INSTALL PANELS",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  install_gates: {
    label: "INSTALL GATES",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  install_complete: {
    label: "INSTALL COMPLETE",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  final_payment_pending: {
    label: "FINAL PAYMENT",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  awaiting_final_payment: {
    label: "AWAITING PAYMENT",
    className: "bg-warning/10 text-warning dark:bg-warning/20",
  },
  completed: {
    label: "COMPLETED",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  paid_in_full: {
    label: "PAID IN FULL",
    className: "bg-success/10 text-success dark:bg-success/20",
  },
  cancelled: {
    label: "CANCELLED",
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  archived: {
    label: "ARCHIVED",
    className: "bg-muted text-muted-foreground",
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
