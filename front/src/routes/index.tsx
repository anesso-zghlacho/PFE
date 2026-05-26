import { Activity, ArrowRight, Gauge, ShieldCheck } from "lucide-react";

import { AlertFeed } from "@/components/alert-feed";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { StatCard } from "@/components/stat-card";
import { TrafficChart } from "@/components/traffic-chart";
import { TrafficTable } from "@/components/traffic-table";
import { createFileRoute } from "@tanstack/react-router";
import { useMonitoring } from "@/context/monitoring-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Soficlef Sentinel Flow IDS" },
      { name: "description", content: "Live overview of internal network traffic and security posture." },
    ],
  }),
  component: Index,
});

function Index() {
  const { packets, kbps, totalBytes, pendingAlerts, logs, alerts } = useMonitoring();
  const allClear = pendingAlerts === 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Traffic Volume"
          value={packets.toLocaleString()}
          hint="packets captured"
          icon={<Activity className="h-3.5 w-3.5" />}
        />
        <StatCard
          label="Security Status"
          value={allClear ? "All Systems Clear" : `${pendingAlerts} Alerts Pending`}
          hint={allClear ? "No active threats" : "Review threat feed"}
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          tone={allClear ? "success" : "danger"}
        />
        <StatCard
          label="Network Load"
          value={`${Math.round(kbps)} KB/s`}
          hint={`${(totalBytes / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB total`}
          icon={<Gauge className="h-3.5 w-3.5" />}
        />
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Network Activity</h2>
            <p className="text-xs text-muted-foreground">Throughput · last 30 minutes</p>
          </div>
        </div>
        <TrafficChart />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Traffic</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link to="/traffic">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <TrafficTable logs={logs.slice(0, 10)} maxHeight="auto" />
        </section>
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Alerts</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link to="/alerts">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <AlertFeed alerts={alerts} limit={5} />
        </section>
      </div>
    </div>
  );
}
