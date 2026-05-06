import { Activity, Trash2, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TrafficLog } from '@/lib/ids-types';

interface Props {
  trafficLogs: TrafficLog[];
  onClear: () => void;
}

export function TrafficPage({ trafficLogs, onClear }: Props) {
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2 text-primary/70">
            <Globe className="h-4 w-4" />
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase">Traffic Analysis</span>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-foreground text-glow mb-2 uppercase">Network_Flux</h1>
          <p className="text-sm text-muted-foreground font-mono">
            PACKET_BUFFER: <span className="text-primary font-bold">{trafficLogs.length}</span> | STATUS: <span className="text-success font-bold">STABLE</span>
          </p>
        </motion.div>
        
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-mono bg-white/5 border border-white/10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 rounded-xl transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          CLEAR_NETWORK_CACHE
        </button>
      </div>

      {/* Table Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl border border-white/5 overflow-hidden"
      >
        <div className="overflow-x-auto max-h-[75vh] custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background/80 backdrop-blur-xl z-20">
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Timestamp</th>
                <th className="text-left px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Protocol</th>
                <th className="text-left px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Source_Vector</th>
                <th className="text-left px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Dest_Vector</th>
                <th className="text-left px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Size</th>
                <th className="text-left px-6 py-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {trafficLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-muted-foreground font-mono text-xs italic">
                    [NO_TRAFFIC_DATA_AVAILABLE]
                  </td>
                </tr>
              ) : (
                trafficLogs.slice(0, 100).map((log, idx) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase">
                        {log.protocol === '6' ? 'TCP' : log.protocol === '17' ? 'UDP' : log.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-foreground/80">
                      {log.src_ip}<span className="text-primary/50 mx-1">:</span>{log.src_port}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-foreground/80">
                      {log.dst_ip}<span className="text-primary/50 mx-1">:</span>{log.dst_port}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">
                      {log.byte_count ? (log.byte_count / 1024).toFixed(2) : '0.00'} KB
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-success">
                        <ShieldCheck className="h-3 w-3" />
                        VALIDATED
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
