import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Zap,
  MessageSquare,
  Trash2,
  Edit,
  Users,
  Clock,
  FileText,
} from "lucide-react";
import type { AutomationCampaign } from "@shared/schema";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  trigger: z.enum([
    "quote_sent",
    "quote_no_response_3_days",
    "quote_no_response_7_days",
    "quote_expiring_soon",
    "quote_expired",
    "lead_new",
    "lead_no_contact_24h",
    "job_completed",
    "payment_due"
  ]),
  clientType: z.enum(["public", "trade"]).nullable(),
  delayDays: z.coerce.number().min(0).max(365),
  delayHours: z.coerce.number().min(0).max(23),
  sendWindow: z.string().optional(),
  messageTemplate: z.string().min(1, "Message template is required"),
  isActive: z.boolean().default(true),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const triggerLabels: Record<string, string> = {
  quote_sent: "Quote Sent",
  quote_no_response_3_days: "No Response (3 Days)",
  quote_no_response_7_days: "No Response (7 Days)",
  quote_expiring_soon: "Quote Expiring Soon",
  quote_expired: "Quote Expired",
  lead_new: "New Lead",
  lead_no_contact_24h: "Lead No Contact (24h)",
  job_completed: "Job Completed",
  payment_due: "Payment Due",
};

function CampaignCard({ 
  campaign, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  campaign: AutomationCampaign;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <Card className={!campaign.isActive ? 'opacity-60' : ''}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
              {campaign.isActive ? 'Active' : 'Paused'}
            </Badge>
          </div>
          {campaign.description && (
            <CardDescription>{campaign.description}</CardDescription>
          )}
        </div>
        <Switch 
          checked={campaign.isActive} 
          onCheckedChange={onToggle}
          data-testid={`switch-campaign-toggle-${campaign.id}`}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Trigger</p>
              <p className="font-medium">{triggerLabels[campaign.trigger] || campaign.trigger}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Delay</p>
              <p className="font-medium">
                {campaign.delayDays > 0 ? `${campaign.delayDays}d ` : ''}
                {campaign.delayHours > 0 ? `${campaign.delayHours}h` : ''}
                {campaign.delayDays === 0 && campaign.delayHours === 0 ? 'Immediate' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Action</p>
              <p className="font-medium">Send SMS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Client Type</p>
              <p className="font-medium capitalize">{campaign.clientType || 'All'}</p>
            </div>
          </div>
        </div>
        {campaign.messageTemplate && (
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="text-muted-foreground mb-1">Message Template:</p>
            <p className="italic">"{campaign.messageTemplate}"</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEdit}
          data-testid={`button-edit-campaign-${campaign.id}`}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
          data-testid={`button-delete-campaign-${campaign.id}`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

function CreateCampaignDialog({ 
  open, 
  onOpenChange,
  editCampaign,
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCampaign: AutomationCampaign | null;
}) {
  const { toast } = useToast();
  const isEditing = !!editCampaign;

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: editCampaign ? {
      name: editCampaign.name,
      description: editCampaign.description || "",
      trigger: editCampaign.trigger,
      clientType: editCampaign.clientType,
      delayDays: editCampaign.delayDays,
      delayHours: editCampaign.delayHours,
      sendWindow: editCampaign.sendWindow || "",
      messageTemplate: editCampaign.messageTemplate,
      isActive: editCampaign.isActive,
    } : {
      name: "",
      description: "",
      trigger: "quote_sent",
      clientType: null,
      delayDays: 3,
      delayHours: 0,
      sendWindow: "09:00-17:00",
      messageTemplate: "Hi {client_name}, just following up on your quote {quote_number}. Let us know if you have any questions!",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      if (isEditing) {
        return apiRequest('PATCH', `/api/automation-campaigns/${editCampaign.id}`, data);
      }
      return apiRequest('POST', '/api/automation-campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-campaigns'] });
      toast({
        title: isEditing ? "Campaign Updated" : "Campaign Created",
        description: isEditing 
          ? "The automation campaign has been updated." 
          : "The automation campaign has been created.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} campaign`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CampaignFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Automation Campaign' : 'Create Automation Campaign'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Quote Follow-up (3 days)" 
                      {...field} 
                      data-testid="input-campaign-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this campaign does..."
                      className="resize-none"
                      {...field} 
                      data-testid="input-campaign-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger Event</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-trigger">
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="quote_sent">Quote Sent</SelectItem>
                      <SelectItem value="quote_no_response_3_days">No Response (3 Days)</SelectItem>
                      <SelectItem value="quote_no_response_7_days">No Response (7 Days)</SelectItem>
                      <SelectItem value="quote_expiring_soon">Quote Expiring Soon</SelectItem>
                      <SelectItem value="quote_expired">Quote Expired</SelectItem>
                      <SelectItem value="lead_new">New Lead</SelectItem>
                      <SelectItem value="lead_no_contact_24h">Lead No Contact (24h)</SelectItem>
                      <SelectItem value="job_completed">Job Completed</SelectItem>
                      <SelectItem value="payment_due">Payment Due</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="delayDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={365} 
                        {...field} 
                        data-testid="input-delay-days"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delayHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay (Hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={23} 
                        {...field} 
                        data-testid="input-delay-hours"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Type</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "all" ? null : val)} 
                    defaultValue={field.value || "all"}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-client-type">
                        <SelectValue placeholder="Select client type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      <SelectItem value="public">Public Only</SelectItem>
                      <SelectItem value="trade">Trade Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sendWindow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send Window (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 09:00-17:00"
                      {...field} 
                      data-testid="input-send-window"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Only send messages during these hours
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Template</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Hi {client_name}, just following up on your quote {quote_number}..."
                      className="resize-none min-h-[100px]"
                      {...field} 
                      data-testid="input-message-template"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Use {'{client_name}'}, {'{quote_number}'}, {'{quote_amount}'} as placeholders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription className="text-xs">
                      Enable this campaign to start processing
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-is-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-save-campaign"
              >
                {createMutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Create Campaign")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AutomationCampaigns() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<AutomationCampaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useQuery<AutomationCampaign[]>({
    queryKey: ['/api/automation-campaigns'],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/automation-campaigns/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-campaigns'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/automation-campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation-campaigns'] });
      toast({
        title: "Campaign Deleted",
        description: "The automation campaign has been deleted.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (campaign: AutomationCampaign) => {
    setEditCampaign(campaign);
    setCreateOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      setEditCampaign(null);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Automation Campaigns
          </h1>
          <p className="text-muted-foreground">
            Set up automated SMS follow-ups for quotes based on client type and timing
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-create-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => handleEdit(campaign)}
              onDelete={() => setDeleteId(campaign.id)}
              onToggle={() => toggleMutation.mutate({ 
                id: campaign.id, 
                isActive: !campaign.isActive 
              })}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Automation Campaigns</h3>
            <p className="text-muted-foreground mb-4">
              Create your first automation campaign to start following up on quotes automatically.
            </p>
            <Button onClick={() => setCreateOpen(true)} data-testid="button-create-first-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </div>
        </Card>
      )}

      <CreateCampaignDialog
        open={createOpen}
        onOpenChange={handleCloseDialog}
        editCampaign={editCampaign}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this automation campaign? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
