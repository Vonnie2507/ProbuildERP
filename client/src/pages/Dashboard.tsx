import { useState } from "react";
import { useLocation } from "wouter";
import { StatCard } from "@/components/shared/StatCard";
import { PriorityList } from "@/components/dashboard/PriorityList";
import { ScheduleSnapshot } from "@/components/dashboard/ScheduleSnapshot";
import { ProductionOverview } from "@/components/dashboard/ProductionOverview";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Button } from "@/components/ui/button";
import { Users, FileText, Briefcase, DollarSign, Plus, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // todo: remove mock functionality
  const stats = {
    newLeads: 12,
    activeQuotes: 24,
    jobsInProgress: 18,
    monthlyRevenue: 127500,
  };

  // todo: remove mock functionality
  const priorityLeads = [
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

  // todo: remove mock functionality
  const quotesFollowUp = [
    {
      id: "4",
      title: "Harbor Homes",
      subtitle: "Quote sent 48hrs ago - $12,500",
      status: "quoted" as const,
      timeAgo: "48h",
    },
    {
      id: "5",
      title: "Coastal Living",
      subtitle: "Quote sent 3 days ago - $8,200",
      status: "overdue" as const,
      timeAgo: "3d",
    },
  ];

  // todo: remove mock functionality
  const scheduleItems = [
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

  // todo: remove mock functionality
  const productionStages = [
    { stage: "cutting" as const, jobCount: 4, progress: 75 },
    { stage: "routing" as const, jobCount: 3, progress: 60 },
    { stage: "assembly" as const, jobCount: 5, progress: 40 },
    { stage: "qa" as const, jobCount: 2, progress: 90 },
  ];

  // todo: remove mock functionality
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      type: "stock" as const,
      title: "Low Stock Alert",
      message: "PVC Post Cap White - Only 12 remaining",
      actionLabel: "Reorder Now",
      onAction: () => setLocation("/inventory"),
    },
    {
      id: "2",
      type: "overdue" as const,
      title: "Quote Follow-up Overdue",
      message: "Johnson Property - Quote sent 5 days ago",
      actionLabel: "Contact Client",
      onAction: () => setLocation("/leads"),
    },
    {
      id: "3",
      type: "payment" as const,
      title: "Deposit Pending",
      message: "Smith Residence - Awaiting deposit for 3 days",
    },
  ]);

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setLocation("/leads")} data-testid="button-new-lead">
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Leads"
          value={stats.newLeads}
          description="Awaiting contact"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Quotes"
          value={stats.activeQuotes}
          description="Pending response"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Jobs in Progress"
          value={stats.jobsInProgress}
          description="In production or scheduled"
          icon={Briefcase}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          description="This month"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriorityList
              title="New Leads"
              items={priorityLeads}
              onItemClick={() => setLocation("/leads")}
              onViewAll={() => setLocation("/leads")}
              emptyMessage="No new leads"
            />
            <PriorityList
              title="Quotes Awaiting Follow-Up"
              items={quotesFollowUp}
              onItemClick={() => setLocation("/leads")}
              onViewAll={() => setLocation("/leads")}
              emptyMessage="All quotes followed up"
            />
          </div>
          <ScheduleSnapshot
            date={today}
            items={scheduleItems}
            onItemClick={() => setLocation("/schedule")}
            onViewSchedule={() => setLocation("/schedule")}
          />
        </div>
        <div className="space-y-6">
          <ProductionOverview
            stages={productionStages}
            totalActiveJobs={14}
            onViewProduction={() => setLocation("/production")}
          />
          <AlertsPanel alerts={alerts} onDismiss={handleDismissAlert} />
        </div>
      </div>
    </div>
  );
}
