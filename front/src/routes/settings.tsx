import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { User, Shield } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          View your profile details and assigned roles.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.username}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Role:</span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold uppercase">
                {user?.is_staff ? "Administrator" : "Analyst"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your role defines what actions you can take within the IDS dashboard. Administrators have full system access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
