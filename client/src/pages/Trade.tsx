import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
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

interface TradeQuote {
  id: string;
  quoteNumber: string;
  description: string;
  totalAmount: number;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  expiresAt: string;
}

interface TradeOrder {
  id: string;
  orderNumber: string;
  description: string;
  totalAmount: number;
  status: "in_progress" | "production" | "ready" | "complete";
  estimatedReady: string;
}

export default function Trade() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // todo: remove mock functionality
  const quotes: TradeQuote[] = [
    {
      id: "1",
      quoteNumber: "QTE-2024-0156",
      description: "Hampton Style Fence - 40m for Scarborough Development",
      totalAmount: 12500,
      status: "pending",
      createdAt: "2 Dec 2024",
      expiresAt: "16 Dec 2024",
    },
    {
      id: "2",
      quoteNumber: "QTE-2024-0149",
      description: "Colonial Fence - 25m Trade Order",
      totalAmount: 7800,
      status: "approved",
      createdAt: "28 Nov 2024",
      expiresAt: "12 Dec 2024",
    },
  ];

  // todo: remove mock functionality
  const orders: TradeOrder[] = [
    {
      id: "1",
      orderNumber: "ORD-2024-0089",
      description: "Picket Style - 60m Development Project",
      totalAmount: 18500,
      status: "production",
      estimatedReady: "10 Dec 2024",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-0085",
      description: "Hampton Style - 30m",
      totalAmount: 9200,
      status: "ready",
      estimatedReady: "5 Dec 2024",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-0078",
      description: "Colonial Fence - Trade Reorder",
      totalAmount: 5400,
      status: "complete",
      estimatedReady: "Completed",
    },
  ];

  const handleAcceptQuote = (quote: TradeQuote) => {
    toast({
      title: "Quote Accepted",
      description: `Processing ${quote.quoteNumber}`,
    });
  };

  const handlePayDeposit = (quote: TradeQuote) => {
    toast({
      title: "Payment",
      description: "Redirecting to payment...",
    });
  };

  const handleTrackOrder = (order: TradeOrder) => {
    toast({
      title: "Order Tracking",
      description: `Viewing ${order.orderNumber} status`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 border-b bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold" data-testid="text-trade-title">Trade Portal</h1>
          <p className="text-sm opacity-80">Welcome back, Pacific Builders Pty Ltd</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Orders"
            value={2}
            description="In production"
            icon={Package}
          />
          <StatCard
            title="Pending Quotes"
            value={1}
            description="Awaiting response"
            icon={FileText}
          />
          <StatCard
            title="Trade Discount"
            value="15%"
            description="Your discount level"
            icon={CreditCard}
          />
          <StatCard
            title="Ready for Pickup"
            value={1}
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
            {quotes.map((quote) => (
              <Card key={quote.id} data-testid={`quote-card-${quote.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
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
            ))}
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-4">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`order-card-${order.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
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
            ))}
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
                  <div className="p-4 border rounded-md hover-elevate cursor-pointer" data-testid="product-hampton">
                    <h4 className="font-semibold">Hampton Style Fence</h4>
                    <p className="text-sm text-muted-foreground">Complete fence kit per meter</p>
                    <p className="text-lg font-bold mt-2">$312.50/m <span className="text-sm font-normal text-muted-foreground">(Trade)</span></p>
                  </div>
                  <div className="p-4 border rounded-md hover-elevate cursor-pointer" data-testid="product-colonial">
                    <h4 className="font-semibold">Colonial Style Fence</h4>
                    <p className="text-sm text-muted-foreground">Complete fence kit per meter</p>
                    <p className="text-lg font-bold mt-2">$285.00/m <span className="text-sm font-normal text-muted-foreground">(Trade)</span></p>
                  </div>
                  <div className="p-4 border rounded-md hover-elevate cursor-pointer" data-testid="product-picket">
                    <h4 className="font-semibold">Picket Style Fence</h4>
                    <p className="text-sm text-muted-foreground">Complete fence kit per meter</p>
                    <p className="text-lg font-bold mt-2">$255.00/m <span className="text-sm font-normal text-muted-foreground">(Trade)</span></p>
                  </div>
                  <div className="p-4 border rounded-md hover-elevate cursor-pointer" data-testid="product-nautilus">
                    <h4 className="font-semibold">Nautilus Style Fence</h4>
                    <p className="text-sm text-muted-foreground">Premium fence kit per meter</p>
                    <p className="text-lg font-bold mt-2">$365.50/m <span className="text-sm font-normal text-muted-foreground">(Trade)</span></p>
                  </div>
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
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate cursor-pointer"
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
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <HelpCircle className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
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
