import { useState } from "react";
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
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LeadStatus = "new" | "contacted" | "quoted" | "approved" | "declined";

interface Lead {
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

  // todo: remove mock functionality
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "lead-001",
      clientName: "Sarah Mitchell",
      phone: "0412 345 678",
      email: "sarah.mitchell@email.com",
      address: "42 Ocean Drive, Scarborough WA 6019",
      source: "Website",
      fenceStyle: "Hampton Style - 1.8m height",
      leadType: "public",
      status: "new",
      assignedTo: { name: "Dave", initials: "DV" },
      createdAt: "2h ago",
    },
    {
      id: "lead-002",
      clientName: "Pacific Builders",
      phone: "08 9123 4567",
      email: "orders@pacificbuilders.com.au",
      address: "15 Industrial Way, Malaga WA 6090",
      source: "Referral",
      fenceStyle: "Colonial - 40m commercial",
      leadType: "trade",
      status: "contacted",
      assignedTo: { name: "Dave", initials: "DV" },
      createdAt: "1d ago",
    },
    {
      id: "lead-003",
      clientName: "Johnson Family",
      phone: "0423 456 789",
      email: "j.johnson@email.com",
      address: "8 Sunset Blvd, Cottesloe WA 6011",
      source: "Google",
      fenceStyle: "Picket Style - 15m",
      leadType: "public",
      status: "quoted",
      assignedTo: { name: "Dave", initials: "DV" },
      createdAt: "3d ago",
    },
    {
      id: "lead-004",
      clientName: "Harbor Homes",
      phone: "08 9234 5678",
      email: "info@harborhomes.com.au",
      address: "22 Marina Bay, Fremantle WA 6160",
      source: "Trade Show",
      fenceStyle: "Hampton Style - 60m development",
      leadType: "trade",
      status: "quoted",
      assignedTo: { name: "Dave", initials: "DV" },
      createdAt: "5d ago",
    },
    {
      id: "lead-005",
      clientName: "Williams Estate",
      phone: "0434 567 890",
      email: "williams.estate@email.com",
      address: "100 Grand Ave, Peppermint Grove WA 6011",
      source: "Referral",
      fenceStyle: "Nautilus - 80m premium",
      leadType: "public",
      status: "approved",
      assignedTo: { name: "Dave", initials: "DV" },
      createdAt: "1w ago",
    },
  ]);

  const handleLeadClick = (lead: Lead) => {
    toast({
      title: "Lead Selected",
      description: `Opening ${lead.clientName}'s details`,
    });
  };

  const handleConvertToQuote = (lead: Lead) => {
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
    toast({
      title: "Lead Created",
      description: "New lead has been added successfully",
    });
    setIsDialogOpen(false);
  };

  const filteredLeads = leads.filter(
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
                <Input id="clientName" placeholder="Enter client name" data-testid="input-client-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="0400 000 000" data-testid="input-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" data-testid="input-email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Site Address</Label>
                <Input id="address" placeholder="Enter site address" data-testid="input-address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadType">Lead Type</Label>
                  <Select defaultValue="public">
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
                  <Select defaultValue="website">
                    <SelectTrigger data-testid="select-source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="trade_show">Trade Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the fencing requirements..."
                  data-testid="textarea-description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-lead">Create Lead</Button>
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

      <KanbanBoard
        leads={filteredLeads}
        onLeadClick={handleLeadClick}
        onAddLead={handleAddLead}
        onConvertToQuote={handleConvertToQuote}
      />
    </div>
  );
}
