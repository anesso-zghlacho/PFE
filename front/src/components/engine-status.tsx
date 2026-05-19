import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMonitoring } from "@/context/monitoring-context";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/auth-context";

export function EngineStatus() {
  const { running, toggle } = useMonitoring();
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          {running && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60 opacity-75" />
          )}
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              running ? "bg-success" : "bg-muted-foreground",
            )}
          />
        </span>
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          Engine
        </span>
        <span className="text-xs font-semibold">
          {running ? "Monitoring" : "Idle"}
        </span>
      </div>
      {user?.is_staff && (
        <Button
          size="sm"
          variant={running ? "destructive" : "default"}
          onClick={toggle}
          className="gap-2"
        >
          {running ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Stop Monitoring" : "Start Monitoring"}
        </Button>
      )}
    </div>
  );
}
