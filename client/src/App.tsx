import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { NewMessageBanner } from "@/components/layout/NewMessageBanner";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Login from "@/pages/Login";
import MyDashboard from "@/pages/MyDashboard";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Quotes from "@/pages/Quotes";
import Jobs from "@/pages/Jobs";
import Clients from "@/pages/Clients";
import Production from "@/pages/Production";
import Schedule from "@/pages/Schedule";
import Inventory from "@/pages/Inventory";
import Payments from "@/pages/Payments";
import Messages from "@/pages/Messages";
import QuoteAnalytics from "@/pages/QuoteAnalytics";
import AutomationCampaigns from "@/pages/AutomationCampaigns";
import Installer from "@/pages/Installer";
import Trade from "@/pages/Trade";
import NotFound from "@/pages/not-found";

import OrganisationDepartments from "@/pages/organisation/Departments";
import OrganisationWorkflows from "@/pages/organisation/Workflows";
import OrganisationPolicies from "@/pages/organisation/Policies";
import OrganisationResources from "@/pages/organisation/Resources";
import OrganisationKnowledge from "@/pages/organisation/Knowledge";
import LiveDocTemplates from "@/pages/LiveDocTemplates";

function MainLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <NewMessageBanner />
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function InstallerLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-auto">{children}</div>;
}

function TradeLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-auto">{children}</div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/login">
        <LoginRedirect />
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <MainLayout>
            <MyDashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/business-dashboard">
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/leads">
        <ProtectedRoute>
          <MainLayout>
            <Leads />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/quotes">
        <ProtectedRoute>
          <MainLayout>
            <Quotes />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs">
        <ProtectedRoute>
          <MainLayout>
            <Jobs />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/clients">
        <ProtectedRoute>
          <MainLayout>
            <Clients />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/production">
        <ProtectedRoute>
          <MainLayout>
            <Production />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/schedule">
        <ProtectedRoute>
          <MainLayout>
            <Schedule />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/inventory">
        <ProtectedRoute>
          <MainLayout>
            <Inventory />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/payments">
        <ProtectedRoute>
          <MainLayout>
            <Payments />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages">
        <ProtectedRoute>
          <MainLayout>
            <Messages />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/quote-analytics">
        <ProtectedRoute>
          <MainLayout>
            <QuoteAnalytics />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/automation">
        <ProtectedRoute>
          <MainLayout>
            <AutomationCampaigns />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/installer">
        <ProtectedRoute>
          <InstallerLayout>
            <Installer />
          </InstallerLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/trade">
        <ProtectedRoute>
          <TradeLayout>
            <Trade />
          </TradeLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/organisation/departments">
        <ProtectedRoute>
          <MainLayout>
            <OrganisationDepartments />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/organisation/workflows">
        <ProtectedRoute>
          <MainLayout>
            <OrganisationWorkflows />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/organisation/policies">
        <ProtectedRoute>
          <MainLayout>
            <OrganisationPolicies />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/organisation/resources">
        <ProtectedRoute>
          <MainLayout>
            <OrganisationResources />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/organisation/knowledge">
        <ProtectedRoute>
          <MainLayout>
            <OrganisationKnowledge />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/live-doc-templates">
        <ProtectedRoute>
          <MainLayout>
            <LiveDocTemplates />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function LoginRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <Login />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="probuild-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AuthenticatedRouter />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
