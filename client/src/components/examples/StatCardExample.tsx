import { StatCard } from "@/components/shared/StatCard";
import { Users, FileText, Briefcase, DollarSign } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <StatCard
        title="New Leads"
        value={12}
        description="Awaiting contact"
        icon={Users}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Active Quotes"
        value={24}
        description="Pending response"
        icon={FileText}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Jobs in Progress"
        value={18}
        description="In production or scheduled"
        icon={Briefcase}
      />
      <StatCard
        title="Monthly Revenue"
        value="$127,500"
        description="This month"
        icon={DollarSign}
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
}
