export type UserRole = 
  | "admin" 
  | "sales" 
  | "scheduler" 
  | "production_manager" 
  | "warehouse" 
  | "installer" 
  | "trade_client";

export const allInternalRoles: UserRole[] = ["admin", "sales", "scheduler", "production_manager", "warehouse", "installer"];
export const officeRoles: UserRole[] = ["admin", "sales", "scheduler", "production_manager"];

export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
}

export const routePermissions: RouteConfig[] = [
  { path: "/", allowedRoles: allInternalRoles },
  { path: "/business-dashboard", allowedRoles: ["admin"] },
  { path: "/leads", allowedRoles: ["admin", "sales"] },
  { path: "/quotes", allowedRoles: ["admin", "sales"] },
  { path: "/jobs", allowedRoles: ["admin", "sales", "scheduler", "production_manager", "warehouse", "installer"] },
  { path: "/clients", allowedRoles: officeRoles },
  { path: "/production", allowedRoles: ["admin", "production_manager", "warehouse"] },
  { path: "/schedule", allowedRoles: ["admin", "scheduler", "production_manager", "installer"] },
  { path: "/inventory", allowedRoles: ["admin", "production_manager", "warehouse"] },
  { path: "/payments", allowedRoles: ["admin"] },
  { path: "/messages", allowedRoles: officeRoles },
  { path: "/quote-analytics", allowedRoles: ["admin", "sales"] },
  { path: "/automation", allowedRoles: ["admin"] },
  { path: "/installer", allowedRoles: ["admin", "installer"] },
  { path: "/trade", allowedRoles: ["admin", "trade_client"] },
  { path: "/organisation/departments", allowedRoles: ["admin"] },
  { path: "/organisation/workflows", allowedRoles: allInternalRoles },
  { path: "/organisation/policies", allowedRoles: allInternalRoles },
  { path: "/organisation/resources", allowedRoles: allInternalRoles },
  { path: "/organisation/knowledge", allowedRoles: allInternalRoles },
  { path: "/live-doc-templates", allowedRoles: ["admin", "sales", "scheduler", "production_manager"] },
  { path: "/import", allowedRoles: ["admin"] },
  { path: "/unauthorized", allowedRoles: allInternalRoles },
];

export function hasRouteAccess(role: UserRole | undefined, route: string): boolean {
  if (!role) return false;
  
  if (role === "admin") return true;
  
  const matchedConfig = routePermissions.find(config => {
    if (config.path === route) return true;
    if (route.startsWith(config.path + "/")) return true;
    return false;
  });
  
  if (!matchedConfig) return false;
  
  return matchedConfig.allowedRoles.includes(role);
}

export function getDefaultRoute(role: UserRole | undefined): string {
  if (!role) return "/login";
  if (role === "trade_client") return "/trade";
  return "/";
}

export function getRolesForRoute(route: string): UserRole[] {
  const matchedConfig = routePermissions.find(config => {
    if (config.path === route) return true;
    if (route.startsWith(config.path + "/")) return true;
    return false;
  });
  
  return matchedConfig?.allowedRoles || [];
}
