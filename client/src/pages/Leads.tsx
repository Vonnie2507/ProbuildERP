import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Lead, Client, InsertLead } from "@shared/schema";

type LeadStatus = "new" | "contacted" | "quoted" | "approved" | "declined";

interface KanbanLead {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  fenceStyle: string;
  leadType: "public" | "trade";
  status: LeadStatus;
  assignedTo: {
    name: string;
    initials: string;
  };
  createdAt: string;
}

export default function Leads() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    address: "",
    leadType: "public" as "public" | "trade",
    source: "website" as "website" | "google" | "referral" | "phone" | "walk_in",
    description: "",
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      return apiRequest("/api/leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Lead Created",
        description: "New lead has been added successfully",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
      return apiRequest(`/api/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });

  const resetForm = () => {
    setFormData({
      clientName: "",
      phone: "",
      email: "",
      address: "",
      leadType: "public",
      source: "website",
      description: "",
    });
  };

  const getClientName = (clientId: string | null): string => {
    if (!clientId) return "Unknown";
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Unknown";
  };

  const getClientPhone = (clientId: string | null): string => {
    if (!clientId) return "";
    const client = clients.find(c => c.id === clientId);
    return client?.phone || "";
  };

  const getClientEmail = (clientId: string | null): string => {
    if (!clientId) return "";
    const client = clients.find(c => c.id === clientId);
    return client?.email || "";
  };

  const kanbanLeads: KanbanLead[] = leads.map((lead) => ({
    id: lead.id,
    clientName: getClientName(lead.clientId),
    phone: getClientPhone(lead.clientId),
    email: getClientEmail(lead.clientId),
    address: lead.siteAddress || "",
    source: lead.source || "website",
    fenceStyle: `${lead.fenceStyle || "Unknown"} - ${lead.fenceLength || "?"}m`,
    leadType: lead.leadType as "public" | "trade",
    status: mapStageToStatus(lead.stage),
    assignedTo: { name: "Dave", initials: "DV" },
    createdAt: formatTimeAgo(lead.createdAt),
  }));

  const handleLeadClick = (lead: KanbanLead) => {
    toast({
      title: "Lead Selected",
      description: `Opening ${lead.clientName}'s details`,
    });
  };

  const handleConvertToQuote = (lead: KanbanLead) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { stage: "quote_sent" },
    });
    toast({
      title: "Converting to Quote",
      description: `Creating quote for ${lead.clientName}`,
    });
  };

  const handleAddLead = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    
    createLeadMutation.mutate({
      source: formData.source,
      leadType: formData.leadType,
      description: formData.description,
      siteAddress: formData.address,
      stage: "new",
    });
  };

  const filteredLeads = kanbanLeads.filter(
    (lead) =>
      lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.fenceStyle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-leads-title">Leads & Quotes</h1>
          <p className="text-sm text-muted-foreground">
            Manage enquiries, build quotes, and track conversions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-lead">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName" 
                  placeholder="Enter client name" 
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  data-testid="input-client-name" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="0400 000 000" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-phone" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-email" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Site Address</Label>
                <Input 
                  id="address" 
                  placeholder="Enter site address" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="input-address" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadType">Lead Type</Label>
                  <Select 
                    value={formData.leadType}
                    onValueChange={(value: "public" | "trade") => setFormData({ ...formData, leadType: value })}
                  >
                    <SelectTrigger data-testid="select-lead-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="trade">Trade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select 
                    value={formData.source}
                    onValueChange={(value: any) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger data-testid="select-source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="walk_in">Walk In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the fencing requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="textarea-description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createLeadMutation.isPending}
                  data-testid="button-submit-lead"
                >
                  {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-leads"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "kanban" ? "bg-muted" : ""}
            onClick={() => setViewMode("kanban")}
            data-testid="button-view-kanban"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "list" ? "bg-muted" : ""}
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {leadsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <KanbanBoard
          leads={filteredLeads}
          onLeadClick={handleLeadClick}
          onAddLead={handleAddLead}
          onConvertToQuote={handleConvertToQuote}
        />
      )}
    </div>
  );
}

function mapStageToStatus(stage: string): LeadStatus {
  switch (stage) {
    case "new":
      return "new";
    case "contacted":
    case "site_visit_scheduled":
    case "site_visit_complete":
      return "contacted";
    case "quote_sent":
    case "quote_revised":
      return "quoted";
    case "approved":
    case "converted_to_job":
      return "approved";
    case "declined":
    case "lost":
      return "declined";
    default:
      return "new";
  }
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
