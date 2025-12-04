import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldX, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDefaultRoute, type UserRole } from "@/lib/permissions";

export default function Unauthorized() {
  const { user } = useAuth();
  const defaultRoute = getDefaultRoute(user?.role as UserRole | undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-unauthorized-title">
            Access Denied
          </CardTitle>
          <CardDescription data-testid="text-unauthorized-message">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href={defaultRoute}>
            <Button data-testid="button-go-home">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
