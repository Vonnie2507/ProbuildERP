import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, Column, Action } from "@/components/shared/DataTable";
import { Search, Plus, Filter, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface InventoryTableProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddProduct?: () => void;
  onAdjustStock?: (product: Product) => void;
  showCostPrice?: boolean;
}

export function InventoryTable({
  products,
  onProductClick,
  onAddProduct,
  onAdjustStock,
  showCostPrice = true,
}: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product): "in_stock" | "low_stock" | "out_of_stock" => {
    if (product.stockOnHand === 0) return "out_of_stock";
    if (product.stockOnHand <= product.reorderPoint) return "low_stock";
    return "in_stock";
  };

  const columns: Column<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (product) => (
        <span className="font-mono text-sm">{product.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      render: (product) => (
        <div>
          <span className="font-medium">{product.name}</span>
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {product.category}
          </Badge>
        </div>
      ),
    },
    {
      key: "stockOnHand",
      header: "Stock",
      sortable: true,
      render: (product) => {
        const status = getStockStatus(product);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{product.stockOnHand}</span>
            {status === "low_stock" && (
              <StatusBadge status="low_stock" />
            )}
            {status === "out_of_stock" && (
              <Badge variant="destructive" className="text-[10px]">OUT</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "reorderPoint",
      header: "Reorder At",
      sortable: true,
    },
    ...(showCostPrice
      ? [
          {
            key: "costPrice",
            header: "Cost",
            sortable: true,
            render: (product: Product) => `$${product.costPrice.toFixed(2)}`,
          } as Column<Product>,
        ]
      : []),
    {
      key: "sellPrice",
      header: "Sell Price",
      sortable: true,
      render: (product) => `$${product.sellPrice.toFixed(2)}`,
    },
  ];

  const actions: Action<Product>[] = [
    {
      label: "Adjust Stock",
      onClick: (product) => onAdjustStock?.(product),
    },
    {
      label: "View Details",
      onClick: (product) => onProductClick?.(product),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Products & Inventory</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {onAddProduct && (
              <Button size="sm" onClick={onAddProduct} data-testid="button-add-product">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-products"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredProducts}
          columns={columns}
          actions={actions}
          onRowClick={onProductClick}
          keyExtractor={(product) => product.id}
          emptyMessage="No products found"
        />
      </CardContent>
    </Card>
  );
}
