import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Phone,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  User,
  Users,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { VoiceCall, CallTranscript, SalesChecklistItem, CallChecklistStatus, CallCoachingPrompt } from "@shared/schema";

interface ChecklistItemWithStatus extends SalesChecklistItem {
  status?: CallChecklistStatus;
}

interface LiveCallCoachPanelProps {
  callId: string;
  onClose?: () => void;
}

export function LiveCallCoachPanel({ callId, onClose }: LiveCallCoachPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    transcript: true,
    checklist: true,
    prompts: true,
  });
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { data: callData, refetch } = useQuery<{
    call: VoiceCall;
    transcripts: CallTranscript[];
    checklistStatus: CallChecklistStatus[];
    coachingPrompts: CallCoachingPrompt[];
  }>({
    queryKey: ["/api/voice-calls", callId],
    refetchInterval: 2000,
  });

  const { data: checklistItems = [] } = useQuery<SalesChecklistItem[]>({
    queryKey: ["/api/sales-checklist-items/active"],
  });

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [callData?.transcripts.length]);

  const call = callData?.call;
  const transcripts = callData?.transcripts || [];
  const checklistStatus = callData?.checklistStatus || [];
  const coachingPrompts = callData?.coachingPrompts || [];

  const checklistWithStatus: ChecklistItemWithStatus[] = checklistItems.map((item) => ({
    ...item,
    status: checklistStatus.find((s) => s.checklistItemId === item.id),
  }));

  const coveredCount = checklistWithStatus.filter((i) => i.status?.isCovered).length;
  const requiredItems = checklistWithStatus.filter((i) => i.isRequired);
  const requiredCoveredCount = requiredItems.filter((i) => i.status?.isCovered).length;
  const progress = checklistItems.length > 0 ? (coveredCount / checklistItems.length) * 100 : 0;

  const activePrompts = coachingPrompts.filter((p) => !p.wasAcknowledged);

  const formatDuration = (startTime: Date | null, endTime?: Date | null) => {
    if (!startTime) return "0:00";
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!call) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading call data...
        </CardContent>
      </Card>
    );
  }

  const isCallActive = call.status === "ringing" || call.status === "in_progress";

  return (
    <Card className="w-full max-w-md flex flex-col h-[calc(100vh-8rem)] overflow-hidden" data-testid="live-call-coach-panel">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isCallActive ? "bg-green-500/20 animate-pulse" : "bg-muted"}`}>
              <Phone className={`h-4 w-4 ${isCallActive ? "text-green-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-base">
                {isCallActive ? "Live Call Coach" : "Call Review"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formatDuration(call.startedAt, call.endedAt)}
                {isCallActive && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    <Mic className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-coach">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-2 mt-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{coveredCount}/{checklistItems.length} topics covered</span>
          <span>{requiredCoveredCount}/{requiredItems.length} required</span>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activePrompts.length > 0 && (
          <div className="px-4 pb-3 flex-shrink-0">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    {activePrompts[0].message}
                  </p>
                  {activePrompts[0].relatedChecklistItemId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {checklistItems.find((i) => i.id === activePrompts[0].relatedChecklistItemId)?.suggestedResponse}
                    </p>
                  )}
                </div>
              </div>
              {activePrompts.length > 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{activePrompts.length - 1} more suggestions
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />

        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50"
          onClick={() => toggleSection("transcript")}
          data-testid="toggle-transcript-section"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">Transcript</span>
            <Badge variant="secondary" className="text-xs">{transcripts.length}</Badge>
          </div>
          {expandedSections.transcript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {expandedSections.transcript && (
          <ScrollArea className="flex-1 px-4 min-h-0">
            <div className="space-y-2 py-2">
              {transcripts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isCallActive ? "Waiting for conversation..." : "No transcript available"}
                </p>
              ) : (
                transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`flex gap-2 ${t.speaker === "staff" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        t.speaker === "staff"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                        {t.speaker === "staff" ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {t.speaker === "staff" ? "You" : "Customer"}
                      </div>
                      <p>{t.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </ScrollArea>
        )}

        <Separator />

        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50"
          onClick={() => toggleSection("checklist")}
          data-testid="toggle-checklist-section"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Checklist</span>
            <Badge variant="secondary" className="text-xs">
              {coveredCount}/{checklistItems.length}
            </Badge>
          </div>
          {expandedSections.checklist ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {expandedSections.checklist && (
          <ScrollArea className="max-h-48 px-4">
            <div className="space-y-1 py-2">
              {checklistWithStatus.map((item) => {
                const isCovered = item.status?.isCovered;
                const isRequired = item.isRequired;
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      isCovered ? "bg-green-500/10" : isRequired ? "bg-orange-500/10" : ""
                    }`}
                    data-testid={`checklist-item-status-${item.id}`}
                  >
                    {isCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : isRequired ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isCovered ? "line-through text-muted-foreground" : ""}`}>
                        {item.question}
                      </p>
                      {!isCovered && item.suggestedResponse && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Tip: {item.suggestedResponse}
                        </p>
                      )}
                    </div>
                    {isRequired && !isCovered && (
                      <Badge variant="destructive" className="text-xs flex-shrink-0">Required</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}

export function MiniCallCoachBadge({ callId }: { callId: string }) {
  const { data: checklistItems = [] } = useQuery<SalesChecklistItem[]>({
    queryKey: ["/api/sales-checklist-items/active"],
  });

  const { data: callData } = useQuery<{
    call: VoiceCall;
    transcripts: CallTranscript[];
    checklistStatus: CallChecklistStatus[];
    coachingPrompts: CallCoachingPrompt[];
  }>({
    queryKey: ["/api/voice-calls", callId],
    refetchInterval: 2000,
  });

  const checklistStatus = callData?.checklistStatus || [];
  const coachingPrompts = callData?.coachingPrompts || [];
  
  const coveredCount = checklistStatus.filter((s) => s.isCovered).length;
  const activePrompts = coachingPrompts.filter((p) => !p.wasAcknowledged);

  return (
    <div className="flex items-center gap-2" data-testid="mini-call-coach-badge">
      <Badge variant="outline" className="text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {coveredCount}/{checklistItems.length}
      </Badge>
      {activePrompts.length > 0 && (
        <Badge variant="default" className="text-xs bg-orange-500">
          <Lightbulb className="h-3 w-3 mr-1" />
          {activePrompts.length}
        </Badge>
      )}
    </div>
  );
}
