import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientCard } from "@/components/clients/ClientCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  FileText,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  clientType: "public" | "trade";
  tradeDiscountLevel?: number;
  totalQuotes: number;
  totalJobs: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export default function Clients() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filterType, setFilterType] = useState<"all" | "public" | "trade">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // todo: remove mock functionality
  const clients: Client[] = [
    {
      id: "client-001",
      name: "Pacific Builders Pty Ltd",
      phone: "08 9123 4567",
      email: "orders@pacificbuilders.com.au",
      address: "15 Industrial Way, Malaga WA 6090",
      clientType: "trade",
      tradeDiscountLevel: 15,
      totalQuotes: 24,
      totalJobs: 18,
      totalSpent: 156000,
      notes: "Preferred trade partner. Regular orders every 2 weeks.",
      createdAt: "Jan 2023",
    },
    {
      id: "client-002",
      name: "Harbor Homes Group",
      phone: "08 9234 5678",
      email: "info@harborhomes.com.au",
      address: "22 Marina Bay, Fremantle WA 6160",
      clientType: "trade",
      tradeDiscountLevel: 10,
      totalQuotes: 12,
      totalJobs: 8,
      totalSpent: 94500,
      notes: "Development company. Large bulk orders.",
      createdAt: "Mar 2023",
    },
    {
      id: "client-003",
      name: "Williams Family",
      phone: "0412 345 678",
      email: "williams@email.com",
      address: "42 Ocean Drive, Scarborough WA 6019",
      clientType: "public",
      totalQuotes: 2,
      totalJobs: 1,
      totalSpent: 8500,
      createdAt: "Nov 2024",
    },
    {
      id: "client-004",
      name: "Johnson Property Trust",
      phone: "0423 456 789",
      email: "j.johnson@email.com",
      address: "8 Sunset Blvd, Cottesloe WA 6011",
      clientType: "public",
      totalQuotes: 1,
      totalJobs: 0,
      totalSpent: 0,
      createdAt: "Nov 2024",
    },
    {
      id: "client-005",
      name: "Coastal Living Developments",
      phone: "08 9345 6789",
      email: "projects@coastalliving.com.au",
      address: "100 Beach Road, City Beach WA 6015",
      clientType: "trade",
      tradeDiscountLevel: 12,
      totalQuotes: 8,
      totalJobs: 5,
      totalSpent: 67800,
      createdAt: "Jun 2023",
    },
  ];

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" || client.clientType === filterType;
    return matchesSearch && matchesType;
  });

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleSubmitClient = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Client Created",
      description: "New client has been added successfully",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold" data-testid="text-clients-title">Clients</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-new-client">
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitClient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Client Name</Label>
                    <Input id="name" placeholder="Enter name" data-testid="input-client-name" />
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
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter address" data-testid="input-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientType">Client Type</Label>
                      <Select defaultValue="public">
                        <SelectTrigger data-testid="select-client-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="trade">Trade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Trade Discount %</Label>
                      <Input id="discount" type="number" placeholder="0" data-testid="input-discount" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Add notes..." data-testid="textarea-notes" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-submit-client">Add Client</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-clients"
            />
          </div>
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1" data-testid="tab-all-clients">All</TabsTrigger>
              <TabsTrigger value="public" className="flex-1" data-testid="tab-public-clients">Public</TabsTrigger>
              <TabsTrigger value="trade" className="flex-1" data-testid="tab-trade-clients">Trade</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className={`cursor-pointer ${selectedClient?.id === client.id ? "ring-2 ring-accent rounded-md" : ""}`}
                onClick={() => handleClientClick(client)}
              >
                <ClientCard
                  client={client}
                  onCreateQuote={() => toast({ title: "Creating quote" })}
                  onAddNote={() => toast({ title: "Adding note" })}
                  onViewHistory={() => toast({ title: "Viewing history" })}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedClient ? (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={selectedClient.clientType} />
                  {selectedClient.tradeDiscountLevel && (
                    <Badge variant="secondary">
                      {selectedClient.tradeDiscountLevel}% Trade Discount
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-semibold">{selectedClient.name}</h2>
                <p className="text-muted-foreground">Client since {selectedClient.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-add-note">Add Note</Button>
                <Button data-testid="button-create-quote">Create Quote</Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedClient.address}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Total Quotes</span>
                    </div>
                    <span className="font-semibold">{selectedClient.totalQuotes}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>Total Jobs</span>
                    </div>
                    <span className="font-semibold">{selectedClient.totalJobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Total Spent</span>
                    </div>
                    <span className="font-semibold">${selectedClient.totalSpent.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.notes ? (
                    <p className="text-sm text-muted-foreground">{selectedClient.notes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No notes added</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="quotes">
              <TabsList>
                <TabsTrigger value="quotes" data-testid="tab-quotes">Quotes</TabsTrigger>
                <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
                <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="quotes" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Quote history will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Job history will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Documents will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a client to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
