import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarView } from "@/components/schedule/CalendarView";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  // todo: remove mock functionality
  const events: CalendarEvent[] = [
    {
      id: "1",
      jobNumber: "JOB-2024-089",
      clientName: "Williams Family",
      time: "8:00",
      type: "install",
      installer: "Jake M",
      address: "42 Ocean Drive, Scarborough",
    },
    {
      id: "2",
      jobNumber: "JOB-2024-091",
      clientName: "Harbor Homes",
      time: "10:30",
      type: "delivery",
      address: "22 Marina Bay, Fremantle",
    },
    {
      id: "3",
      jobNumber: "JOB-2024-093",
      clientName: "Coastal Living",
      time: "14:00",
      type: "measure",
      installer: "Jake M",
      address: "8 Sunset Blvd, Cottesloe",
    },
    {
      id: "4",
      jobNumber: "JOB-2024-094",
      clientName: "Pacific Builders",
      time: "9:00",
      type: "pickup",
      address: "Malaga Warehouse",
    },
    {
      id: "5",
      jobNumber: "JOB-2024-095",
      clientName: "Johnson Property",
      time: "11:00",
      type: "install",
      installer: "Jarrad K",
      address: "15 Riverside Dr, Applecross",
    },
  ];

  // todo: remove mock functionality
  const installers: Installer[] = [
    { id: "1", name: "Jake Morrison", initials: "JM", todayJobs: 2, weekJobs: 8, available: true },
    { id: "2", name: "Jarrad Kennedy", initials: "JK", todayJobs: 1, weekJobs: 6, available: true },
    { id: "3", name: "Mike Thompson", initials: "MT", todayJobs: 0, weekJobs: 5, available: false },
  ];

  // todo: remove mock functionality
  const pendingJobs = [
    { id: "p1", jobNumber: "JOB-2024-096", clientName: "Smith Residence", readyDate: "5 Dec", type: "install" as const },
    { id: "p2", jobNumber: "JOB-2024-097", clientName: "Trade Corp", readyDate: "6 Dec", type: "delivery" as const },
    { id: "p3", jobNumber: "JOB-2024-098", clientName: "Beachside Homes", readyDate: "6 Dec", type: "install" as const },
  ];

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
            {installers.map((installer) => (
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {pendingJobs.map((job) => (
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
                ))}
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
              <span className="font-semibold">2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-warning" />
                <span>Deliveries</span>
              </div>
              <span className="font-semibold">1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span>Pickups</span>
              </div>
              <span className="font-semibold">1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-accent" />
                <span>Measures</span>
              </div>
              <span className="font-semibold">1</span>
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
