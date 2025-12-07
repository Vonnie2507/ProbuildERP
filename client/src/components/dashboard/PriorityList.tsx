import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityItem {
  id: string;
  title: string;
  subtitle: string;
  status: "new" | "contacted" | "quoted" | "approved" | "pending" | "overdue";
  timeAgo: string;
  urgent?: boolean;
}

interface PriorityListProps {
  title: string;
  items: PriorityItem[];
  onItemClick?: (item: PriorityItem) => void;
  onViewAll?: () => void;
  emptyMessage?: string;
}

export function PriorityList({
  title,
  items,
  onItemClick,
  onViewAll,
  emptyMessage = "No items",
}: PriorityListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} data-testid={`button-view-all-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-md hover-elevate cursor-pointer",
                item.urgent && "border-l-2 border-l-accent"
              )}
              onClick={() => onItemClick?.(item)}
              data-testid={`priority-item-${item.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{item.title}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                <Clock className="h-3 w-3" />
                <span>{item.timeAgo}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
