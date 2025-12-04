import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  Edit2, 
  GripVertical, 
  LayoutGrid, 
  BarChart3, 
  LineChart, 
  PieChart,
  Table,
  Gauge,
  ListChecks,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Copy
} from "lucide-react";
import type { DashboardWidget, RoleDashboardLayout, DashboardWidgetInstance } from "@shared/schema";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "sales", label: "Sales" },
  { value: "scheduler", label: "Scheduler" },
  { value: "production_manager", label: "Production Manager" },
  { value: "warehouse", label: "Warehouse" },
  { value: "installer", label: "Installer" },
  { value: "trade_client", label: "Trade Client" },
];

const WIDGET_ICONS: Record<string, typeof BarChart3> = {
  "bar_chart": BarChart3,
  "line_chart": LineChart,
  "pie_chart": PieChart,
  "table": Table,
  "kpi": Gauge,
  "list": ListChecks,
};

const CATEGORY_COLORS: Record<string, string> = {
  "kpi": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "chart": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "table": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "analytics": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

interface EnrichedWidgetInstance {
  id: string;
  layoutId: string;
  widgetId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  config: Record<string, any> | null;
  title?: string | null;
  createdAt?: Date;
  widget?: DashboardWidget;
}

interface LayoutWithInstances extends RoleDashboardLayout {
  instances: EnrichedWidgetInstance[];
}

export default function DashboardBuilder() {
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutDescription, setNewLayoutDescription] = useState("");
  const [editLayoutData, setEditLayoutData] = useState<{ id: string; name: string; description: string } | null>(null);
  const [layoutInstances, setLayoutInstances] = useState<EnrichedWidgetInstance[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: widgets = [], isLoading: widgetsLoading } = useQuery<DashboardWidget[]>({
    queryKey: ["/api/dashboard-builder/widgets"],
  });

  const { data: layouts = [], isLoading: layoutsLoading } = useQuery<RoleDashboardLayout[]>({
    queryKey: ["/api/dashboard-builder/layouts"],
  });

  const { data: selectedLayout, isLoading: layoutLoading } = useQuery<LayoutWithInstances>({
    queryKey: ["/api/dashboard-builder/layouts", selectedLayoutId],
    enabled: !!selectedLayoutId,
  });

  const createLayoutMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; role: string }) => {
      return apiRequest("POST", "/api/dashboard-builder/layouts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts"] });
      setIsCreateDialogOpen(false);
      setNewLayoutName("");
      setNewLayoutDescription("");
      toast({ title: "Layout created", description: "The dashboard layout has been created successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create layout.", variant: "destructive" });
    },
  });

  const updateLayoutMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
      return apiRequest("PATCH", `/api/dashboard-builder/layouts/${data.id}`, { name: data.name, description: data.description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts", selectedLayoutId] });
      setIsEditDialogOpen(false);
      setEditLayoutData(null);
      toast({ title: "Layout updated", description: "The dashboard layout has been updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update layout.", variant: "destructive" });
    },
  });

  const deleteLayoutMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/dashboard-builder/layouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts"] });
      setSelectedLayoutId(null);
      setLayoutInstances([]);
      toast({ title: "Layout deleted", description: "The dashboard layout has been deleted." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete layout.", variant: "destructive" });
    },
  });

  const publishLayoutMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/dashboard-builder/layouts/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts", selectedLayoutId] });
      toast({ title: "Layout published", description: "The dashboard layout is now active for this role." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to publish layout.", variant: "destructive" });
    },
  });

  const saveInstancesMutation = useMutation({
    mutationFn: async (data: { layoutId: string; instances: any[] }) => {
      return apiRequest("PUT", `/api/dashboard-builder/layouts/${data.layoutId}/instances`, { instances: data.instances });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-builder/layouts", selectedLayoutId] });
      setHasUnsavedChanges(false);
      toast({ title: "Layout saved", description: "Widget positions have been saved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to save layout.", variant: "destructive" });
    },
  });

  const filteredLayouts = layouts.filter(l => l.role === selectedRole);

  const handleSelectLayout = (layoutId: string) => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to switch layouts?")) {
        return;
      }
    }
    setSelectedLayoutId(layoutId);
    setHasUnsavedChanges(false);
  };

  const handleCreateLayout = () => {
    createLayoutMutation.mutate({
      name: newLayoutName,
      description: newLayoutDescription,
      role: selectedRole,
    });
  };

  const handleEditLayout = () => {
    if (!editLayoutData) return;
    updateLayoutMutation.mutate(editLayoutData);
  };

  const handleAddWidget = (widget: DashboardWidget) => {
    if (!selectedLayoutId) return;

    const maxY = layoutInstances.reduce((max, inst) => Math.max(max, inst.positionY + inst.height), 0);
    
    const newInstance: EnrichedWidgetInstance = {
      id: `temp-${Date.now()}`,
      layoutId: selectedLayoutId,
      widgetId: widget.id,
      positionX: 0,
      positionY: maxY,
      width: widget.defaultWidth,
      height: widget.defaultHeight,
      config: {},
      widget: widget,
    };

    setLayoutInstances([...layoutInstances, newInstance]);
    setHasUnsavedChanges(true);
    setIsAddWidgetDialogOpen(false);
  };

  const handleRemoveWidget = (instanceId: string) => {
    setLayoutInstances(layoutInstances.filter(i => i.id !== instanceId));
    setHasUnsavedChanges(true);
  };

  const handleMoveWidget = (instanceId: string, direction: "up" | "down") => {
    const index = layoutInstances.findIndex(i => i.id === instanceId);
    if (index === -1) return;

    const newInstances = [...layoutInstances];
    if (direction === "up" && index > 0) {
      [newInstances[index], newInstances[index - 1]] = [newInstances[index - 1], newInstances[index]];
    } else if (direction === "down" && index < newInstances.length - 1) {
      [newInstances[index], newInstances[index + 1]] = [newInstances[index + 1], newInstances[index]];
    }

    newInstances.forEach((inst, i) => {
      inst.positionY = i;
    });

    setLayoutInstances(newInstances);
    setHasUnsavedChanges(true);
  };

  const handleSaveLayout = () => {
    if (!selectedLayoutId) return;
    
    const instancesData = layoutInstances.map((inst, index) => ({
      widgetId: inst.widgetId,
      positionX: inst.positionX,
      positionY: index,
      width: inst.width,
      height: inst.height,
      config: inst.config || {},
    }));

    saveInstancesMutation.mutate({
      layoutId: selectedLayoutId,
      instances: instancesData,
    });
  };

  if (widgetsLoading || layoutsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Dashboard Builder</h1>
          <p className="text-muted-foreground">Configure role-specific dashboards with drag-and-drop widgets</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="role-select">Role:</Label>
          <Select value={selectedRole} onValueChange={(value) => {
            if (hasUnsavedChanges) {
              if (!confirm("You have unsaved changes. Are you sure you want to switch roles?")) {
                return;
              }
            }
            setSelectedRole(value);
            setSelectedLayoutId(null);
            setLayoutInstances([]);
            setHasUnsavedChanges(false);
          }}>
            <SelectTrigger className="w-48" data-testid="select-role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="layout-select">Layout:</Label>
          <Select 
            value={selectedLayoutId || ""} 
            onValueChange={handleSelectLayout}
          >
            <SelectTrigger className="w-64" data-testid="select-layout">
              <SelectValue placeholder="Select or create a layout" />
            </SelectTrigger>
            <SelectContent>
              {filteredLayouts.map((layout) => (
                <SelectItem key={layout.id} value={layout.id}>
                  <div className="flex items-center gap-2">
                    {layout.name}
                    {layout.isPublished && (
                      <Badge variant="secondary" className="ml-2">Published</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          variant="outline"
          data-testid="button-create-layout"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Layout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Widget Library
              </CardTitle>
              <CardDescription>
                Drag widgets to add them to the layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              {widgets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No widgets available
                </p>
              ) : (
                Object.entries(
                  widgets.reduce((acc, widget) => {
                    if (!acc[widget.category]) acc[widget.category] = [];
                    acc[widget.category].push(widget);
                    return acc;
                  }, {} as Record<string, DashboardWidget[]>)
                ).map(([category, categoryWidgets]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize text-muted-foreground">{category}</h4>
                    {categoryWidgets.map((widget) => {
                      const Icon = WIDGET_ICONS[widget.widgetType] || LayoutGrid;
                      return (
                        <div
                          key={widget.id}
                          className="p-3 rounded-md border bg-card hover-elevate cursor-pointer"
                          onClick={() => {
                            if (selectedLayoutId) {
                              handleAddWidget(widget);
                            } else {
                              toast({
                                title: "Select a layout",
                                description: "Please select or create a layout first.",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid={`widget-${widget.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{widget.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{widget.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {widget.defaultWidth}x{widget.defaultHeight}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedLayoutId && selectedLayout ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedLayout.name}
                      {selectedLayout.isPublished && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      )}
                      {hasUnsavedChanges && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Unsaved Changes
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedLayout.description || "No description"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditLayoutData({
                          id: selectedLayout.id,
                          name: selectedLayout.name,
                          description: selectedLayout.description || "",
                        });
                        setIsEditDialogOpen(true);
                      }}
                      data-testid="button-edit-layout"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this layout?")) {
                          deleteLayoutMutation.mutate(selectedLayoutId);
                        }
                      }}
                      data-testid="button-delete-layout"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    {!selectedLayout.isPublished && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => publishLayoutMutation.mutate(selectedLayoutId)}
                        disabled={publishLayoutMutation.isPending}
                        data-testid="button-publish-layout"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    )}
                    <Button
                      onClick={handleSaveLayout}
                      disabled={!hasUnsavedChanges || saveInstancesMutation.isPending}
                      data-testid="button-save-layout"
                    >
                      {saveInstancesMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Layout
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {layoutLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : layoutInstances.length === 0 && selectedLayout.instances?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No widgets added</h3>
                    <p className="text-muted-foreground mb-4">
                      Click on widgets from the library to add them to this layout
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(layoutInstances.length > 0 ? layoutInstances : selectedLayout.instances || []).map((instance, index) => {
                      const widget = instance.widget || widgets.find(w => w.id === instance.widgetId);
                      const Icon = WIDGET_ICONS[widget?.widgetType || "kpi"] || LayoutGrid;
                      
                      if (!widget) return null;

                      return (
                        <div
                          key={instance.id}
                          className="flex items-center gap-3 p-4 rounded-lg border bg-card hover-elevate group"
                          data-testid={`widget-instance-${instance.id}`}
                        >
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveWidget(instance.id, "up")}
                              disabled={index === 0}
                            >
                              <GripVertical className="h-4 w-4 rotate-90" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveWidget(instance.id, "down")}
                              disabled={index === layoutInstances.length - 1}
                            >
                              <GripVertical className="h-4 w-4 rotate-90" />
                            </Button>
                          </div>
                          
                          <Icon className="h-8 w-8 text-primary" />
                          
                          <div className="flex-1">
                            <p className="font-medium">{widget.name}</p>
                            <p className="text-sm text-muted-foreground">{widget.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={CATEGORY_COLORS[widget.category] || ""}>
                                {widget.category}
                              </Badge>
                              <Badge variant="outline">
                                {instance.width}x{instance.height} grid
                              </Badge>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveWidget(instance.id)}
                            data-testid={`button-remove-widget-${instance.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a Layout</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose an existing layout or create a new one to start building
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    data-testid="button-create-layout-empty"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Layout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Layout</DialogTitle>
            <DialogDescription>
              Create a new dashboard layout for the {ROLES.find(r => r.value === selectedRole)?.label} role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="e.g., Sales Dashboard v2"
                data-testid="input-layout-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout-description">Description (optional)</Label>
              <Textarea
                id="layout-description"
                value={newLayoutDescription}
                onChange={(e) => setNewLayoutDescription(e.target.value)}
                placeholder="Describe what this layout is for..."
                data-testid="input-layout-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLayout}
              disabled={!newLayoutName.trim() || createLayoutMutation.isPending}
              data-testid="button-confirm-create-layout"
            >
              {createLayoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Layout</DialogTitle>
            <DialogDescription>
              Update the layout name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-layout-name">Layout Name</Label>
              <Input
                id="edit-layout-name"
                value={editLayoutData?.name || ""}
                onChange={(e) => setEditLayoutData(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="e.g., Sales Dashboard v2"
                data-testid="input-edit-layout-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-layout-description">Description (optional)</Label>
              <Textarea
                id="edit-layout-description"
                value={editLayoutData?.description || ""}
                onChange={(e) => setEditLayoutData(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Describe what this layout is for..."
                data-testid="input-edit-layout-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditLayout}
              disabled={!editLayoutData?.name?.trim() || updateLayoutMutation.isPending}
              data-testid="button-confirm-edit-layout"
            >
              {updateLayoutMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
