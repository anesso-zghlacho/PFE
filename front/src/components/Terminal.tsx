import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLine {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRIT';
  message: string;
}

interface Props {
  logs: any[]; // Using TrafficLog data for simulation
}

export function Terminal({ logs }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logs.length > 0) {
      const latest = logs[0];
      const newLine: TerminalLine = {
        id: Math.random().toString(36),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        level: latest.predicted_label === 'attack' ? 'CRIT' : 'INFO',
        message: `${latest.src_ip} -> ${latest.dst_ip} | PROTO: ${latest.protocol} | SIZE: ${latest.packet_size}B`,
      };
      setLines(prev => [newLine, ...prev].slice(0, 50));
    }
  }, [logs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [lines]);

  return (
    <div className="flex flex-col h-full glass-morphism rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground">Core_Engine_Logs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] font-mono text-primary/70 uppercase">Live_Feed</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto custom-scrollbar bg-black/40"
      >
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 whitespace-nowrap"
            >
              <span className="text-muted-foreground">[{line.timestamp}]</span>
              <span className={
                line.level === 'CRIT' ? 'text-destructive font-bold' : 
                line.level === 'WARN' ? 'text-warning' : 'text-primary/70'
              }>
                {line.level}
              </span>
              <span className="text-foreground/80">{line.message}</span>
            </motion.div>
          ))}
          {lines.length === 0 && (
            <div className="text-muted-foreground animate-pulse">Waiting for network packets...</div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="px-4 py-1.5 bg-black/20 border-t border-white/5 flex items-center gap-4 text-[9px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> BUFFER_OK</div>
        <div className="flex items-center gap-1"><Wifi className="h-3 w-3" /> STREAM_STABLE</div>
      </div>
    </div>
  );
}
