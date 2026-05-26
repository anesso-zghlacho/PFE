import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TrafficLog } from "@/context/monitoring-context";

const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const protocolStyle: Record<string, string> = {
  TCP: "bg-primary/15 text-primary border-primary/30",
  UDP: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  ICMP: "bg-warning/15 text-warning border-warning/30",
};

export function TrafficTable({
  logs,
  maxHeight = "calc(100vh - 220px)",
}: {
  logs: TrafficLog[];
  maxHeight?: string;
}) {
  return (
    <div
      className="overflow-auto rounded-lg border border-border bg-card"
      style={{ maxHeight }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Protocol</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Destination</th>
            <th className="px-4 py-3 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-border/60 transition-colors hover:bg-accent/30"
            >
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                {fmtTime(log.time)}
              </td>
              <td className="px-4 py-2.5">
                <Badge
                  variant="outline"
                  className={cn("font-mono text-[10px]", protocolStyle[log.protocol])}
                >
                  {log.protocol}
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs">
                <span>{log.sourceIp}</span>
                <span className="text-muted-foreground">:{log.sourcePort}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs">
                <span>{log.destIp}</span>
                <span className="text-muted-foreground">:{log.destPort}</span>
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5",
                    log.status === "Secure" ? "text-success" : "text-destructive",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      log.status === "Secure" ? "bg-success" : "bg-destructive",
                    )}
                  />
                  {log.predictedLabel}
                </span>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No traffic captured yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
