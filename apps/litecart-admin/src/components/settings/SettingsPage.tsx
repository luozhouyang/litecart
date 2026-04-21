import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";

export function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    void navigate({ to: "/auth/login" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    void navigate({ to: "/auth/login" });
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user?.name || ""} disabled />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
          </div>
          <p className="text-sm text-muted-foreground">
            Profile updates are handled through the authentication system.
          </p>
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active Session</p>
              <p className="text-sm text-muted-foreground">You are currently signed in</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
