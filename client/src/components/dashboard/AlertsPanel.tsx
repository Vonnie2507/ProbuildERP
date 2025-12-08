import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Clock, CreditCard, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "stock" | "overdue" | "payment" | "general";

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

const alertConfig: Record<AlertType, { icon: typeof AlertTriangle; color: string }> = {
  stock: {
    icon: Package,
    color: "text-warning bg-warning/10",
  },
  overdue: {
    icon: Clock,
    color: "text-destructive bg-destructive/10",
  },
  payment: {
    icon: CreditCard,
    color: "text-accent bg-accent/10",
  },
  general: {
    icon: AlertTriangle,
    color: "text-muted-foreground bg-muted",
  },
};

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
              data-testid={`alert-${alert.id}`}
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                {alert.actionLabel && alert.onAction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 mt-1 text-xs text-accent hover:text-accent/80"
                    onClick={alert.onAction}
                  >
                    {alert.actionLabel}
                  </Button>
                )}
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDismiss(alert.id)}
                  data-testid={`button-dismiss-alert-${alert.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
