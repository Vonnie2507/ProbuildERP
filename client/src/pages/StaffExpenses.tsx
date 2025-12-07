import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import {
  Users,
  Receipt,
  DollarSign,
  Filter,
  Loader2,
  AlertCircle,
  Calendar,
  Tag,
  TrendingUp,
  RefreshCw,
  Fuel,
  Package,
  Wrench,
  Building,
  Utensils,
  Plane,
  Zap,
  Car,
  CreditCard,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { BankTransaction, User } from "@shared/schema";

interface StaffSummary {
  staffId: string;
  staffName: string;
  totalSpent: number;
  transactionCount: number;
}

interface CategorySpending {
  categoryId: string | null;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
}

const categoryIcons: Record<string, typeof Fuel> = {
  'Fuel': Fuel,
  'Office Supplies': Package,
  'Hardware': Wrench,
  'Office': Building,
  'Food & Meals': Utensils,
  'Travel': Plane,
  'Utilities': Zap,
  'Vehicle Expenses': Car,
  'Subscriptions': CreditCard,
  'Uncategorized': FileText,
};

function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num == null || isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(num);
}

function StaffExpenseDetail({ staffId, staffName }: { staffId: string; staffName: string }) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  
  const spendingUrl = `/api/financial/staff/${staffId}/spending-by-category?period=${period}`;
  const { data: categorySpending = [], isLoading: spendingLoading } = useQuery<CategorySpending[]>({
    queryKey: [spendingUrl],
  });
  
  const outstandingUrl = `/api/financial/staff/${staffId}/outstanding-receipts`;
  const { data: outstandingReceipts = [], isLoading: receiptsLoading } = useQuery<BankTransaction[]>({
    queryKey: [outstandingUrl],
  });

  const transactionsUrl = `/api/financial/staff/${staffId}/transactions`;
  const { data: transactions = [], isLoading: txLoading } = useQuery<BankTransaction[]>({
    queryKey: [transactionsUrl],
  });

  const totalSpent = categorySpending.reduce((sum, c) => sum + c.totalAmount, 0);
  const maxAmount = Math.max(...categorySpending.map(c => c.totalAmount), 1);

  const autoCategorizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/financial/auto-categorize");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Auto-Categorize Complete",
        description: data.message || `Categorized ${data.categorizedCount} transactions`,
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && 
          (query.queryKey[0].startsWith('/api/financial') || query.queryKey[0].includes('/api/financial'))
      });
    },
    onError: (error: any) => {
      toast({
        title: "Auto-Categorize Failed",
        description: error.message || "Could not auto-categorize transactions",
        variant: "destructive",
      });
    },
  });

  if (spendingLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">{staffName}</h2>
          <p className="text-sm text-muted-foreground">
            Expense breakdown and outstanding receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month' | 'all')}>
            <SelectTrigger className="w-[140px]" data-testid="select-period">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => autoCategorizeMutation.mutate()}
            disabled={autoCategorizeMutation.isPending}
            data-testid="button-auto-categorize-staff"
          >
            {autoCategorizeMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Tag className="h-4 w-4 mr-2" />
            )}
            Auto-Categorize
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Spending by Category</CardTitle>
                <Badge variant="secondary">
                  {formatCurrency(totalSpent)} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySpending.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No expenses found for this period</p>
                </div>
              ) : (
                categorySpending.map((category) => {
                  const Icon = categoryIcons[category.categoryName] || FileText;
                  const percentage = totalSpent > 0 ? (category.totalAmount / totalSpent) * 100 : 0;
                  
                  return (
                    <div key={category.categoryId || 'uncategorized'} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{category.categoryName}</p>
                            <p className="text-xs text-muted-foreground">
                              {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(category.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {transactions.slice(0, 20).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.transactionDate ? format(new Date(tx.transactionDate), 'dd MMM yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!tx.receiptId && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            No Receipt
                          </Badge>
                        )}
                        <span className="font-medium text-red-600">
                          -{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Outstanding Receipts
                </CardTitle>
                <Badge variant="destructive">{outstandingReceipts.length}</Badge>
              </div>
              <CardDescription>
                Transactions needing receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receiptsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : outstandingReceipts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All receipts submitted!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {outstandingReceipts.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-3 rounded-md border bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                      data-testid={`outstanding-receipt-${tx.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tx.transactionDate ? format(new Date(tx.transactionDate), 'dd MMM yyyy') : 'N/A'}
                          </p>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-semibold">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categories</span>
                <span className="font-semibold">{categorySpending.filter(c => c.categoryId).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Missing Receipts</span>
                <span className="font-semibold text-orange-600">{outstandingReceipts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uncategorized</span>
                <span className="font-semibold">
                  {categorySpending.find(c => !c.categoryId)?.transactionCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StaffExpenses() {
  const { toast } = useToast();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const { data: staffSummary = [], isLoading: summaryLoading } = useQuery<StaffSummary[]>({
    queryKey: ["/api/financial/staff-summary"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const autoAllocateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/financial/auto-allocate");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Auto-Allocation Complete",
        description: data.message || `Allocated ${data.allocatedCount} transactions`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/staff-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Auto-Allocation Failed",
        description: error.message || "Could not auto-allocate transactions",
        variant: "destructive",
      });
    },
  });

  if (summaryLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const selectedStaff = staffSummary.find(s => s.staffId === selectedStaffId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Staff Expenses
          </h1>
          <p className="text-muted-foreground">
            View spending by category, track receipts, and manage allocations
          </p>
        </div>
        <Button
          onClick={() => autoAllocateMutation.mutate()}
          disabled={autoAllocateMutation.isPending}
          data-testid="button-auto-allocate"
        >
          {autoAllocateMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Auto-Allocate by Card
        </Button>
      </div>

      {staffSummary.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No Staff Allocations Yet</p>
              <p className="text-sm mt-1">
                Assign staff bank card numbers in Staff Management to auto-allocate transactions.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={selectedStaffId || staffSummary[0]?.staffId} onValueChange={setSelectedStaffId}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {staffSummary.map((staff) => (
              <TabsTrigger
                key={staff.staffId}
                value={staff.staffId}
                className="flex items-center gap-2"
                data-testid={`tab-staff-${staff.staffId}`}
              >
                <span>{staff.staffName}</span>
                <Badge variant="secondary" className="ml-1">
                  {formatCurrency(staff.totalSpent)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {staffSummary.map((staff) => (
            <TabsContent key={staff.staffId} value={staff.staffId} className="mt-6">
              <StaffExpenseDetail staffId={staff.staffId} staffName={staff.staffName} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
