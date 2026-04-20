export interface TrafficLog {
  id: number;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  duration?: number;
  packet_count: number;
  byte_count: number;
  bytes_per_packet: number;
  packets_per_sec: number;
  syn_count: number;
  ack_count: number;
  fin_count: number;
  timestamp?: string;
}

export interface Alert {
  alert_type: any;
  id: number;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_ip: string;
  timestamp: string;
  traffic_log?: TrafficLog;
  is_resolved: boolean;
}

export type AlertType = 'SYN_FLOOD' | 'PORT_SCAN' | 'BRUTE_FORCE' | 'DDoS' | 'MALWARE';

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  SYN_FLOOD: 'SYN Flood',
  PORT_SCAN: 'Port Scan',
  BRUTE_FORCE: 'Brute Force',
  DDoS: 'DDoS Attack',
  MALWARE: 'Malware Detection',
};