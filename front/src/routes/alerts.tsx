import { createFileRoute } from "@tanstack/react-router";
import { useMonitoring } from "@/context/monitoring-context";
import { AlertFeed } from "@/components/alert-feed";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});

function AlertsPage() {
  const { alerts, pendingAlerts } = useMonitoring();
  
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Threat Alerts</h2>
          <p className="text-sm text-muted-foreground">
            {pendingAlerts > 0 ? `${pendingAlerts} unresolved alerts require attention.` : "No pending alerts. All clear."}
          </p>
        </div>
      </div>
      <AlertFeed alerts={alerts} />
    </div>
  );
}
