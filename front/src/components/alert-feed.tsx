import * as React from "react";
import { ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ThreatAlert } from "@/context/monitoring-context";

const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const sevColor: Record<string, string> = {
  high: "text-destructive bg-destructive/10 border-destructive/30",
  medium: "text-warning bg-warning/10 border-warning/30",
  low: "text-muted-foreground bg-muted border-border",
};

export function AlertFeed({ alerts, limit }: { alerts: ThreatAlert[]; limit?: number }) {
  const [active, setActive] = React.useState<ThreatAlert | null>(null);
  const items = limit ? alerts.slice(0, limit) : alerts;

  return (
    <>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {items.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">
            No threats detected.
          </li>
        )}
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
                sevColor[a.severity],
              )}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{a.type}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    sevColor[a.severity],
                  )}
                >
                  {a.severity}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{a.sourceIp}</span>
                <span>·</span>
                <span>{fmtTime(a.time)}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-xs"
              onClick={() => setActive(a)}
            >
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="bg-card">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  {active.type}
                </SheetTitle>
                <SheetDescription>{active.description}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Severity</dt>
                  <dd className="font-medium uppercase">{active.severity}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Source IP</dt>
                  <dd className="font-mono">{active.sourceIp}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Detected</dt>
                  <dd className="font-mono">{new Date(active.time).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Alert ID</dt>
                  <dd className="font-mono text-xs">{active.id}</dd>
                </div>
              </dl>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
