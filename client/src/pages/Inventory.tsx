import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { StatCard } from "@/components/shared/StatCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockOnHand: number;
  reorderPoint: number;
  costPrice: number;
  sellPrice: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export default function Inventory() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [adjustmentQty, setAdjustmentQty] = useState("");

  // todo: remove mock functionality
  const products: Product[] = [
    { id: "1", sku: "PVC-POST-100", name: "PVC Post 100x100 White", category: "Posts", stockOnHand: 45, reorderPoint: 20, costPrice: 85.00, sellPrice: 145.00, status: "in_stock" },
    { id: "2", sku: "PVC-POST-125", name: "PVC Post 125x125 White", category: "Posts", stockOnHand: 12, reorderPoint: 15, costPrice: 120.00, sellPrice: 195.00, status: "low_stock" },
    { id: "3", sku: "PVC-RAIL-50", name: "PVC Rail 50x100 White", category: "Rails", stockOnHand: 78, reorderPoint: 30, costPrice: 45.00, sellPrice: 75.00, status: "in_stock" },
    { id: "4", sku: "PVC-PICK-HAM", name: "PVC Picket Hampton 1.8m", category: "Pickets", stockOnHand: 156, reorderPoint: 50, costPrice: 25.00, sellPrice: 42.00, status: "in_stock" },
    { id: "5", sku: "PVC-PICK-COL", name: "PVC Picket Colonial 1.5m", category: "Pickets", stockOnHand: 8, reorderPoint: 40, costPrice: 22.00, sellPrice: 38.00, status: "low_stock" },
    { id: "6", sku: "PVC-CAP-100", name: "PVC Post Cap 100mm White", category: "Caps", stockOnHand: 0, reorderPoint: 25, costPrice: 12.00, sellPrice: 22.00, status: "out_of_stock" },
    { id: "7", sku: "PVC-CAP-125", name: "PVC Post Cap 125mm White", category: "Caps", stockOnHand: 34, reorderPoint: 20, costPrice: 15.00, sellPrice: 28.00, status: "in_stock" },
    { id: "8", sku: "HW-SCREW-SS", name: "Stainless Steel Screws (100pk)", category: "Hardware", stockOnHand: 52, reorderPoint: 20, costPrice: 18.00, sellPrice: 32.00, status: "in_stock" },
    { id: "9", sku: "HW-BRKT-STD", name: "Rail Bracket Standard", category: "Hardware", stockOnHand: 180, reorderPoint: 50, costPrice: 3.50, sellPrice: 6.50, status: "in_stock" },
    { id: "10", sku: "GATE-SING-1.2", name: "Single Gate Kit 1.2m", category: "Gates", stockOnHand: 6, reorderPoint: 5, costPrice: 280.00, sellPrice: 450.00, status: "in_stock" },
  ];

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.status === "low_stock").length;
  const outOfStockCount = products.filter(p => p.status === "out_of_stock").length;
  const totalValue = products.reduce((acc, p) => acc + (p.stockOnHand * p.costPrice), 0);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    toast({
      title: "Product Selected",
      description: `Viewing ${product.name}`,
    });
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustDialogOpen(true);
  };

  const handleSubmitAdjustment = () => {
    toast({
      title: "Stock Adjusted",
      description: `${adjustmentType === "add" ? "Added" : "Removed"} ${adjustmentQty} units`,
    });
    setIsAdjustDialogOpen(false);
    setAdjustmentQty("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-inventory-title">Products & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage stock levels, pricing, and reorder points
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          description="Active SKUs"
          icon={Package}
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          description="Below reorder point"
          icon={AlertTriangle}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          description="Needs attention"
          icon={TrendingDown}
        />
        <StatCard
          title="Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          description="At cost price"
          icon={DollarSign}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-products">All Products</TabsTrigger>
          <TabsTrigger value="low_stock" data-testid="tab-low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out_of_stock" data-testid="tab-out-of-stock">Out of Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <InventoryTable
            products={products}
            onProductClick={handleProductClick}
            onAdjustStock={handleAdjustStock}
            onAddProduct={() => toast({ title: "Add product" })}
          />
        </TabsContent>

        <TabsContent value="low_stock" className="mt-6">
          <InventoryTable
            products={products.filter(p => p.status === "low_stock")}
            onProductClick={handleProductClick}
            onAdjustStock={handleAdjustStock}
          />
        </TabsContent>

        <TabsContent value="out_of_stock" className="mt-6">
          <InventoryTable
            products={products.filter(p => p.status === "out_of_stock")}
            onProductClick={handleProductClick}
            onAdjustStock={handleAdjustStock}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-mono text-sm text-muted-foreground">{selectedProduct.sku}</p>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Current stock: <span className="font-semibold">{selectedProduct.stockOnHand}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as "add" | "remove")}>
                  <SelectTrigger data-testid="select-adjustment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="remove">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  placeholder="Enter quantity"
                  data-testid="input-adjustment-qty"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAdjustDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSubmitAdjustment} data-testid="button-submit-adjustment">
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
