import { JobCard } from "@/components/jobs/JobCard";

export default function JobCardExample() {
  const job = {
    id: "job-001",
    jobNumber: "JOB-2024-089",
    clientName: "Williams Family",
    address: "42 Ocean Drive, Scarborough WA 6019",
    fenceStyle: "Hampton Style - 1.8m height, 25m length",
    jobType: "supply_install" as const,
    status: "production" as const,
    productionProgress: 65,
    scheduledDate: "Wed, 11 Dec 2024",
    installer: {
      name: "Jake Morrison",
      initials: "JM",
    },
    totalValue: 8500,
    depositPaid: true,
  };

  return (
    <div className="p-4 max-w-sm">
      <JobCard
        job={job}
        onClick={() => console.log("Job clicked")}
        onUpdateStatus={() => console.log("Update status")}
        onViewMaterials={() => console.log("View materials")}
        onViewSchedule={() => console.log("View schedule")}
      />
    </div>
  );
}
