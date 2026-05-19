import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { Shield, AlertTriangle, Activity, Zap } from 'lucide-react';
import type { TrafficLog, Alert } from '@/lib/ids-types';
import { ALERT_TYPE_LABELS } from '@/lib/ids-types';
import { StatCard } from '@/components/StatCard';

const PIE_COLORS = [
  'hsl(174, 72%, 50%)',
  'hsl(0, 72%, 55%)',
  'hsl(38, 92%, 55%)',
  'hsl(142, 72%, 45%)',
  'hsl(262, 72%, 55%)',
  'hsl(200, 72%, 50%)',
  'hsl(320, 72%, 50%)',
  'hsl(50, 72%, 50%)',
  'hsl(100, 72%, 50%)',
];

interface Props {
  trafficLogs: TrafficLog[];
  alerts: Alert[];
}

const formatDate = (date: Date) => date.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function DashboardOverview({ trafficLogs, alerts }: Props) {
  const [currentDate, setCurrentDate] = useState(() => formatDate(new Date()));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextDate = formatDate(new Date());
      setCurrentDate(prev => (prev === nextDate ? prev : nextDate));
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const alertsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of alerts) {
      counts[a.alert_type] = (counts[a.alert_type] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: ALERT_TYPE_LABELS[name as keyof typeof ALERT_TYPE_LABELS] || name,
      value,
    }));
  }, [alerts]);

  const trafficOverTime = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const log of trafficLogs) {
      const key = new Date(log.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    return [...buckets.entries()]
      .map(([time, count]) => ({ time, count }))
      .reverse()
      .slice(-20);
  }, [trafficLogs]);

  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-primary text-glow-primary">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time intrusion detection monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Total Traffic ${currentDate}`}
          value={trafficLogs.length}
          icon={<Activity className="h-5 w-5" />}
          trend="Packets captured"
        />
        <StatCard
          title="Active Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={alerts.length > 0 ? 'warning' : 'default'}
          trend={`${highAlerts} high severity`}
        />
        <StatCard
          title="High Severity"
          value={highAlerts}
          icon={<Zap className="h-5 w-5" />}
          variant={highAlerts > 0 ? 'danger' : 'default'}
          trend="Requires attention"
        />
        <StatCard
          title="Detection Engine"
          value="Active"
          icon={<Shield className="h-5 w-5" />}
          variant="success"
          trend="9 detection rules"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Over Time */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Traffic Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficOverTime}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(220, 18%, 10%)',
                    border: '1px solid hsl(220, 16%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(180, 10%, 88%)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(174, 72%, 50%)"
                  fillOpacity={1}
                  fill="url(#colorTraffic)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts by Type */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Alerts by Type</h2>
          <div className="h-64">
            {alertsByType.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-mono">
                No alerts detected
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {alertsByType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 10%)',
                      border: '1px solid hsl(220, 16%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(180, 10%, 88%)',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {alertsByType.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {alertsByType.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-mono font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
