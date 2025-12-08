import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Play, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VoiceCall } from "@shared/schema";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function CallStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    in_progress: "secondary",
    ringing: "secondary",
    failed: "destructive",
    busy: "destructive",
    no_answer: "outline",
    canceled: "outline",
  };
  return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
}

function CallDirectionIcon({ direction }: { direction: string }) {
  if (direction === "inbound") {
    return <PhoneIncoming className="w-4 h-4 text-green-600" />;
  }
  if (direction === "outbound") {
    return <PhoneOutgoing className="w-4 h-4 text-blue-600" />;
  }
  return <PhoneMissed className="w-4 h-4 text-red-600" />;
}

export default function Calls() {
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);

  const { data: calls = [], isLoading } = useQuery<VoiceCall[]>({
    queryKey: ["/api/voice-calls"],
  });

  const recentCalls = calls.slice(0, 50);
  const activeCalls = calls.filter((c) => c.status === "in_progress" || c.status === "ringing");

  return (
    <div className="p-6 space-y-6" data-testid="page-calls">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calls</h1>
          <p className="text-muted-foreground">View call history and recordings with AI coaching insights</p>
        </div>
        {activeCalls.length > 0 && (
          <Badge variant="secondary" className="animate-pulse">
            <Phone className="w-3 h-3 mr-1" />
            {activeCalls.length} Active Call{activeCalls.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent" data-testid="tab-recent-calls">Recent Calls</TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active-calls">
            Active ({activeCalls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading calls...</div>
              ) : recentCalls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No calls yet</p>
                  <p className="text-sm">Calls will appear here once you start receiving or making them</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {recentCalls.map((call) => (
                      <div
                        key={call.id}
                        className="flex items-center gap-4 p-3 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => setSelectedCall(call)}
                        data-testid={`call-row-${call.id}`}
                      >
                        <CallDirectionIcon direction={call.direction} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {call.direction === "inbound" ? call.fromNumber : call.toNumber}
                            </span>
                            <CallStatusBadge status={call.status} />
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {call.startedAt ? format(new Date(call.startedAt), "MMM d, h:mm a") : "Pending"}
                            {call.duration && (
                              <span className="ml-2">{formatDuration(call.duration)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {call.recordingUrl && (
                            <Button size="icon" variant="ghost" data-testid={`play-recording-${call.id}`}>
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Calls</CardTitle>
            </CardHeader>
            <CardContent>
              {activeCalls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No active calls</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950"
                      data-testid={`active-call-${call.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <CallDirectionIcon direction={call.direction} />
                          <span className="font-medium">
                            {call.direction === "inbound" ? call.fromNumber : call.toNumber}
                          </span>
                        </div>
                        <Badge variant="secondary">{call.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedCall && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CallDirectionIcon direction={selectedCall.direction} />
              Call Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium">{selectedCall.fromNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{selectedCall.toNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{formatDuration(selectedCall.duration)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <CallStatusBadge status={selectedCall.status} />
              </div>
            </div>
            {selectedCall.recordingUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recording</p>
                <div className="flex items-center gap-2">
                  <audio controls src={selectedCall.recordingUrl} className="flex-1" />
                  <Button size="icon" variant="outline" asChild>
                    <a href={selectedCall.recordingUrl} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
