import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, X, User, Phone, Mail, Building2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Client } from "@shared/schema";
import { useDebounce } from "@/hooks/use-debounce";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: Client) => void;
  onSelectExistingClient?: (client: Client) => void;
}

export function CreateClientDialog({
  open,
  onOpenChange,
  onClientCreated,
  onSelectExistingClient,
}: CreateClientDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    clientType: "public" as "public" | "trade",
    companyName: "",
    abn: "",
  });
  const [duplicates, setDuplicates] = useState<Client[]>([]);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const debouncedName = useDebounce(formData.name, 500);
  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedPhone = useDebounce(formData.phone, 500);

  const checkDuplicatesMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string; phone?: string }) => {
      const response = await apiRequest("POST", "/api/clients/check-duplicate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setDuplicates(data.duplicates || []);
      setIsCheckingDuplicates(false);
    },
    onError: () => {
      setIsCheckingDuplicates(false);
    },
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        clientType: "public",
        companyName: "",
        abn: "",
      });
      setDuplicates([]);
      setViewingClient(null);
    }
  }, [open]);

  useEffect(() => {
    const hasSearchableValue = 
      (debouncedName && debouncedName.length >= 2) ||
      (debouncedEmail && debouncedEmail.length >= 3) ||
      (debouncedPhone && debouncedPhone.replace(/\D/g, '').length >= 6);

    if (hasSearchableValue) {
      setIsCheckingDuplicates(true);
      checkDuplicatesMutation.mutate({
        name: debouncedName || undefined,
        email: debouncedEmail || undefined,
        phone: debouncedPhone || undefined,
      });
    } else {
      setDuplicates([]);
    }
  }, [debouncedName, debouncedEmail, debouncedPhone]);

  const createClientMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Client Created",
        description: `${client.name} has been added successfully`,
      });
      onClientCreated(client);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive",
      });
      return;
    }
    createClientMutation.mutate(formData);
  };

  const handleUseExistingClient = (client: Client) => {
    if (onSelectExistingClient) {
      onSelectExistingClient(client);
      onOpenChange(false);
    }
    setViewingClient(null);
  };

  const hasDuplicates = duplicates.length > 0;

  if (viewingClient) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Existing Client Found</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingClient(null)}
                data-testid="button-close-client-view"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Is this the client you're looking for?
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{viewingClient.name}</CardTitle>
                <Badge variant="secondary">
                  {viewingClient.clientType === "trade" ? "Trade" : "Public"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{viewingClient.phone}</span>
              </div>
              {viewingClient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{viewingClient.email}</span>
                </div>
              )}
              {viewingClient.companyName && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{viewingClient.companyName}</span>
                </div>
              )}
              {viewingClient.address && (
                <div className="text-sm text-muted-foreground">
                  {viewingClient.address}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setViewingClient(null)}
              data-testid="button-not-this-client"
            >
              Not This Client
            </Button>
            <Button
              onClick={() => handleUseExistingClient(viewingClient)}
              data-testid="button-use-this-client"
            >
              <Check className="h-4 w-4 mr-2" />
              Use This Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Add a new client to the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Name *</Label>
            <Input
              id="client-name"
              placeholder="Enter client name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-client-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Phone *</Label>
            <Input
              id="client-phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              data-testid="input-client-phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              data-testid="input-client-email"
            />
          </div>

          {hasDuplicates && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                <span>Similar client(s) found</span>
              </div>
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {duplicates.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-2 bg-background rounded border cursor-pointer hover-elevate"
                      onClick={() => setViewingClient(client)}
                      data-testid={`duplicate-client-${client.id}`}
                    >
                      <div className="text-sm">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {client.phone} {client.email && `• ${client.email}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingClient(client);
                        }}
                        data-testid={`button-view-client-${client.id}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="client-address">Address</Label>
            <Input
              id="client-address"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              data-testid="input-client-address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-type">Client Type</Label>
            <Select
              value={formData.clientType}
              onValueChange={(value) => setFormData({ ...formData, clientType: value as "public" | "trade" })}
            >
              <SelectTrigger data-testid="select-client-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="trade">Trade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.clientType === "trade" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="client-company">Company Name</Label>
                <Input
                  id="client-company"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  data-testid="input-client-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-abn">ABN</Label>
                <Input
                  id="client-abn"
                  placeholder="Enter ABN"
                  value={formData.abn}
                  onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                  data-testid="input-client-abn"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createClientMutation.isPending}
              data-testid="button-create-client"
            >
              {createClientMutation.isPending ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
