import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth, api } from "@/context/auth-context";
import { Shield, Activity, Clock, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/logs")({
  component: AccessLogsPage,
});

interface AccessLog {
  id: number;
  username: string;
  action: "LOGIN" | "LOGOUT";
  ip_address: string;
  timestamp: string;
}

function AccessLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = React.useState<AccessLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.is_staff) {
      api.get("/access-logs/")
        .then((res) => {
          if (res.data.results) {
            setLogs(res.data.results);
          } else {
            setLogs(res.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user?.is_staff) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need administrator privileges to view access logs.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Authentication History</h1>
          <p className="text-sm text-muted-foreground">
            Audit trail of all login and logout events in Sentinel IDS.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium">
          <Activity className="h-4 w-4 text-primary" />
          {logs.length} Events
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No authentication history found.</div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {log.action === "LOGIN" ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                            <LogIn className="h-3.5 w-3.5 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10">
                            <LogOut className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                        )}
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle font-mono">{log.username}</td>
                    <td className="p-4 align-middle font-mono text-muted-foreground">{log.ip_address || "Unknown"}</td>
                    <td className="p-4 align-middle text-right text-muted-foreground">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
