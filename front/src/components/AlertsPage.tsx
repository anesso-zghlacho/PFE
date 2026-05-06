import { useState, useMemo } from 'react';
import { AlertTriangle, Filter, CheckCircle2, ShieldAlert, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Alert } from '@/lib/ids-types';

interface Props {
  alerts: Alert[];
  onClear: () => void;
  onResolve: (id: number) => void;
}

const severityConfig: Record<string, { label: string, color: string, glow: string }> = {
  LOW: { label: 'LOW', color: 'text-success', glow: 'bg-success/20' },
  MEDIUM: { label: 'MEDIUM', color: 'text-warning', glow: 'bg-warning/20' },
  HIGH: { label: 'HIGH', color: 'text-destructive', glow: 'bg-destructive/20' },
  CRITICAL: { label: 'CRITICAL', color: 'text-destructive font-black', glow: 'bg-destructive/40' },
};

export function AlertsPage({ alerts, onClear, onResolve }: Props) {
  const [filterSeverity, setFilterSeverity] = useState<string | ''>('');
  const [filterIp, setFilterIp] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filterSeverity && a.severity !== filterSeverity) return false;
      if (filterIp && !a.source_ip.includes(filterIp)) return false;
      if (!showResolved && a.is_resolved) return false;
      return true;
    });
  }, [alerts, filterSeverity, filterIp, showResolved]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2 text-primary/70">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase">Incident Response</span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-foreground text-glow mb-2 uppercase">Alert_Registry</h1>
          <p className="text-sm text-muted-foreground font-mono">
            ACTIVE_INCIDENTS: <span className="text-destructive font-bold">{alerts.filter(a => !a.is_resolved).length}</span> | TOTAL_LOGGED: {alerts.length}
          </p>
        </motion.div>
        
        <button
          onClick={onClear}
          className="px-6 py-2.5 text-xs font-mono bg-white/5 border border-white/10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 rounded-xl transition-all"
        >
          PURGE_REGISTRY
        </button>
      </div>

      {/* Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-6 items-center glass-morphism rounded-2xl border border-white/5 p-6"
      >
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <Search className="h-4 w-4 text-primary/50" />
          <input
            type="text"
            placeholder="SEARCH_BY_IP..."
            value={filterIp}
            onChange={e => setFilterIp(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm font-mono text-foreground focus:ring-0 placeholder:text-muted-foreground/30"
          />
        </div>
        
        <div className="h-6 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-4">
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-white/5 text-foreground text-[10px] font-mono rounded-lg px-4 py-2 border border-white/10 focus:border-primary/50 transition-all outline-none"
          >
            <option value="">ALL_SEVERITIES</option>
            <option value="LOW">LOW_PRIORITY</option>
            <option value="MEDIUM">MEDIUM_PRIORITY</option>
            <option value="HIGH">HIGH_PRIORITY</option>
            <option value="CRITICAL">CRITICAL_THREAT</option>
          </select>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-10 h-5 rounded-full transition-all relative ${showResolved ? 'bg-primary/20' : 'bg-white/5 border border-white/10'}`}>
              <input
                type="checkbox"
                className="hidden"
                checked={showResolved}
                onChange={e => setShowResolved(e.target.checked)}
              />
              <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-all ${showResolved ? 'translate-x-5 bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-muted-foreground'}`} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Show_Resolved</span>
          </label>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 py-24 text-center glass-morphism rounded-2xl border border-white/5 text-muted-foreground font-mono text-sm italic"
            >
              [NO_RECORDS_MATCHING_CRITERIA]
            </motion.div>
          ) : (
            filtered.slice(0, 50).map((alert, idx) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`relative group glass-morphism rounded-2xl border border-white/5 p-5 transition-all hover:bg-white/[0.03] shimmer-effect ${alert.is_resolved ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center gap-2 min-w-[80px]">
                      <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                      <div className={`h-1.5 w-1.5 rounded-full ${severityConfig[alert.severity].color.split(' ')[0]} ${alert.severity === 'CRITICAL' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
                    </div>

                    <div className="h-10 w-px bg-white/5 hidden md:block" />

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded uppercase tracking-tighter ${severityConfig[alert.severity].color} ${severityConfig[alert.severity].glow}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-primary/80">{alert.source_ip}</span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-2xl">{alert.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto md:ml-0">
                    {!alert.is_resolved ? (
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded-xl hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-tighter active:scale-95"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolve_Case
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success text-[10px] font-black rounded-xl border border-success/20 uppercase tracking-tighter">
                        <CheckCircle2 className="h-3 w-3" />
                        Closed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
