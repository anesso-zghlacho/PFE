import { createFileRoute } from "@tanstack/react-router";
import { useMonitoring } from "@/context/monitoring-context";
import { TrafficTable } from "@/components/traffic-table";

export const Route = createFileRoute("/traffic")({
  head: () => ({
    meta: [
      { title: "Traffic Logs — Sentinel IDS" },
      { name: "description", content: "Live capture of all packets traversing the internal network." },
    ],
  }),
  component: TrafficPage,
});

function TrafficPage() {
  const { logs } = useMonitoring();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold">Live Traffic Logs</h2>
          <p className="text-xs text-muted-foreground">
            {logs.length.toLocaleString()} packets in buffer
          </p>
        </div>
      </div>
      <TrafficTable logs={logs} />
    </div>
  );
}
