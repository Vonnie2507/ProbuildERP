import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b px-4 bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        {title && (
          <h1 className="text-lg font-semibold" data-testid="text-page-title">{title}</h1>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs, clients, quotes..."
            className="pl-9 w-full"
            data-testid="input-global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">New lead assigned</span>
              <span className="text-xs text-muted-foreground">Smith Residence - Hampton Style fence</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Quote follow-up due</span>
              <span className="text-xs text-muted-foreground">Johnson Property - Quote sent 48hrs ago</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Job ready for install</span>
              <span className="text-xs text-muted-foreground">JOB-2024-089 - Production complete</span>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
}
