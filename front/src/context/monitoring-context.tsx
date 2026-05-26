import * as React from "react";

import { api } from "./auth-context";

export type Protocol = "TCP" | "UDP" | "ICMP" | string;
export type LogStatus = "Secure" | "Warning" | "Critical";

export interface TrafficLog {
  id: string;
  time: number;
  protocol: Protocol;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  status: LogStatus;
  bytes: number;
  predictedLabel: string;
}

export type ThreatSeverity = "low" | "medium" | "high" | "critical";

export interface ThreatAlert {
  id: string;
  time: number;
  type: string;
  description: string;
  sourceIp: string;
  severity: ThreatSeverity;
}

export interface TrafficPoint {
  t: number;
  kbps: number;
}

interface MonitoringState {
  running: boolean;
  toggle: () => void;
  packets: number;
  kbps: number;
  totalBytes: number;
  logs: TrafficLog[];
  alerts: ThreatAlert[];
  series: TrafficPoint[];
  pendingAlerts: number;
}

const Ctx = React.createContext<MonitoringState | null>(null);

function mapProtocol(p: string): Protocol {
  if (p === "6") return "TCP";
  if (p === "17") return "UDP";
  if (p === "1") return "ICMP";
  return p;
}

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [running, setRunning] = React.useState(false);
  const [packets, setPackets] = React.useState(0);
  const [kbps, setKbps] = React.useState(0);
  const [totalBytes, setTotalBytes] = React.useState(0);
  const [uniqueProtocols, setUniqueProtocols] = React.useState(0);
  const [logs, setLogs] = React.useState<TrafficLog[]>([]);
  const [alerts, setAlerts] = React.useState<ThreatAlert[]>([]);
  const [series, setSeries] = React.useState<TrafficPoint[]>(() => {
    const arr: TrafficPoint[] = [];
    const now = Date.now();
    for (let i = 59; i >= 0; i--) {
      const t = now - i * 30000; // 30-second intervals for 30 minutes total
      const base = 85 + Math.sin(i / 4.0) * 35 + Math.cos(i / 2.0) * 15;
      const val = Math.max(10, Math.round(base + Math.random() * 20));
      arr.push({ t, kbps: val });
    }
    return arr;
  });
  const statsRef = React.useRef({ bytes: 0, time: 0 });

  const fetchStatus = async () => {
    try {
      const res = await api.get("/sniffer/status/");
      setRunning(res.data.is_running);
    } catch (err) {
      console.error("Failed to fetch sniffer status", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/traffic/statistics/");
      const { total_logs, total_bytes, unique_protocols } = res.data;
      setPackets(total_logs);
      setTotalBytes(total_bytes ?? 0);
      setUniqueProtocols(unique_protocols ?? 0);

      const now = Date.now();
      const previous = statsRef.current;
      if (previous.time > 0) {
        const elapsedSeconds = Math.max((now - previous.time) / 1000, 1);
        const bytesDelta = Math.max(0, total_bytes - previous.bytes);
        setKbps(Math.round(bytesDelta / 1024 / elapsedSeconds));
      } else {
        setKbps(Math.round((total_bytes ?? 0) / 1024 / 30));
      }

      statsRef.current = { bytes: total_bytes ?? 0, time: now };
    } catch (err) {
      console.error("Failed to fetch statistics", err);
    }
  };

  const fetchData = async () => {
    try {
      const [logsRes, alertsRes] = await Promise.all([
        api.get("/traffic/?limit=50"),
        api.get("/alerts/unresolved/"),
      ]);

      // Handle both paginated and non-paginated responses
      const logsData = logsRes.data.results || logsRes.data;
      const alertsData = alertsRes.data.results || alertsRes.data;

      const mappedLogs: TrafficLog[] = Array.isArray(logsData) ? logsData.map((l: any) => ({
        id: l.id.toString(),
        time: new Date(l.timestamp).getTime(),
        protocol: mapProtocol(l.protocol.toString()),
        sourceIp: l.src_ip,
        sourcePort: l.src_port,
        destIp: l.dst_ip,
        destPort: l.dst_port,
        status: (l.predicted_label || '').toUpperCase() === 'NORMAL' ? "Secure" : "Critical",
        bytes: l.byte_count,
        predictedLabel: l.predicted_label || 'NORMAL',
      })) : [];

      const mappedAlerts: ThreatAlert[] = Array.isArray(alertsData) ? alertsData.map((a: any) => ({
        id: a.id.toString(),
        time: new Date(a.timestamp).getTime(),
        type: a.title,
        description: a.description,
        sourceIp: a.source_ip,
        severity: a.severity.toLowerCase() as ThreatSeverity,
      })) : [];

      setLogs(mappedLogs);
      setAlerts(mappedAlerts);
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    }
  };

  React.useEffect(() => {
    fetchStatus();
    fetchData();
    fetchStats();

    const interval = setInterval(() => {
      fetchData();
      fetchStats();
      fetchStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    setSeries((prev) => {
      const arr = [...prev, { t: Date.now(), kbps }];
      return arr.length > 60 ? arr.slice(arr.length - 60) : arr;
    });
  }, [kbps]);

  const toggle = async () => {
    try {
      if (running) {
        await api.post("/sniffer/stop/");
      } else {
        await api.post("/sniffer/start/", { interface: "any" });
      }
      await fetchStatus();
    } catch (err) {
      console.error("Failed to toggle sniffer", err);
    }
  };

  const value = React.useMemo<MonitoringState>(
    () => ({
      running,
      toggle,
      packets,
      kbps,
      totalBytes,
      logs,
      alerts,
      series,
      pendingAlerts: alerts.length,
    }),
    [running, packets, kbps, totalBytes, logs, alerts, series]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMonitoring() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useMonitoring must be used inside MonitoringProvider");
  return v;
}

