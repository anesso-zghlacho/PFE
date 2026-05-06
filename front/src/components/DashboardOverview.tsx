import { useMemo, useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Area, AreaChart,
  BarChart, Bar, Legend,
} from 'recharts';
import { Shield, AlertTriangle, Activity, Zap, Play, Square, Loader2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TrafficLog, Alert } from '@/lib/ids-types';
import { StatCard } from '@/components/StatCard';
import { Terminal } from '@/components/Terminal';
import { api } from '@/lib/api-client';

const COLORS = {
  primary: 'hsl(174, 100%, 45%)',
  danger: 'hsl(0, 100%, 60%)',
  warning: 'hsl(45, 100%, 50%)',
  success: 'hsl(142, 100%, 50%)',
  info: 'hsl(200, 100%, 50%)',
};

const PIE_COLORS = [
  COLORS.primary, COLORS.danger, COLORS.warning, COLORS.success, COLORS.info,
  'hsl(262, 100%, 60%)', 'hsl(320, 100%, 60%)',
];

interface Props {
  trafficLogs: TrafficLog[];
  alerts: Alert[];
}

export function DashboardOverview({ trafficLogs, alerts }: Props) {
  const [isSniffing, setIsSniffing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await api.getSnifferStatus();
        setIsSniffing(status.is_running);
      } catch (err) {
        console.error('Failed to get sniffer status:', err);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSniffer = async () => {
    setIsActionLoading(true);
    try {
      if (isSniffing) {
        await api.stopSniffer();
        setIsSniffing(false);
      } else {
        await api.startSniffer();
        setIsSniffing(true);
      }
    } catch (err) {
      console.error('Failed to toggle sniffer:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const alertsBySeverity = useMemo(() => {
    const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const a of alerts) {
      counts[a.severity] = (counts[a.severity] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  const topSources = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of alerts) {
      counts[a.source_ip] = (counts[a.source_ip] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [alerts]);

  const trafficOverTime = useMemo(() => {
    const buckets = new Map<string, { time: string, traffic: number, attacks: number }>();
    const now = Date.now();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now - i * 5000);
      const key = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      buckets.set(key, { time: key, traffic: 0, attacks: 0 });
    }

    trafficLogs.slice(0, 100).forEach(log => {
      const key = new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      if (buckets.has(key)) buckets.get(key)!.traffic++;
    });

    alerts.slice(0, 100).forEach(alert => {
      const key = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      if (buckets.has(key)) buckets.get(key)!.attacks++;
    });

    return [...buckets.values()];
  }, [trafficLogs, alerts]);

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.is_resolved).length;
  const activeAlerts = alerts.filter(a => !a.is_resolved).length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-primary" />
            <span className="text-[10px] font-mono font-bold text-primary tracking-[0.3em] uppercase">Security Dashboard</span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-foreground text-glow mb-2 uppercase">Command_Center</h1>
          <p className="text-sm text-muted-foreground font-mono">NODE_STATUS: <span className="text-primary font-bold">ONLINE</span> | REGION: NORTH_AFRICA_DATA_01</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-4 px-6 py-4 glass-morphism rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col relative z-10">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1 leading-none">Detection_Engine</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isSniffing ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                <span className={`text-xs font-mono font-black ${isSniffing ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isSniffing ? 'LIVE_STREAMING' : 'ENGINE_STANDBY'}
                </span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <button
              onClick={handleToggleSniffer}
              disabled={isActionLoading}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black tracking-tighter transition-all relative z-10 ${
                isSniffing 
                  ? 'bg-destructive text-destructive-foreground hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]' 
                  : 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(174,100,45,0.4)]'
              } disabled:opacity-50 active:scale-95`}
            >
              {isActionLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isSniffing ? (
                <><Square className="h-3.5 w-3.5 fill-current" /> STOP_SCAN</>
              ) : (
                <><Play className="h-3.5 w-3.5 fill-current" /> START_SCAN</>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Packets"
          value={trafficLogs.length.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          trend="Real-time capture"
        />
        <StatCard
          title="Detected Threats"
          value={activeAlerts}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={activeAlerts > 0 ? 'warning' : 'default'}
          trend={`${criticalAlerts} critical priority`}
        />
        <StatCard
          title="Targeted Nodes"
          value="1"
          icon={<Zap className="h-5 w-5" />}
          variant={criticalAlerts > 0 ? 'danger' : 'default'}
          trend="Primary gateway"
        />
        <StatCard
          title="Engine Status"
          value={isSniffing ? "PROTECTED" : "INACTIVE"}
          icon={<Shield className="h-5 w-5" />}
          variant={isSniffing ? "success" : "default"}
          trend={isSniffing ? "Active monitoring" : "Manual override"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Real-time Visualization */}
        <div className="lg:col-span-8 space-y-8">
          {/* Traffic vs Detection Area Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-morphism rounded-2xl border border-white/5 p-6 h-[420px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <Cpu className="h-12 w-12 text-white/5" />
            </div>
            <h2 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 
              Network_Throughput_Analysis
            </h2>
            <div className="h-[320px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficOverTime}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,10,15,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: 12,
                      fontFamily: 'monospace',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area type="monotone" dataKey="traffic" name="TOTAL_TRAFFIC" stroke={COLORS.primary} fill="url(#colorTraffic)" strokeWidth={3} animationDuration={1000} />
                  <Area type="monotone" dataKey="attacks" name="THREATS" stroke={COLORS.danger} fill="url(#colorAttacks)" strokeWidth={3} animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Lower Grid: Top Sources & Terminal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Attacker IPs */}
            <div className="glass-morphism rounded-2xl border border-white/5 p-6 h-[320px]">
              <h2 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Threat_Origin_Telemetry</h2>
              <div className="h-[220px]">
                {topSources.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono italic">
                    [WAITING_FOR_TELEMETRY]
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="ip" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }} width={100} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{
                          backgroundColor: 'rgba(10,10,15,0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: 10,
                        }}
                      />
                      <Bar dataKey="count" fill={COLORS.danger} radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Terminal View */}
            <div className="h-[320px]">
              <Terminal logs={trafficLogs} />
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Analysis */}
        <div className="lg:col-span-4 space-y-8">
          {/* Severity Distribution */}
          <div className="glass-morphism rounded-2xl border border-white/5 p-6 h-[380px]">
            <h2 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Severity_Classification</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsBySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {alertsBySeverity.map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={entry.name === 'CRITICAL' ? COLORS.danger : entry.name === 'HIGH' ? COLORS.warning : entry.name === 'MEDIUM' ? COLORS.info : COLORS.success} 
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,10,15,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: 10, paddingTop: 20, fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent High-Priority Events */}
          <div className="glass-morphism rounded-2xl border border-white/5 p-6 flex-1 min-h-[360px]">
            <h2 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">High_Priority_Events</h2>
            <div className="space-y-4">
              {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').slice(0, 4).map((alert, idx) => (
                <motion.div 
                  key={alert.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all group"
                >
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-destructive box-glow-destructive animate-pulse' : 'bg-warning box-glow-warning'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{alert.title}</span>
                      <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">{alert.source_ip}</div>
                  </div>
                </motion.div>
              ))}
              {alerts.length === 0 && (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-[10px] font-mono italic text-center">
                  [SYSTEM_NOMINAL]<br />NO_THREATS_DETECTED
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-2 text-[10px] font-mono text-primary/60 hover:text-primary transition-colors border border-primary/10 rounded-lg hover:bg-primary/5">
              VIEW_ALL_INCIDENTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    </div>
  );
}
