import { useState, useMemo } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import type { Alert, AlertType, Severity } from '@/lib/ids-types';
import { ALERT_TYPE_LABELS, SEVERITY_COLORS } from '@/lib/ids-types';

interface Props {
  alerts: Alert[];
  onClear: () => void;
}

const severityBadge: Record<Severity, string> = {
  low: 'bg-success/15 text-success border-success/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  high: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function AlertsPage({ alerts, onClear }: Props) {
  const [filterType, setFilterType] = useState<AlertType | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | ''>('');
  const [filterIp, setFilterIp] = useState('');

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filterType && a.alert_type !== filterType) return false;
      if (filterSeverity && a.severity !== filterSeverity) return false;
      if (filterIp && !a.src_ip.includes(filterIp)) return false;
      return true;
    });
  }, [alerts, filterType, filterSeverity, filterIp]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-primary text-glow-primary flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" /> Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{alerts.length} total alerts detected</p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card rounded-lg border border-border p-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as AlertType | '')}
          className="bg-secondary text-foreground text-sm rounded-md px-3 py-1.5 border border-border"
        >
          <option value="">All Types</option>
          {Object.entries(ALERT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value as Severity | '')}
          className="bg-secondary text-foreground text-sm rounded-md px-3 py-1.5 border border-border"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="text"
          placeholder="Filter by IP..."
          value={filterIp}
          onChange={e => setFilterIp(e.target.value)}
          className="bg-secondary text-foreground text-sm rounded-md px-3 py-1.5 border border-border placeholder:text-muted-foreground"
        />
      </div>

      {/* Alert table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Time</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Severity</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Source IP</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground font-mono">
                    No alerts match current filters
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map(alert => (
                  <tr key={alert.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {alert.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {ALERT_TYPE_LABELS[alert.alert_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${severityBadge[alert.severity]}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{alert.src_ip}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-md truncate">
                      {alert.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
