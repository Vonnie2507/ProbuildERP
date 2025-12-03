import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarView } from "@/components/schedule/CalendarView";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Clock, Wrench, Truck, Package, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ScheduleEvent, Job, User } from "@shared/schema";

type EventType = "install" | "delivery" | "pickup" | "measure";

interface CalendarEvent {
  id: string;
  jobNumber: string;
  clientName: string;
  time: string;
  type: EventType;
  installer?: string;
  address?: string;
}

interface Installer {
  id: string;
  name: string;
  initials: string;
  todayJobs: number;
  weekJobs: number;
  available: boolean;
}

export default function Schedule() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: scheduleEvents = [], isLoading: eventsLoading } = useQuery<ScheduleEvent[]>({
    queryKey: ["/api/schedule"],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const installerUsers = users.filter(u => u.role === "installer");

  const getJobInfo = (jobId: string | null) => {
    if (!jobId) return { jobNumber: "", clientName: "Event" };
    const job = jobs.find(j => j.id === jobId);
    return {
      jobNumber: job?.jobNumber || "",
      clientName: job?.siteAddress?.split(",")[0] || "Client",
    };
  };

  const getInstallerName = (userId: string | null) => {
    if (!userId) return undefined;
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName?.[0] || ""}` : undefined;
  };

  const events: CalendarEvent[] = scheduleEvents.map((event) => {
    const jobInfo = getJobInfo(event.jobId);
    return {
      id: event.id,
      jobNumber: jobInfo.jobNumber,
      clientName: event.title || jobInfo.clientName,
      time: new Date(event.startDate).toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      type: (event.eventType === "site_measure" ? "measure" : event.eventType) as EventType,
      installer: getInstallerName(event.assignedTo),
      address: event.description || "",
    };
  });

  const installers: Installer[] = installerUsers.map((user) => {
    const todayEvents = scheduleEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      const today = new Date();
      return e.assignedTo === user.id && 
             eventDate.toDateString() === today.toDateString();
    });

    const weekEvents = scheduleEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return e.assignedTo === user.id && 
             eventDate >= now && 
             eventDate <= weekFromNow;
    });

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`,
      todayJobs: todayEvents.length,
      weekJobs: weekEvents.length,
      available: true,
    };
  });

  const pendingJobs = jobs
    .filter(j => j.status === "ready_for_scheduling")
    .slice(0, 5)
    .map((job) => ({
      id: job.id,
      jobNumber: job.jobNumber,
      clientName: job.siteAddress?.split(",")[0] || "Client",
      readyDate: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
      type: job.jobType === "supply_only" ? "pickup" as const : "install" as const,
    }));

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleAddEvent = (date: Date) => {
    toast({
      title: "Add Event",
      description: `Creating event for ${date.toLocaleDateString()}`,
    });
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "install": return <Wrench className="h-4 w-4" />;
      case "delivery": return <Truck className="h-4 w-4" />;
      case "pickup": return <Package className="h-4 w-4" />;
      case "measure": return <Ruler className="h-4 w-4" />;
    }
  };

  const todayEvents = events.filter(e => {
    const event = scheduleEvents.find(se => se.id === e.id);
    if (!event) return false;
    const eventDate = new Date(event.startDate);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const todaySummary = {
    installs: todayEvents.filter(e => e.type === "install").length,
    deliveries: todayEvents.filter(e => e.type === "delivery").length,
    pickups: todayEvents.filter(e => e.type === "pickup").length,
    measures: todayEvents.filter(e => e.type === "measure").length,
  };

  if (eventsLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-[500px]" />
        </div>
        <div className="w-80 border-l p-4">
          <Skeleton className="h-48 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-schedule-title">Schedule</h1>
            <p className="text-sm text-muted-foreground">
              Manage installs, deliveries, pickups, and site measures
            </p>
          </div>
          <Button data-testid="button-add-event">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <CalendarView
          events={events}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
        />
      </div>

      <div className="w-80 border-l bg-card p-4 space-y-6 overflow-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Installers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {installers.length > 0 ? (
              installers.map((installer) => (
                <div
                  key={installer.id}
                  className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                  data-testid={`installer-${installer.id}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted">
                      {installer.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{installer.name}</span>
                      {!installer.available && (
                        <Badge variant="secondary" className="text-[10px]">OFF</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Today: {installer.todayJobs} | Week: {installer.weekJobs}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No installers found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {pendingJobs.length > 0 ? (
                  pendingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 rounded-md border hover-elevate cursor-pointer"
                      data-testid={`pending-job-${job.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getEventIcon(job.type)}
                        <span className="font-mono text-xs text-muted-foreground">{job.jobNumber}</span>
                      </div>
                      <p className="text-sm font-medium">{job.clientName}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Ready: {job.readyDate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending jobs to schedule
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-success" />
                <span>Installs</span>
              </div>
              <span className="font-semibold">{todaySummary.installs}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-warning" />
                <span>Deliveries</span>
              </div>
              <span className="font-semibold">{todaySummary.deliveries}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span>Pickups</span>
              </div>
              <span className="font-semibold">{todaySummary.pickups}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-accent" />
                <span>Measures</span>
              </div>
              <span className="font-semibold">{todaySummary.measures}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  {getEventIcon(selectedEvent.type)}
                </div>
                <div>
                  <p className="font-mono text-sm text-muted-foreground">{selectedEvent.jobNumber}</p>
                  <p className="font-semibold">{selectedEvent.clientName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.time}</span>
                </div>
                {selectedEvent.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.address}</span>
                  </div>
                )}
                {selectedEvent.installer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>Installer: {selectedEvent.installer}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Reassign Installer</Label>
                <Select defaultValue={selectedEvent.installer}>
                  <SelectTrigger data-testid="select-reassign-installer">
                    <SelectValue placeholder="Select installer" />
                  </SelectTrigger>
                  <SelectContent>
                    {installers.filter(i => i.available).map((installer) => (
                      <SelectItem key={installer.id} value={installer.name}>
                        {installer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button className="flex-1" data-testid="button-save-changes">Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
