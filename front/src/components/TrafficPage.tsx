import { Activity } from 'lucide-react';
import type { TrafficLog } from '@/lib/ids-types';

interface Props {
  trafficLogs: TrafficLog[];
  onClear: () => void;
}

export function TrafficPage({ trafficLogs, onClear }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-primary text-glow-primary flex items-center gap-2">
            <Activity className="h-6 w-6" /> Traffic Monitor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Live incoming traffic logs</p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Time</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Protocol</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Source</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Destination</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Packets</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Bytes</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Duration</th>
              </tr>
            </thead>
            <tbody>
              {trafficLogs.slice(0, 100).map(log => (
                <tr key={log.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {log.protocol}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {log.src_ip}:{log.src_port}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    {log.dst_ip}:{log.dst_port}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                    {log.packet_count}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                    {log.byte_count}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                    {log.duration !== undefined && log.duration !== null ? log.duration.toFixed(2) : '0.00'}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
