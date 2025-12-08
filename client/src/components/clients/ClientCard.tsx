import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Phone, Mail, MapPin, FileText, Briefcase, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  onCreateQuote?: () => void;
  onAddNote?: () => void;
  onViewHistory?: () => void;
}

export function ClientCard({
  client,
  onClick,
  onCreateQuote,
  onAddNote,
  onViewHistory,
}: ClientCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`client-card-${client.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-sm">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{client.name}</h3>
                <StatusBadge status={client.clientType} />
              </div>
              {client.clientType === "trade" && client.tradeDiscountLevel && (
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {client.tradeDiscountLevel}% Trade Discount
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-client-actions-${client.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateQuote?.(); }}>
                Create Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddNote?.(); }}>
                Add Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewHistory?.(); }}>
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{client.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{client.totalQuotes} quotes</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              <span>{client.totalJobs} jobs</span>
            </div>
          </div>
          <span className="text-sm font-semibold">
            ${client.totalSpent.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
