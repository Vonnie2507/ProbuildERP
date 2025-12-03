import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/jobs/JobCard";
import { JobTimeline } from "@/components/jobs/JobTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type JobStatus = "in_progress" | "production" | "ready" | "scheduled" | "complete";

interface Job {
  id: string;
  jobNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  fenceStyle: string;
  jobType: "supply" | "supply_install";
  status: JobStatus;
  productionProgress: number;
  scheduledDate?: string;
  installer?: {
    name: string;
    initials: string;
  };
  totalValue: number;
  depositPaid: boolean;
  depositAmount: number;
  balanceDue: number;
}

export default function Jobs() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // todo: remove mock functionality
  const jobs: Job[] = [
    {
      id: "job-001",
      jobNumber: "JOB-2024-089",
      clientName: "Williams Family",
      clientPhone: "0412 345 678",
      clientEmail: "williams@email.com",
      address: "42 Ocean Drive, Scarborough WA 6019",
      fenceStyle: "Hampton Style - 1.8m height, 25m length",
      jobType: "supply_install",
      status: "production",
      productionProgress: 65,
      scheduledDate: "Wed, 11 Dec 2024",
      installer: { name: "Jake Morrison", initials: "JM" },
      totalValue: 8500,
      depositPaid: true,
      depositAmount: 4250,
      balanceDue: 4250,
    },
    {
      id: "job-002",
      jobNumber: "JOB-2024-091",
      clientName: "Harbor Homes",
      clientPhone: "08 9234 5678",
      clientEmail: "info@harborhomes.com.au",
      address: "22 Marina Bay, Fremantle WA 6160",
      fenceStyle: "Colonial - 60m development project",
      jobType: "supply",
      status: "in_progress",
      productionProgress: 30,
      totalValue: 24500,
      depositPaid: true,
      depositAmount: 12250,
      balanceDue: 12250,
    },
    {
      id: "job-003",
      jobNumber: "JOB-2024-087",
      clientName: "Pacific Builders",
      clientPhone: "08 9123 4567",
      clientEmail: "orders@pacificbuilders.com.au",
      address: "15 Industrial Way, Malaga WA 6090",
      fenceStyle: "Picket Style - Trade order",
      jobType: "supply",
      status: "ready",
      productionProgress: 100,
      totalValue: 6200,
      depositPaid: true,
      depositAmount: 3100,
      balanceDue: 3100,
    },
    {
      id: "job-004",
      jobNumber: "JOB-2024-093",
      clientName: "Coastal Living",
      clientPhone: "0423 456 789",
      clientEmail: "coastal@email.com",
      address: "8 Sunset Blvd, Cottesloe WA 6011",
      fenceStyle: "Nautilus - 35m premium",
      jobType: "supply_install",
      status: "scheduled",
      productionProgress: 100,
      scheduledDate: "Mon, 9 Dec 2024",
      installer: { name: "Jarrad K", initials: "JK" },
      totalValue: 12800,
      depositPaid: true,
      depositAmount: 6400,
      balanceDue: 6400,
    },
  ];

  // todo: remove mock functionality
  const timelineEvents = [
    { id: "1", title: "Quote Accepted", description: "Client approved quote and paid deposit", date: "28 Nov", status: "complete" as const },
    { id: "2", title: "Production Started", description: "Materials allocated, cutting commenced", date: "30 Nov", status: "complete" as const },
    { id: "3", title: "Cutting Complete", description: "All posts and rails cut to size", date: "2 Dec", status: "complete" as const },
    { id: "4", title: "Assembly In Progress", description: "Panels being assembled", date: "4 Dec", status: "current" as const },
    { id: "5", title: "QA Check", date: "5 Dec", status: "pending" as const },
    { id: "6", title: "Ready for Install", date: "6 Dec", status: "pending" as const },
    { id: "7", title: "Installation", description: "Scheduled with Jake M", date: "11 Dec", status: "pending" as const },
  ];

  const filteredJobs = jobs.filter(
    (job) =>
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <h1 className="text-xl font-semibold" data-testid="text-jobs-title">Jobs</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-jobs"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`cursor-pointer ${selectedJob?.id === job.id ? "ring-2 ring-accent rounded-md" : ""}`}
                onClick={() => handleJobClick(job)}
              >
                <JobCard
                  job={job}
                  onUpdateStatus={() => toast({ title: "Status updated" })}
                  onViewMaterials={() => toast({ title: "Materials view" })}
                  onViewSchedule={() => toast({ title: "Schedule view" })}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedJob ? (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-muted-foreground">{selectedJob.jobNumber}</span>
                  <StatusBadge status={selectedJob.status} />
                  <Badge variant="secondary">
                    {selectedJob.jobType === "supply_install" ? "Supply + Install" : "Supply Only"}
                  </Badge>
                </div>
                <h2 className="text-2xl font-semibold">{selectedJob.clientName}</h2>
                <p className="text-muted-foreground">{selectedJob.fenceStyle}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-update-status">Update Status</Button>
                <Button data-testid="button-view-materials">View Materials</Button>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
                <TabsTrigger value="materials" data-testid="tab-materials">Materials</TabsTrigger>
                <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
                <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedJob.clientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedJob.clientEmail}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{selectedJob.address}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-semibold">${selectedJob.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deposit Paid</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${selectedJob.depositAmount.toLocaleString()}</span>
                          <StatusBadge status="paid" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t pt-3">
                        <span className="text-muted-foreground">Balance Due</span>
                        <span className="font-semibold text-lg">${selectedJob.balanceDue.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedJob.scheduledDate ? (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedJob.scheduledDate}</span>
                          </div>
                          {selectedJob.installer && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Installer:</span>
                              <span>{selectedJob.installer.name}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not yet scheduled</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Production Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-semibold">{selectedJob.productionProgress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${selectedJob.productionProgress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <JobTimeline events={timelineEvents} />
              </TabsContent>

              <TabsContent value="materials" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Bill of Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">PVC Post 100x100 - 2.4m</span>
                        <span className="font-mono text-sm">x 6</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">PVC Rail 50x100 - 2.4m</span>
                        <span className="font-mono text-sm">x 12</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">PVC Picket Hampton - 1.8m</span>
                        <span className="font-mono text-sm">x 48</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">PVC Post Cap White</span>
                        <span className="font-mono text-sm">x 6</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Stainless Steel Screws</span>
                        <span className="font-mono text-sm">x 200</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded hover-elevate cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Quote_JOB-2024-089.pdf</p>
                            <p className="text-xs text-muted-foreground">28 Nov 2024</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded hover-elevate cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Deposit_Invoice.pdf</p>
                            <p className="text-xs text-muted-foreground">28 Nov 2024</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Site Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No photos uploaded yet</p>
                      <p className="text-xs">Photos will appear here after installation begins</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a job to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Briefcase } from "lucide-react";
