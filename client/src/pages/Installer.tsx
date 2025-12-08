import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  MapPin,
  Phone,
  Clock,
  Camera,
  CheckCircle,
  Navigation,
  Package,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job, Client, ScheduleEvent, BOM } from "@shared/schema";

interface DisplayInstallerJob {
  id: string;
  jobNumber: string;
  clientName: string;
  clientPhone: string;
  address: string;
  fenceStyle: string;
  scheduledTime: string;
  status: "upcoming" | "in_progress" | "complete";
  materials: string[];
  notes?: string;
}

export default function Installer() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<DisplayInstallerJob | null>(null);
  const [variationNotes, setVariationNotes] = useState("");

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: scheduleEvents = [] } = useQuery<ScheduleEvent[]>({
    queryKey: ["/api/schedule"],
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: Partial<Job> }) => {
      return apiRequest("PATCH", `/api/jobs/${jobId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getClientPhone = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.phone || "";
  };

  const getJobStatus = (job: Job): "upcoming" | "in_progress" | "complete" => {
    const status = job.status;
    if (status === "install_complete" || status === "paid_in_full" || status === "archived" || status === "awaiting_final_payment") {
      return "complete";
    }
    if (status === "install_posts" || status === "install_panels" || status === "install_gates") {
      return "in_progress";
    }
    return "upcoming";
  };

  const getScheduledTime = (jobId: string) => {
    const event = scheduleEvents.find(e => e.jobId === jobId && e.eventType === "install");
    if (event) {
      return new Date(event.startDate).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    }
    return "TBD";
  };

  const installerJobs = jobs.filter(job => 
    job.jobType === "supply_install" && 
    ["scheduled", "install_posts", "install_panels", "install_gates", "install_complete"].includes(job.status)
  );

  const displayJobs: DisplayInstallerJob[] = installerJobs.map((job) => ({
    id: job.id,
    jobNumber: job.jobNumber,
    clientName: getClientName(job.clientId),
    clientPhone: getClientPhone(job.clientId),
    address: job.siteAddress,
    fenceStyle: `${job.fenceStyle || "PVC Fence"} - ${job.fenceHeight ? parseFloat(job.fenceHeight) / 1000 : 1.8}m height, ${job.totalLength || "N/A"}m length`,
    scheduledTime: getScheduledTime(job.id),
    status: getJobStatus(job),
    materials: [
      "PVC Posts",
      "PVC Rails",
      "PVC Pickets",
      "Post Caps",
      "Hardware Kit",
    ],
    notes: job.notes || undefined,
  }));

  const handleCheckIn = (job: DisplayInstallerJob) => {
    const originalJob = jobs.find(j => j.id === job.id);
    if (originalJob) {
      updateJobMutation.mutate(
        { jobId: job.id, data: { status: "install_posts", actualStartDate: new Date() } },
        {
          onSuccess: () => {
            toast({
              title: "Checked In",
              description: `Arrived at ${job.address}`,
            });
          },
        }
      );
    }
  };

  const handleOpenMaps = (address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, "_blank");
  };

  const handleUploadPhoto = (type: "before" | "after" | "progress") => {
    toast({
      title: "Upload Photo",
      description: `Uploading ${type} photo...`,
    });
  };

  const handleSubmitVariation = () => {
    if (variationNotes.trim() && selectedJob) {
      const originalJob = jobs.find(j => j.id === selectedJob.id);
      if (originalJob) {
        updateJobMutation.mutate(
          { jobId: selectedJob.id, data: { variationNotes: variationNotes } },
          {
            onSuccess: () => {
              toast({
                title: "Variation Submitted",
                description: "Admin will be notified for approval",
              });
              setVariationNotes("");
            },
          }
        );
      }
    }
  };

  const handleMarkComplete = (job: DisplayInstallerJob) => {
    updateJobMutation.mutate(
      { jobId: job.id, data: { status: "install_complete", completionDate: new Date() } },
      {
        onSuccess: () => {
          toast({
            title: "Job Completed",
            description: `${job.jobNumber} marked as complete`,
          });
          setSelectedJob(null);
        },
      }
    );
  };

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 border-b bg-primary text-primary-foreground">
          <Skeleton className="h-6 w-32 bg-primary-foreground/20" />
          <Skeleton className="h-4 w-48 mt-1 bg-primary-foreground/20" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b bg-primary text-primary-foreground">
        <h1 className="text-xl font-semibold" data-testid="text-installer-title">Installer App</h1>
        <p className="text-sm opacity-80">Today's Schedule</p>
      </div>

      <div className="p-4">
        <Tabs defaultValue="today">
          <TabsList className="w-full">
            <TabsTrigger value="today" className="flex-1" data-testid="tab-today">Today</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1" data-testid="tab-upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4 space-y-4">
            {displayJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No install jobs scheduled</p>
              </div>
            ) : (
              displayJobs.filter(j => j.status !== "complete").map((job) => (
                <Card
                  key={job.id}
                  className={`cursor-pointer ${selectedJob?.id === job.id ? "ring-2 ring-accent" : ""}`}
                  onClick={() => setSelectedJob(job)}
                  data-testid={`installer-job-${job.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">{job.jobNumber}</span>
                          <StatusBadge status={job.status === "in_progress" ? "in_progress" : "scheduled"} />
                        </div>
                        <h3 className="font-semibold">{job.clientName}</h3>
                        <p className="text-sm text-muted-foreground">{job.fenceStyle}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="h-4 w-4" />
                          {job.scheduledTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{job.address}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMaps(job.address);
                        }}
                        data-testid={`button-navigate-${job.id}`}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${job.clientPhone}`;
                        }}
                        data-testid={`button-call-${job.id}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      {job.status === "upcoming" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckIn(job);
                          }}
                          data-testid={`button-checkin-${job.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            {displayJobs.filter(j => j.status === "upcoming").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming jobs scheduled</p>
              </div>
            ) : (
              displayJobs.filter(j => j.status === "upcoming").map((job) => (
                <Card key={job.id} className="mb-4" data-testid={`upcoming-job-${job.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground">{job.jobNumber}</span>
                        <h3 className="font-semibold">{job.clientName}</h3>
                        <p className="text-sm text-muted-foreground truncate">{job.address}</p>
                      </div>
                      <Badge variant="secondary">{job.scheduledTime}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedJob && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t max-h-[60vh] overflow-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{selectedJob.jobNumber}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </Button>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="materials" className="flex-1">Materials</TabsTrigger>
                <TabsTrigger value="photos" className="flex-1">Photos</TabsTrigger>
                <TabsTrigger value="variation" className="flex-1">Variation</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Client</h4>
                  <p className="text-sm">{selectedJob.clientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedJob.clientPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Address</h4>
                  <p className="text-sm">{selectedJob.address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Fence Style</h4>
                  <p className="text-sm">{selectedJob.fenceStyle}</p>
                </div>
                {selectedJob.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={() => handleMarkComplete(selectedJob)}
                  disabled={updateJobMutation.isPending}
                  data-testid="button-mark-complete"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updateJobMutation.isPending ? "Updating..." : "Mark Job Complete"}
                </Button>
              </TabsContent>

              <TabsContent value="materials" className="mt-4">
                <div className="space-y-2">
                  {selectedJob.materials.map((material, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-muted rounded-md"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{material}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => handleUploadPhoto("before")}
                    data-testid="button-photo-before"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">Before Photo</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => handleUploadPhoto("progress")}
                    data-testid="button-photo-progress"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">Progress Photo</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 col-span-2"
                    onClick={() => handleUploadPhoto("after")}
                    data-testid="button-photo-after"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">After Photo</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="variation" className="mt-4 space-y-4">
                <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-sm text-warning">
                    Variations require admin approval before proceeding
                  </p>
                </div>
                <Textarea
                  placeholder="Describe the variation needed..."
                  value={variationNotes}
                  onChange={(e) => setVariationNotes(e.target.value)}
                  data-testid="textarea-variation"
                />
                <Button
                  className="w-full"
                  onClick={handleSubmitVariation}
                  disabled={!variationNotes.trim() || updateJobMutation.isPending}
                  data-testid="button-submit-variation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {updateJobMutation.isPending ? "Submitting..." : "Submit Variation"}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
