import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Package,
  CreditCard,
  Download,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Quote, Job, Client, Product } from "@shared/schema";

interface DisplayTradeQuote {
  id: string;
  quoteNumber: string;
  description: string;
  totalAmount: number;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  expiresAt: string;
}

interface DisplayTradeOrder {
  id: string;
  orderNumber: string;
  description: string;
  totalAmount: number;
  status: "in_progress" | "production" | "ready" | "complete";
  estimatedReady: string;
}

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  tradePrice: number;
}

export default function Trade() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: quotes = [], isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const tradeClients = clients.filter(c => c.clientType === "trade");
  const tradeClientIds = tradeClients.map(c => c.id);

  const tradeQuotes = quotes.filter(q => q.isTradeQuote || tradeClientIds.includes(q.clientId));
  const tradeJobs = jobs.filter(j => tradeClientIds.includes(j.clientId));

  const getQuoteStatus = (quote: Quote): "pending" | "approved" | "declined" => {
    if (quote.status === "approved") return "approved";
    if (quote.status === "declined" || quote.status === "expired") return "declined";
    return "pending";
  };

  const getJobStatus = (job: Job): "in_progress" | "production" | "ready" | "complete" => {
    const status = job.status;
    if (status === "paid_in_full" || status === "archived" || status === "install_complete") {
      return "complete";
    }
    if (status === "ready_for_scheduling") {
      return "ready";
    }
    if (status.includes("manufacturing") || status === "qa_check") {
      return "production";
    }
    return "in_progress";
  };

  const displayQuotes: DisplayTradeQuote[] = tradeQuotes.map((quote) => ({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    description: quote.siteAddress || "Trade Order",
    totalAmount: parseFloat(quote.totalAmount) || 0,
    status: getQuoteStatus(quote),
    createdAt: new Date(quote.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    expiresAt: quote.validUntil 
      ? new Date(quote.validUntil).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
      : "14 days from creation",
  }));

  const displayOrders: DisplayTradeOrder[] = tradeJobs.map((job) => ({
    id: job.id,
    orderNumber: job.jobNumber,
    description: `${job.fenceStyle || "PVC Fence"} - ${job.totalLength || "N/A"}m`,
    totalAmount: parseFloat(job.totalAmount) || 0,
    status: getJobStatus(job),
    estimatedReady: job.scheduledStartDate 
      ? new Date(job.scheduledStartDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
      : "TBD",
  }));

  const displayProducts: DisplayProduct[] = products
    .filter(p => p.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.category,
      tradePrice: parseFloat(product.tradePrice || product.sellPrice) || 0,
    }));

  const filteredProducts = displayProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOrders = displayOrders.filter(o => o.status !== "complete").length;
  const pendingQuotes = displayQuotes.filter(q => q.status === "pending").length;
  const readyForPickup = displayOrders.filter(o => o.status === "ready").length;

  const tradeClient = tradeClients[0];
  const discountLevel = tradeClient?.tradeDiscountLevel;
  const discountPercent = discountLevel === "platinum" ? "25%" 
    : discountLevel === "gold" ? "20%" 
    : discountLevel === "silver" ? "15%" 
    : discountLevel === "bronze" ? "10%" 
    : "N/A";

  const handleAcceptQuote = (quote: DisplayTradeQuote) => {
    toast({
      title: "Quote Accepted",
      description: `Processing ${quote.quoteNumber}`,
    });
  };

  const handlePayDeposit = (quote: DisplayTradeQuote) => {
    toast({
      title: "Payment",
      description: "Redirecting to payment...",
    });
  };

  const handleTrackOrder = (order: DisplayTradeOrder) => {
    toast({
      title: "Order Tracking",
      description: `Viewing ${order.orderNumber} status`,
    });
  };

  const isLoading = quotesLoading || jobsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 border-b bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 bg-primary-foreground/20" />
            <Skeleton className="h-4 w-48 mt-1 bg-primary-foreground/20" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 border-b bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold" data-testid="text-trade-title">Trade Portal</h1>
          <p className="text-sm opacity-80">
            Welcome back{tradeClient ? `, ${tradeClient.companyName || tradeClient.name}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Orders"
            value={activeOrders}
            description="In production"
            icon={Package}
          />
          <StatCard
            title="Pending Quotes"
            value={pendingQuotes}
            description="Awaiting response"
            icon={FileText}
          />
          <StatCard
            title="Trade Discount"
            value={discountPercent}
            description="Your discount level"
            icon={CreditCard}
          />
          <StatCard
            title="Ready for Pickup"
            value={readyForPickup}
            description="Orders ready"
            icon={Truck}
          />
        </div>

        <Tabs defaultValue="quotes">
          <TabsList>
            <TabsTrigger value="quotes" data-testid="tab-quotes">
              <FileText className="h-4 w-4 mr-2" />
              My Quotes
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="h-4 w-4 mr-2" />
              My Orders
            </TabsTrigger>
            <TabsTrigger value="reorder" data-testid="tab-reorder">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Reorder
            </TabsTrigger>
            <TabsTrigger value="guides" data-testid="tab-guides">
              <Download className="h-4 w-4 mr-2" />
              Installation Guides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="mt-6 space-y-4">
            {displayQuotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No quotes available</p>
              </div>
            ) : (
              displayQuotes.map((quote) => (
                <Card key={quote.id} data-testid={`quote-card-${quote.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {quote.quoteNumber}
                          </span>
                          <StatusBadge status={quote.status === "pending" ? "quoted" : quote.status} />
                        </div>
                        <h3 className="font-semibold mb-1">{quote.description}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {quote.createdAt}</span>
                          <span>Expires: {quote.expiresAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${quote.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Inc. Trade Discount</p>
                      </div>
                    </div>
                    {quote.status === "pending" && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleAcceptQuote(quote)}
                          data-testid={`button-accept-quote-${quote.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Quote
                        </Button>
                      </div>
                    )}
                    {quote.status === "approved" && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          className="flex-1"
                          onClick={() => handlePayDeposit(quote)}
                          data-testid={`button-pay-deposit-${quote.id}`}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay 50% Deposit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-4">
            {displayOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              displayOrders.map((order) => (
                <Card key={order.id} data-testid={`order-card-${order.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {order.orderNumber}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <h3 className="font-semibold mb-1">{order.description}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {order.status === "complete" ? "Completed" : `Est. Ready: ${order.estimatedReady}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleTrackOrder(order)}
                        data-testid={`button-track-order-${order.id}`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Track Order
                      </Button>
                      {order.status === "ready" && (
                        <Button className="flex-1" data-testid={`button-arrange-pickup-${order.id}`}>
                          <Truck className="h-4 w-4 mr-2" />
                          Arrange Pickup
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reorder" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Reorder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-reorder"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No products found</p>
                    </div>
                  ) : (
                    filteredProducts.slice(0, 8).map((product) => (
                      <div 
                        key={product.id}
                        className="p-4 border rounded-md hover-elevate cursor-pointer" 
                        data-testid={`product-${product.id}`}
                      >
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <p className="text-lg font-bold mt-2">
                          ${product.tradePrice.toFixed(2)} 
                          <span className="text-sm font-normal text-muted-foreground"> (Trade)</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Installation Guides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Hampton Style Installation Guide", "Colonial Style Installation Guide", "Picket Style Installation Guide", "Gate Installation Guide", "Post Setting Guide"].map((guide, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 p-4 border rounded-md hover-elevate cursor-pointer"
                    data-testid={`guide-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{guide}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <HelpCircle className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-48">
                <h3 className="font-semibold">Need Help?</h3>
                <p className="text-sm text-muted-foreground">Contact your account manager or our support team</p>
              </div>
              <Button variant="outline" data-testid="button-contact-support">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
