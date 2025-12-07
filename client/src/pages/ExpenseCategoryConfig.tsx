import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ExpenseCategoryConfig() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryActive, setCategoryActive] = useState(true);

  const { data: categories = [], isLoading } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isActive: boolean }) => {
      const res = await apiRequest("POST", "/api/expense-categories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Category Created", description: "Expense category added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create category", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; description?: string; isActive?: boolean } }) => {
      const res = await apiRequest("PATCH", `/api/expense-categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Category Updated", description: "Changes saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update category", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expense-categories/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Category Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete category", 
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setShowAddDialog(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryActive(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryActive(category.isActive);
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: {
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
          isActive: categoryActive,
        },
      });
    } else {
      createMutation.mutate({
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        isActive: categoryActive,
      });
    }
  };

  const handleToggleActive = (category: ExpenseCategory) => {
    updateMutation.mutate({
      id: category.id,
      data: { isActive: !category.isActive },
    });
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="heading-expense-categories">
            <Tag className="h-6 w-6" />
            Expense Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure expense categories for staff receipt submissions and transaction allocations
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowAddDialog(true); }}
          data-testid="button-add-category"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
          <CardDescription>
            Define expense categories that staff can select when submitting receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No Categories Yet</p>
              <p className="text-sm mt-1">
                Add your first expense category to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category)}
                        data-testid={`switch-active-${category.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                          data-testid={`button-edit-${category.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(category.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${category.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Update the expense category details" 
                : "Create a new expense category for staff to use"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Fuel, Office Supplies, Tools"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                data-testid="input-category-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description (optional)</Label>
              <Input
                id="categoryDescription"
                placeholder="Brief description of this category"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                data-testid="input-category-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="categoryActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Only active categories appear in receipt forms
                </p>
              </div>
              <Switch
                id="categoryActive"
                checked={categoryActive}
                onCheckedChange={setCategoryActive}
                data-testid="switch-category-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!categoryName.trim() || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-category"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
