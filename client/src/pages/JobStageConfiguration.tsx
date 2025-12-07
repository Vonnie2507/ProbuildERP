import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Settings2,
  Workflow,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import type { JobPipeline, JobPipelineStage } from "@shared/schema";

interface PipelineCardProps {
  pipeline: JobPipeline;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditPipeline: (pipeline: JobPipeline) => void;
  onDeletePipeline: (id: string) => void;
  onAddStage: (pipelineId: string) => void;
  onEditStage: (stage: JobPipelineStage) => void;
  onDeleteStage: (id: string, pipelineId: string) => void;
  deletePending: boolean;
}

function PipelineCard({
  pipeline,
  isExpanded,
  onToggleExpand,
  onEditPipeline,
  onDeletePipeline,
  onAddStage,
  onEditStage,
  onDeleteStage,
  deletePending,
}: PipelineCardProps) {
  const { toast } = useToast();

  const { data: stages = [] } = useQuery<JobPipelineStage[]>({
    queryKey: ["/api/job-pipelines", pipeline.id, "stages"],
    enabled: isExpanded,
  });

  const reorderStagesMutation = useMutation({
    mutationFn: async ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) => {
      return apiRequest("POST", `/api/job-pipelines/${pipelineId}/stages/reorder`, { stageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines", pipeline.id, "stages"] });
    },
    onError: () => {
      toast({ title: "Failed to reorder stages", variant: "destructive" });
    },
  });

  const moveStage = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= stages.length) return;

    const newStages = [...stages];
    const temp = newStages[fromIndex];
    newStages[fromIndex] = newStages[toIndex];
    newStages[toIndex] = temp;

    reorderStagesMutation.mutate({
      pipelineId: pipeline.id,
      stageIds: newStages.map((s) => s.id),
    });
  };

  return (
    <Card data-testid={`card-pipeline-${pipeline.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={onToggleExpand}
            data-testid={`button-toggle-pipeline-${pipeline.id}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {pipeline.name}
                {!pipeline.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </CardTitle>
              {pipeline.description && (
                <CardDescription>{pipeline.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" data-testid={`text-stage-count-${pipeline.id}`}>
              {stages.length} stages
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditPipeline(pipeline)}
              data-testid={`button-edit-pipeline-${pipeline.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={deletePending}
              onClick={() => {
                if (confirm("Are you sure you want to delete this pipeline?")) {
                  onDeletePipeline(pipeline.id);
                }
              }}
              data-testid={`button-delete-pipeline-${pipeline.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {stages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Circle className="h-8 w-8 mx-auto mb-2" />
                <p>No stages defined yet</p>
              </div>
            ) : (
              stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate"
                  data-testid={`stage-${stage.id}`}
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={index === 0 || reorderStagesMutation.isPending}
                      onClick={() => moveStage(index, "up")}
                      data-testid={`button-stage-up-${stage.id}`}
                    >
                      <ChevronRight className="h-3 w-3 -rotate-90" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={index === stages.length - 1 || reorderStagesMutation.isPending}
                      onClick={() => moveStage(index, "down")}
                      data-testid={`button-stage-down-${stage.id}`}
                    >
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </Button>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium" data-testid={`text-stage-name-${stage.id}`}>
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {stage.completionType === "automatic" ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Circle className="h-3 w-3 mr-1" />
                          Manual
                        </Badge>
                      )}
                      {!stage.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                      {stage.icon && (
                        <span className="text-xs text-muted-foreground">
                          Icon: {stage.icon}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditStage(stage)}
                    data-testid={`button-edit-stage-${stage.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this stage?")) {
                        onDeleteStage(stage.id, pipeline.id);
                      }
                    }}
                    data-testid={`button-delete-stage-${stage.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => onAddStage(pipeline.id)}
              data-testid={`button-add-stage-${pipeline.id}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function JobStageConfiguration() {
  const { toast } = useToast();
  const [expandedPipelines, setExpandedPipelines] = useState<Set<string>>(new Set());

  const [showPipelineDialog, setShowPipelineDialog] = useState(false);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<JobPipeline | null>(null);
  const [editingStage, setEditingStage] = useState<JobPipelineStage | null>(null);
  const [stagePipelineId, setStagePipelineId] = useState<string | null>(null);

  const [pipelineName, setPipelineName] = useState("");
  const [pipelineDescription, setPipelineDescription] = useState("");
  const [pipelineActive, setPipelineActive] = useState(true);

  const [stageName, setStageName] = useState("");
  const [stageIcon, setStageIcon] = useState("");
  const [stageCompletionType, setStageCompletionType] = useState<"manual" | "automatic">("manual");
  const [stageActive, setStageActive] = useState(true);

  const { data: pipelines = [], isLoading } = useQuery<JobPipeline[]>({
    queryKey: ["/api/job-pipelines"],
  });

  const createPipelineMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isActive: boolean }) => {
      return apiRequest("POST", "/api/job-pipelines", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines"] });
      toast({ title: "Pipeline created successfully" });
      setShowPipelineDialog(false);
      resetPipelineForm();
    },
    onError: () => {
      toast({ title: "Failed to create pipeline", variant: "destructive" });
    },
  });

  const updatePipelineMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobPipeline> }) => {
      return apiRequest("PATCH", `/api/job-pipelines/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines"] });
      toast({ title: "Pipeline updated successfully" });
      setShowPipelineDialog(false);
      resetPipelineForm();
    },
    onError: () => {
      toast({ title: "Failed to update pipeline", variant: "destructive" });
    },
  });

  const deletePipelineMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/job-pipelines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines"] });
      toast({ title: "Pipeline deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete pipeline", variant: "destructive" });
    },
  });

  const createStageMutation = useMutation({
    mutationFn: async ({ pipelineId, data }: { pipelineId: string; data: { name: string; icon: string | null; completionType: string; isActive: boolean } }) => {
      return apiRequest("POST", `/api/job-pipelines/${pipelineId}/stages`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines", variables.pipelineId, "stages"] });
      toast({ title: "Stage created successfully" });
      setShowStageDialog(false);
      resetStageForm();
    },
    onError: () => {
      toast({ title: "Failed to create stage", variant: "destructive" });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; icon?: string | null; completionType?: string; isActive?: boolean } }) => {
      return apiRequest("PATCH", `/api/job-pipeline-stages/${id}`, data);
    },
    onSuccess: () => {
      for (const pId of Array.from(expandedPipelines)) {
        queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines", pId, "stages"] });
      }
      toast({ title: "Stage updated successfully" });
      setShowStageDialog(false);
      resetStageForm();
    },
    onError: () => {
      toast({ title: "Failed to update stage", variant: "destructive" });
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: async ({ id }: { id: string; pipelineId: string }) => {
      return apiRequest("DELETE", `/api/job-pipeline-stages/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-pipelines", variables.pipelineId, "stages"] });
      toast({ title: "Stage deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete stage", variant: "destructive" });
    },
  });

  const resetPipelineForm = () => {
    setPipelineName("");
    setPipelineDescription("");
    setPipelineActive(true);
    setEditingPipeline(null);
  };

  const resetStageForm = () => {
    setStageName("");
    setStageIcon("");
    setStageCompletionType("manual");
    setStageActive(true);
    setEditingStage(null);
    setStagePipelineId(null);
  };

  const openEditPipeline = (pipeline: JobPipeline) => {
    setEditingPipeline(pipeline);
    setPipelineName(pipeline.name);
    setPipelineDescription(pipeline.description || "");
    setPipelineActive(pipeline.isActive);
    setShowPipelineDialog(true);
  };

  const openAddStage = (pipelineId: string) => {
    resetStageForm();
    setStagePipelineId(pipelineId);
    setShowStageDialog(true);
  };

  const openEditStage = (stage: JobPipelineStage) => {
    setEditingStage(stage);
    setStagePipelineId(stage.pipelineId);
    setStageName(stage.name);
    setStageIcon(stage.icon || "");
    setStageCompletionType(stage.completionType as "manual" | "automatic");
    setStageActive(stage.isActive);
    setShowStageDialog(true);
  };

  const handleSavePipeline = () => {
    if (!pipelineName.trim()) {
      toast({ title: "Pipeline name is required", variant: "destructive" });
      return;
    }

    if (editingPipeline) {
      updatePipelineMutation.mutate({
        id: editingPipeline.id,
        data: { name: pipelineName, description: pipelineDescription, isActive: pipelineActive },
      });
    } else {
      createPipelineMutation.mutate({
        name: pipelineName,
        description: pipelineDescription,
        isActive: pipelineActive,
      });
    }
  };

  const handleSaveStage = () => {
    if (!stageName.trim()) {
      toast({ title: "Stage name is required", variant: "destructive" });
      return;
    }

    if (editingStage) {
      updateStageMutation.mutate({
        id: editingStage.id,
        data: { name: stageName, icon: stageIcon || null, completionType: stageCompletionType, isActive: stageActive },
      });
    } else if (stagePipelineId) {
      createStageMutation.mutate({
        pipelineId: stagePipelineId,
        data: { name: stageName, icon: stageIcon || null, completionType: stageCompletionType, isActive: stageActive },
      });
    }
  };

  const toggleExpanded = (pipelineId: string) => {
    const newExpanded = new Set(expandedPipelines);
    if (newExpanded.has(pipelineId)) {
      newExpanded.delete(pipelineId);
    } else {
      newExpanded.add(pipelineId);
    }
    setExpandedPipelines(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-job-stage-configuration">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Job Stage Configuration
          </h1>
          <p className="text-muted-foreground">
            Create and manage job pipelines and their stages
          </p>
        </div>
        <Button
          onClick={() => {
            resetPipelineForm();
            setShowPipelineDialog(true);
          }}
          data-testid="button-create-pipeline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Pipeline
        </Button>
      </div>

      {pipelines.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pipelines Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first job pipeline to define the stages jobs will go through.
            </p>
            <Button
              onClick={() => {
                resetPipelineForm();
                setShowPipelineDialog(true);
              }}
              data-testid="button-create-first-pipeline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              isExpanded={expandedPipelines.has(pipeline.id)}
              onToggleExpand={() => toggleExpanded(pipeline.id)}
              onEditPipeline={openEditPipeline}
              onDeletePipeline={(id) => deletePipelineMutation.mutate(id)}
              onAddStage={openAddStage}
              onEditStage={openEditStage}
              onDeleteStage={(id, pipelineId) => deleteStageMutation.mutate({ id, pipelineId })}
              deletePending={deletePipelineMutation.isPending}
            />
          ))}
        </div>
      )}

      <Dialog open={showPipelineDialog} onOpenChange={setShowPipelineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPipeline ? "Edit Pipeline" : "Create Pipeline"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pipeline-name">Pipeline Name</Label>
              <Input
                id="pipeline-name"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="e.g., Supply + Install"
                data-testid="input-pipeline-name"
              />
            </div>
            <div>
              <Label htmlFor="pipeline-description">Description (optional)</Label>
              <Textarea
                id="pipeline-description"
                value={pipelineDescription}
                onChange={(e) => setPipelineDescription(e.target.value)}
                placeholder="Describe when this pipeline should be used"
                data-testid="input-pipeline-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pipeline-active">Active</Label>
              <Switch
                id="pipeline-active"
                checked={pipelineActive}
                onCheckedChange={setPipelineActive}
                data-testid="switch-pipeline-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPipelineDialog(false)} data-testid="button-cancel-pipeline">
              Cancel
            </Button>
            <Button
              onClick={handleSavePipeline}
              disabled={createPipelineMutation.isPending || updatePipelineMutation.isPending}
              data-testid="button-save-pipeline"
            >
              {editingPipeline ? "Save Changes" : "Create Pipeline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStage ? "Edit Stage" : "Add Stage"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g., Posts Manufactured"
                data-testid="input-stage-name"
              />
            </div>
            <div>
              <Label htmlFor="stage-icon">Icon (optional)</Label>
              <Input
                id="stage-icon"
                value={stageIcon}
                onChange={(e) => setStageIcon(e.target.value)}
                placeholder="e.g., factory, check, truck"
                data-testid="input-stage-icon"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a Lucide icon name (configured later)
              </p>
            </div>
            <div>
              <Label htmlFor="stage-completion">Completion Type</Label>
              <Select
                value={stageCompletionType}
                onValueChange={(v) => setStageCompletionType(v as "manual" | "automatic")}
              >
                <SelectTrigger data-testid="select-stage-completion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual - Staff marks as complete</SelectItem>
                  <SelectItem value="automatic">Automatic - System marks as complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="stage-active">Active</Label>
              <Switch
                id="stage-active"
                checked={stageActive}
                onCheckedChange={setStageActive}
                data-testid="switch-stage-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStageDialog(false)} data-testid="button-cancel-stage">
              Cancel
            </Button>
            <Button
              onClick={handleSaveStage}
              disabled={createStageMutation.isPending || updateStageMutation.isPending}
              data-testid="button-save-stage"
            >
              {editingStage ? "Save Changes" : "Add Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
