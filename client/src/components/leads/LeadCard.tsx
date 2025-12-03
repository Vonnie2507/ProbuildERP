import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Lead {
  id: string;
  leadNumber: string;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  fenceStyle: string;
  leadType: "public" | "trade";
  status: "new" | "contacted" | "quoted" | "approved" | "declined";
  assignedTo: {
    name: string;
    initials: string;
  };
  createdAt: string;
}

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  onCreateQuote?: () => void;
  onAddNote?: () => void;
  onFollowUp?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LeadCard({
  lead,
  onClick,
  onCreateQuote,
  onAddNote,
  onFollowUp,
  onEdit,
  onDelete,
}: LeadCardProps) {
  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`lead-card-${lead.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.leadType} />
            <StatusBadge status={lead.status} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-lead-actions-${lead.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }} data-testid={`button-edit-lead-${lead.id}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateQuote?.(); }} data-testid={`button-create-quote-${lead.id}`}>
                Create Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddNote?.(); }}>
                Add Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFollowUp?.(); }}>
                Log Follow-up
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }} 
                className="text-destructive focus:text-destructive"
                data-testid={`button-delete-lead-${lead.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">{lead.clientName}</h3>
          <span className="text-xs font-mono text-muted-foreground">{lead.leadNumber}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{lead.fenceStyle}</p>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{lead.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span className="truncate">{lead.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{lead.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-muted">
                {lead.assignedTo.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{lead.assignedTo.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{lead.createdAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
