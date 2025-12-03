import { ProductionOverview } from "@/components/dashboard/ProductionOverview";

export default function ProductionOverviewExample() {
  const stages = [
    { stage: "cutting" as const, jobCount: 4, progress: 75 },
    { stage: "routing" as const, jobCount: 3, progress: 60 },
    { stage: "assembly" as const, jobCount: 5, progress: 40 },
    { stage: "qa" as const, jobCount: 2, progress: 90 },
  ];

  return (
    <ProductionOverview
      stages={stages}
      totalActiveJobs={14}
      onViewProduction={() => console.log("View production clicked")}
    />
  );
}
