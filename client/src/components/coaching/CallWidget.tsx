import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Phone, PhoneOff, PhoneIncoming, Minimize2, Maximize2, X, Mic, Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, Headphones, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VoiceCall, CallTranscript, CallChecklistStatus, CallCoachingPrompt, SalesChecklistItem } from "@shared/schema";

interface CallData {
  call: VoiceCall;
  transcripts: CallTranscript[];
  checklistStatus: CallChecklistStatus[];
  coachingPrompts: CallCoachingPrompt[];
}

const DIALPAD_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export function CallWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(true);
  const [showDialpad, setShowDialpad] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: activeCalls = [] } = useQuery<VoiceCall[]>({
    queryKey: ["/api/voice-calls/active"],
    refetchInterval: 3000,
  });

  const { data: checklistItems = [] } = useQuery<SalesChecklistItem[]>({
    queryKey: ["/api/sales-checklist-items/active"],
  });

  const { data: callData } = useQuery<CallData>({
    queryKey: ["/api/voice-calls", activeCallId],
    enabled: !!activeCallId,
    refetchInterval: activeCallId ? 2000 : false,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (promptId: string) => {
      await apiRequest("POST", `/api/coaching-prompts/${promptId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-calls", activeCallId] });
    },
  });

  const makeCallMutation = useMutation({
    mutationFn: async (toNumber: string) => {
      const response = await apiRequest("POST", "/api/voice-calls/outbound", { toNumber });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-calls/active"] });
      setPhoneNumber("");
      toast({ title: "Call initiated", description: "Connecting your call..." });
    },
    onError: (error: Error) => {
      toast({ title: "Call failed", description: error.message, variant: "destructive" });
    },
  });

  const hangupMutation = useMutation({
    mutationFn: async (callId: string) => {
      await apiRequest("POST", `/api/voice-calls/${callId}/hangup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-calls/active"] });
      toast({ title: "Call ended" });
    },
    onError: (error: Error) => {
      toast({ title: "Hangup failed", description: error.message, variant: "destructive" });
    },
  });

  const handleDialpadPress = (key: string) => {
    setPhoneNumber((prev) => prev + key);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleMakeCall = () => {
    if (phoneNumber.length >= 8) {
      makeCallMutation.mutate(phoneNumber);
    } else {
      toast({ title: "Invalid number", description: "Please enter a valid phone number", variant: "destructive" });
    }
  };

  const handleHangup = () => {
    if (activeCallId) {
      hangupMutation.mutate(activeCallId);
    }
  };

  useEffect(() => {
    if (activeCalls.length > 0) {
      const inProgress = activeCalls.find(c => c.status === "in_progress");
      const ringing = activeCalls.find(c => c.status === "ringing");
      const newActiveId = inProgress?.id || ringing?.id || activeCalls[0].id;
      setActiveCallId(newActiveId);
      if (ringing || inProgress) {
        setIsMinimized(false);
      }
    } else {
      setActiveCallId(null);
    }
  }, [activeCalls]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [callData?.transcripts]);

  const activeCall = callData?.call || activeCalls.find(c => c.id === activeCallId);
  const transcripts = callData?.transcripts || [];
  const checklistStatus = callData?.checklistStatus || [];
  const coachingPrompts = callData?.coachingPrompts || [];

  const unacknowledgedPrompts = coachingPrompts.filter(p => !p.wasAcknowledged);
  const coveredCount = checklistStatus.filter(s => s.isCovered).length;
  const totalChecklist = checklistItems.length;
  const hasActiveCall = !!activeCall;

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50"
        data-testid="call-widget-minimized"
      >
        <Button 
          size="lg" 
          className={cn(
            "rounded-full h-14 w-14 shadow-lg",
            activeCall?.status === "ringing" && "animate-pulse bg-green-600 hover:bg-green-700",
            activeCall?.status === "in_progress" && "bg-green-600 hover:bg-green-700"
          )}
          onClick={() => setIsMinimized(false)}
          data-testid="button-open-widget"
        >
          {activeCall?.status === "ringing" ? (
            <PhoneIncoming className="h-6 w-6" />
          ) : activeCall?.status === "in_progress" ? (
            <Phone className="h-6 w-6" />
          ) : (
            <Headphones className="h-6 w-6" />
          )}
        </Button>
        {unacknowledgedPrompts.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unacknowledgedPrompts.length}
          </Badge>
        )}
        {hasActiveCall && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "fixed bottom-4 right-4 z-50 shadow-2xl border-2 transition-all duration-300",
        isExpanded ? "w-[500px] h-[700px]" : "w-[380px] h-[520px]",
        activeCall?.status === "ringing" && "border-green-500"
      )}
      data-testid="call-widget"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            {activeCall?.status === "in_progress" && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            {activeCall?.status === "ringing" && (
              <PhoneIncoming className="w-4 h-4 text-green-600 animate-bounce" />
            )}
            {!activeCall && (
              <Headphones className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">
              {activeCall 
                ? `${activeCall.direction === "inbound" ? "Incoming" : "Outgoing"} Call`
                : "Call Coach"
              }
            </span>
            {activeCall && (
              <span className="text-xs text-muted-foreground">
                {activeCall.direction === "inbound" ? activeCall.fromNumber : activeCall.toNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-expand-widget"
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={() => setIsMinimized(true)}
              data-testid="button-minimize-widget"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {unacknowledgedPrompts.length > 0 && (
          <div className="p-2 bg-orange-50 dark:bg-orange-950 border-b border-orange-200 dark:border-orange-800">
            {unacknowledgedPrompts.slice(0, 2).map((prompt) => (
              <div 
                key={prompt.id} 
                className="flex items-start gap-2 p-2 rounded-md bg-white dark:bg-background mb-1 last:mb-0"
              >
                <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{prompt.message}</p>
                  {prompt.triggerText && (
                    <p className="text-xs text-muted-foreground truncate">
                      Triggered by: "{prompt.triggerText}"
                    </p>
                  )}
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => acknowledgeMutation.mutate(prompt.id)}
                  data-testid={`acknowledge-prompt-${prompt.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          <div 
            className="flex items-center justify-between px-3 py-2 border-b cursor-pointer hover-elevate"
            onClick={() => setShowChecklist(!showChecklist)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Sales Checklist</span>
              <Badge variant="secondary" className="text-xs">
                {coveredCount}/{totalChecklist}
              </Badge>
            </div>
            {showChecklist ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </div>

          {showChecklist && (
            <div className="px-3 py-2 border-b bg-muted/30 max-h-32 overflow-auto">
              <div className="grid grid-cols-2 gap-1">
                {checklistItems.map((item) => {
                  const status = checklistStatus.find(s => s.checklistItemId === item.id);
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-1.5 text-xs"
                      data-testid={`checklist-item-${item.id}`}
                    >
                      {status?.isCovered ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className={cn(
                          "h-3 w-3 flex-shrink-0",
                          item.isRequired ? "text-orange-500" : "text-muted-foreground"
                        )} />
                      )}
                      <span className={cn(
                        "truncate",
                        status?.isCovered && "line-through text-muted-foreground"
                      )}>
                        {item.question}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-2">
              {!activeCall ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Phone className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No active call</p>
                  <p className="text-xs">Start a call to see live transcription</p>
                </div>
              ) : transcripts.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Mic className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Waiting for conversation...</p>
                  <p className="text-xs">Transcription will appear here</p>
                </div>
              ) : (
                transcripts.map((transcript) => (
                  <div 
                    key={transcript.id}
                    className={cn(
                      "p-2 rounded-lg text-sm",
                      transcript.speaker === "staff" 
                        ? "bg-primary/10 ml-4" 
                        : "bg-muted mr-4"
                    )}
                    data-testid={`transcript-${transcript.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {transcript.speaker}
                      </span>
                    </div>
                    <p>{transcript.text}</p>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t bg-muted/50">
          {!activeCall && showDialpad && (
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="text-center text-lg font-mono"
                  data-testid="input-phone-number"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleBackspace}
                  disabled={phoneNumber.length === 0}
                  data-testid="button-backspace"
                >
                  <Delete className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DIALPAD_KEYS.flat().map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-10 text-lg font-medium"
                    onClick={() => handleDialpadPress(key)}
                    data-testid={`dialpad-${key}`}
                  >
                    {key}
                  </Button>
                ))}
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleMakeCall}
                disabled={phoneNumber.length < 8 || makeCallMutation.isPending}
                data-testid="button-make-call"
              >
                <Phone className="h-4 w-4 mr-2" />
                {makeCallMutation.isPending ? "Calling..." : "Call"}
              </Button>
            </div>
          )}

          {!activeCall && !showDialpad && (
            <div className="p-3 flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDialpad(true)}
                data-testid="button-show-dialpad"
              >
                <Phone className="h-4 w-4 mr-2" />
                Show Dialpad
              </Button>
            </div>
          )}

          {activeCall?.status === "ringing" && activeCall.direction === "inbound" && (
            <div className="p-3 flex items-center justify-center gap-3">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 rounded-full"
                data-testid="button-answer-call"
              >
                <Phone className="h-5 w-5 mr-2" />
                Answer
              </Button>
              <Button 
                size="lg" 
                variant="destructive" 
                className="rounded-full"
                onClick={handleHangup}
                disabled={hangupMutation.isPending}
                data-testid="button-decline-call"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          )}

          {activeCall?.status === "in_progress" && (
            <div className="p-3 flex items-center justify-center">
              <Button 
                size="lg" 
                variant="destructive" 
                className="rounded-full"
                onClick={handleHangup}
                disabled={hangupMutation.isPending}
                data-testid="button-end-call"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                {hangupMutation.isPending ? "Ending..." : "End Call"}
              </Button>
            </div>
          )}

          {activeCall?.status === "ringing" && activeCall.direction === "outbound" && (
            <div className="p-3 flex flex-col items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground animate-pulse">Ringing...</span>
              <Button 
                size="lg" 
                variant="destructive" 
                className="rounded-full"
                onClick={handleHangup}
                disabled={hangupMutation.isPending}
                data-testid="button-cancel-call"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
