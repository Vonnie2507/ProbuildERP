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
  ChevronUp,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Mic,
} from "lucide-react";
import type { SalesChecklistItem } from "@shared/schema";

const CATEGORIES = [
  { value: "requirements", label: "Requirements" },
  { value: "site_conditions", label: "Site Conditions" },
  { value: "timeline", label: "Timeline" },
  { value: "budget", label: "Budget" },
  { value: "other", label: "Other" },
];

export default function SalesChecklistConfig() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesChecklistItem | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    category: "requirements",
    keywords: "",
    suggestedResponse: "",
    isRequired: false,
    isActive: true,
  });

  const { data: items = [], isLoading } = useQuery<SalesChecklistItem[]>({
    queryKey: ["/api/sales-checklist-items"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<SalesChecklistItem>) => {
      return apiRequest("POST", "/api/sales-checklist-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-checklist-items"] });
      toast({ title: "Checklist item created" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Failed to create checklist item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalesChecklistItem> }) => {
      return apiRequest("PATCH", `/api/sales-checklist-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-checklist-items"] });
      toast({ title: "Checklist item updated" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Failed to update checklist item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sales-checklist-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-checklist-items"] });
      toast({ title: "Checklist item deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete checklist item", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      return apiRequest("POST", "/api/sales-checklist-items/reorder", { itemIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-checklist-items"] });
    },
    onError: () => {
      toast({ title: "Failed to reorder items", variant: "destructive" });
    },
  });

  const openDialog = (item?: SalesChecklistItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question: item.question,
        description: item.description || "",
        category: item.category || "requirements",
        keywords: Array.isArray(item.keywords) ? item.keywords.join(", ") : "",
        suggestedResponse: item.suggestedResponse || "",
        isRequired: item.isRequired,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        question: "",
        description: "",
        category: "requirements",
        keywords: "",
        suggestedResponse: "",
        isRequired: false,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = () => {
    const keywords = formData.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    const data = {
      question: formData.question,
      description: formData.description || null,
      category: formData.category,
      keywords,
      suggestedResponse: formData.suggestedResponse || null,
      isRequired: formData.isRequired,
      isActive: formData.isActive,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const moveItem = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[fromIndex];
    newItems[fromIndex] = newItems[toIndex];
    newItems[toIndex] = temp;

    reorderMutation.mutate(newItems.map((i) => i.id));
  };

  const getCategoryLabel = (value: string | null) => {
    return CATEGORIES.find((c) => c.value === value)?.label || "Other";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeCount = items.filter((i) => i.isActive).length;
  const requiredCount = items.filter((i) => i.isRequired).length;

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mic className="h-6 w-6" />
            Sales Call Checklist
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure questions staff should ask during sales calls. The AI coach will track coverage and prompt when items are missed.
          </p>
        </div>
        <Button onClick={() => openDialog()} data-testid="button-add-checklist-item">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-sm text-muted-foreground">Active Questions</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{requiredCount}</div>
            <div className="text-sm text-muted-foreground">Required Questions</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Questions</CardTitle>
          <CardDescription>
            Questions will be tracked in real-time during calls. The AI analyzes the conversation to detect when each topic is covered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No checklist items yet</p>
              <p className="text-sm">Add questions that staff should ask during sales calls.</p>
              <Button className="mt-4" onClick={() => openDialog()} data-testid="button-add-first-item">
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border hover-elevate ${
                    !item.isActive ? "opacity-50" : ""
                  }`}
                  data-testid={`checklist-item-${item.id}`}
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => moveItem(index, "up")}
                      data-testid={`button-item-up-${item.id}`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={index === items.length - 1 || reorderMutation.isPending}
                      onClick={() => moveItem(index, "down")}
                      data-testid={`button-item-down-${item.id}`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{item.question}</span>
                      {item.isRequired && (
                        <Badge variant="default" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(item.category)}
                      </Badge>
                      {!item.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {item.description}
                      </p>
                    )}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(item.keywords as string[]).slice(0, 5).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                        {(item.keywords as string[]).length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{(item.keywords as string[]).length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.suggestedResponse && (
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(item)}
                      data-testid={`button-edit-item-${item.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm("Delete this checklist item?")) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      data-testid={`button-delete-item-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Checklist Question" : "Add Checklist Question"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g., What fence height do you need?"
                data-testid="input-question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief explanation for staff"
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="height, tall, high, 1.8m, 1.5m"
                data-testid="input-keywords"
              />
              <p className="text-xs text-muted-foreground">
                Keywords help the AI detect when this topic is mentioned in the conversation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedResponse">Suggested Response</Label>
              <Textarea
                id="suggestedResponse"
                value={formData.suggestedResponse}
                onChange={(e) => setFormData({ ...formData, suggestedResponse: e.target.value })}
                placeholder="A helpful response to show to staff if customer asks about this topic"
                className="min-h-[80px]"
                data-testid="input-suggested-response"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                  data-testid="switch-required"
                />
                <Label htmlFor="isRequired">Required question</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.question || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
