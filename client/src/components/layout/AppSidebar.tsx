import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Briefcase,
  Factory,
  Calendar,
  Package,
  CreditCard,
  MessageSquare,
  Wrench,
  Building2,
  Settings,
  LogOut,
  BarChart3,
  Zap,
  Building,
  GitBranch,
  Shield,
  FolderOpen,
  BookOpen,
  FileStack,
  User,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mainNavItems = [
  { title: "My Dashboard", url: "/", icon: User },
  { title: "Business Dashboard", url: "/business-dashboard", icon: TrendingUp },
  { title: "Leads", url: "/leads", icon: FileText },
  { title: "Quotes", url: "/quotes", icon: ClipboardList },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Clients", url: "/clients", icon: Users },
];

const operationsItems = [
  { title: "Production", url: "/production", icon: Factory },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Inventory", url: "/inventory", icon: Package },
];

const financeItems = [
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const analyticsItems = [
  { title: "Quote Analytics", url: "/quote-analytics", icon: BarChart3 },
  { title: "Automation", url: "/automation", icon: Zap },
];

const installerItems = [
  { title: "Installer App", url: "/installer", icon: Wrench },
];

const tradeItems = [
  { title: "Trade Portal", url: "/trade", icon: Building2 },
];

const liveDocsItems = [
  { title: "Templates", url: "/live-doc-templates", icon: FileStack },
];

const organisationItems = [
  { title: "Departments", url: "/organisation/departments", icon: Building },
  { title: "Workflows & SOPs", url: "/organisation/workflows", icon: GitBranch },
  { title: "Policies", url: "/organisation/policies", icon: Shield },
  { title: "Resources", url: "/organisation/resources", icon: FolderOpen },
  { title: "Knowledge Base", url: "/organisation/knowledge", icon: BookOpen },
];

function formatRoleDisplay(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    sales: "Sales",
    scheduler: "Scheduler",
    production_manager: "Production Manager",
    warehouse: "Warehouse",
    installer: "Installer",
    trade_client: "Trade Client",
  };
  return roleMap[role] || role;
}

function UserSection() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const initials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';
  
  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };
  
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-sidebar-foreground" data-testid="text-user-name">
          {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
        </span>
        <span className="text-xs text-sidebar-foreground/70">
          {user?.positionTitle || formatRoleDisplay(user?.role || 'user')}
        </span>
      </div>
      <SidebarMenuButton 
        size="sm" 
        className="h-8 w-8" 
        onClick={handleLogout}
        data-testid="button-logout"
      >
        <LogOut className="h-4 w-4" />
      </SidebarMenuButton>
    </div>
  );
}

export function AppSidebar() {
  const [location] = useLocation();

  // Poll for unread message count every 30 seconds
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/sms/unread-count'],
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.count || 0;

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold text-lg">
            PB
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">Probuild PVC</span>
            <span className="text-xs text-sidebar-foreground/70">ERP & CRM</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.title === "Messages" && unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 min-w-5 px-1.5 text-xs"
                          data-testid="badge-unread-messages"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Live Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {liveDocsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Field</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {installerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>External</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organisation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organisationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <UserSection />
      </SidebarFooter>
    </Sidebar>
  );
}
