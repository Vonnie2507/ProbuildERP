import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Calculator, Save, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client, Lead, Product, FenceStyle, QuoteLineItem } from "@shared/schema";

interface QuoteBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  client?: Client;
  onQuoteCreated?: (quoteId: string) => void;
}

interface LineItemRow {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function QuoteBuilder({
  open,
  onOpenChange,
  lead,
  client,
  onQuoteCreated,
}: QuoteBuilderProps) {
  const { toast } = useToast();
  
  const [lineItems, setLineItems] = useState<LineItemRow[]>([]);
  const [fenceStyleId, setFenceStyleId] = useState<string>("");
  const [fenceLength, setFenceLength] = useState<string>(lead?.fenceLength || "");
  const [fenceHeight, setFenceHeight] = useState<string>("1800");
  const [siteAddress, setSiteAddress] = useState<string>(lead?.siteAddress || "");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isTradeQuote, setIsTradeQuote] = useState<boolean>(client?.clientType === "trade");
  const [tradeDiscount, setTradeDiscount] = useState<string>("0");
  const [labourEstimate, setLabourEstimate] = useState<string>("0");
  const [depositPercent, setDepositPercent] = useState<number>(50);
  const [notes, setNotes] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: fenceStyles = [] } = useQuery<FenceStyle[]>({
    queryKey: ["/api/fence-styles"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  useEffect(() => {
    if (lead) {
      setSiteAddress(lead.siteAddress || "");
      setFenceLength(lead.fenceLength || "");
      if (lead.clientId) {
        setSelectedClientId(lead.clientId);
      }
      if (lead.fenceStyle) {
        const style = fenceStyles.find(s => s.name === lead.fenceStyle);
        if (style) setFenceStyleId(style.id);
      }
    }
    if (client) {
      setSelectedClientId(client.id);
      setIsTradeQuote(client.clientType === "trade");
      if (client.tradeDiscountLevel) {
        const discountMap: Record<string, string> = {
          standard: "10",
          silver: "15",
          gold: "20",
          platinum: "25",
        };
        setTradeDiscount(discountMap[client.tradeDiscountLevel] || "0");
      }
    }
  }, [lead, client, fenceStyles]);

  useEffect(() => {
    if (lineItems.length > 0 && products.length > 0) {
      setLineItems(prevItems => prevItems.map(item => {
        if (!item.productId) return item;
        const product = products.find(p => p.id === item.productId);
        if (!product) return item;
        const price = isTradeQuote && product.tradePrice 
          ? parseFloat(product.tradePrice) 
          : parseFloat(product.sellPrice);
        return {
          ...item,
          unitPrice: price,
          totalPrice: price * item.quantity,
        };
      }));
    }
  }, [isTradeQuote, products]);

  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response as unknown as { id: string };
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Quote Created",
        description: "The quote has been successfully created.",
      });
      onOpenChange(false);
      resetForm();
      if (onQuoteCreated && response?.id) {
        onQuoteCreated(response.id);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setLineItems([]);
    setFenceStyleId("");
    setFenceLength("");
    setFenceHeight("1800");
    setSiteAddress("");
    setSelectedClientId("");
    setIsTradeQuote(false);
    setTradeDiscount("0");
    setLabourEstimate("0");
    setNotes("");
    setInternalNotes("");
  };

  const addLineItem = () => {
    const newItem: LineItemRow = {
      id: generateId(),
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItemRow, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      if (field === "productId") {
        const product = products.find(p => p.id === value);
        if (product) {
          const price = isTradeQuote && product.tradePrice 
            ? parseFloat(product.tradePrice) 
            : parseFloat(product.sellPrice);
          updatedItem.productName = product.name;
          updatedItem.unitPrice = price;
          updatedItem.totalPrice = price * updatedItem.quantity;
        }
      }
      
      if (field === "quantity" || field === "unitPrice") {
        const qty = field === "quantity" ? value : item.quantity;
        const price = field === "unitPrice" ? value : item.unitPrice;
        updatedItem.totalPrice = qty * price;
      }
      
      return updatedItem;
    }));
  };

  const materialsSubtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const labour = parseFloat(labourEstimate) || 0;
  const discountRate = parseFloat(tradeDiscount) || 0;
  const discountAmount = isTradeQuote ? (materialsSubtotal * discountRate / 100) : 0;
  const totalBeforeDiscount = materialsSubtotal + labour;
  const totalAmount = totalBeforeDiscount - discountAmount;
  const depositRequired = totalAmount * (depositPercent / 100);

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category && p.isActive);
  };

  const effectiveClientId = client?.id || selectedClientId || lead?.clientId;

  const handleSubmit = (sendNow: boolean = false) => {
    if (!effectiveClientId) {
      toast({
        title: "Error",
        description: "Please select a client for this quote.",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item.",
        variant: "destructive",
      });
      return;
    }

    const invalidItems = lineItems.filter(item => !item.productId || item.quantity < 1);
    if (invalidItems.length > 0) {
      toast({
        title: "Error",
        description: "Please ensure all line items have a product selected and quantity greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const quoteData = {
      clientId: effectiveClientId,
      leadId: lead?.id,
      fenceStyleId: fenceStyleId || null,
      siteAddress,
      totalLength: fenceLength || null,
      fenceHeight: fenceHeight || null,
      lineItems: lineItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
      })) as QuoteLineItem[],
      materialsSubtotal: materialsSubtotal.toFixed(2),
      labourEstimate: labour.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      depositRequired: depositRequired.toFixed(2),
      depositPercent,
      status: sendNow ? "sent" : "draft",
      isTradeQuote,
      tradeDiscount: isTradeQuote ? tradeDiscount : null,
      notes,
      internalNotes,
    };

    createQuoteMutation.mutate(quoteData);
  };

  const quickAddProducts = (category: string) => {
    const categoryProducts = getProductsByCategory(category);
    if (categoryProducts.length > 0) {
      const newItems = categoryProducts.slice(0, 3).map(product => ({
        id: generateId(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: isTradeQuote && product.tradePrice 
          ? parseFloat(product.tradePrice) 
          : parseFloat(product.sellPrice),
        totalPrice: isTradeQuote && product.tradePrice 
          ? parseFloat(product.tradePrice) 
          : parseFloat(product.sellPrice),
      }));
      setLineItems([...lineItems, ...newItems]);
    }
  };

  const selectedClient = client || (selectedClientId ? clients.find(c => c.id === selectedClientId) : null) || (lead?.clientId ? clients.find(c => c.id === lead.clientId) : null);
  const needsClientSelection = !client && !lead?.clientId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Quote
          </DialogTitle>
          <DialogDescription>
            Build a quote for {selectedClient?.name || "a customer"}
            {lead?.siteAddress && ` at ${lead.siteAddress}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client {needsClientSelection && <span className="text-destructive">*</span>}</Label>
                  {needsClientSelection ? (
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger data-testid="select-quote-client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.clientType === "trade" && "(Trade)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      value={selectedClient?.name || ""} 
                      disabled 
                      className="bg-muted"
                      data-testid="input-quote-client"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Site Address</Label>
                  <Input 
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    placeholder="Installation address"
                    data-testid="input-quote-address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fence Style</Label>
                  <Select value={fenceStyleId} onValueChange={setFenceStyleId}>
                    <SelectTrigger data-testid="select-fence-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {fenceStyles.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Length (m)</Label>
                  <Input 
                    type="number"
                    value={fenceLength}
                    onChange={(e) => setFenceLength(e.target.value)}
                    placeholder="e.g. 25.5"
                    data-testid="input-fence-length"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (mm)</Label>
                  <Select value={fenceHeight} onValueChange={setFenceHeight}>
                    <SelectTrigger data-testid="select-fence-height">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1200">1200mm</SelectItem>
                      <SelectItem value="1500">1500mm</SelectItem>
                      <SelectItem value="1800">1800mm</SelectItem>
                      <SelectItem value="2100">2100mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Line Items</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => quickAddProducts("posts")}
                    data-testid="button-quick-add-posts"
                  >
                    + Posts
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => quickAddProducts("rails")}
                    data-testid="button-quick-add-rails"
                  >
                    + Rails
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => quickAddProducts("pickets")}
                    data-testid="button-quick-add-pickets"
                  >
                    + Pickets
                  </Button>
                  <Button size="sm" onClick={addLineItem} data-testid="button-add-line-item">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items added yet. Click "Add Item" or use quick add buttons.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Product</TableHead>
                      <TableHead className="w-[100px]">Qty</TableHead>
                      <TableHead className="w-[120px]">Unit Price</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select 
                            value={item.productId} 
                            onValueChange={(value) => updateLineItem(item.id, "productId", value)}
                          >
                            <SelectTrigger data-testid={`select-product-${item.id}`}>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {["posts", "rails", "pickets", "caps", "gates", "hardware", "accessories"].map(category => (
                                <div key={category}>
                                  {getProductsByCategory(category).length > 0 && (
                                    <>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground capitalize">
                                        {category}
                                      </div>
                                      {getProductsByCategory(category).map(product => (
                                        <SelectItem key={product.id} value={product.id}>
                                          {product.name} - ${parseFloat(product.sellPrice).toFixed(2)}
                                        </SelectItem>
                                      ))}
                                    </>
                                  )}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                            className="w-20"
                            data-testid={`input-qty-${item.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">$</span>
                            <Input 
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-24"
                              data-testid={`input-price-${item.id}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${item.totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => removeLineItem(item.id)}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pricing & Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={isTradeQuote}
                    onCheckedChange={setIsTradeQuote}
                    data-testid="switch-trade-quote"
                  />
                  <Label>Trade Quote</Label>
                </div>
                {isTradeQuote && (
                  <div className="flex items-center gap-2">
                    <Label>Discount %</Label>
                    <Input 
                      type="number"
                      value={tradeDiscount}
                      onChange={(e) => setTradeDiscount(e.target.value)}
                      className="w-20"
                      data-testid="input-trade-discount"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Labour Estimate</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-1">$</span>
                    <Input 
                      type="number"
                      value={labourEstimate}
                      onChange={(e) => setLabourEstimate(e.target.value)}
                      placeholder="0.00"
                      data-testid="input-labour"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deposit %</Label>
                  <Select 
                    value={depositPercent.toString()} 
                    onValueChange={(v) => setDepositPercent(parseInt(v))}
                  >
                    <SelectTrigger data-testid="select-deposit-percent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="100">100% (Full)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials Subtotal</span>
                  <span>${materialsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Labour</span>
                  <span>${labour.toFixed(2)}</span>
                </div>
                {isTradeQuote && discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Trade Discount ({tradeDiscount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Deposit Required ({depositPercent}%)</span>
                  <span>${depositRequired.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Notes (Visible on quote)</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for the customer..."
                  data-testid="textarea-customer-notes"
                />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes (Staff only)</Label>
                <Textarea 
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  data-testid="textarea-internal-notes"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-quote"
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={createQuoteMutation.isPending}
              data-testid="button-save-draft"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit(true)}
              disabled={createQuoteMutation.isPending}
              data-testid="button-send-quote"
            >
              <Send className="h-4 w-4 mr-2" />
              {createQuoteMutation.isPending ? "Creating..." : "Create & Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
