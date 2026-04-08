import { useState, useCallback, useEffect, useRef } from 'react';
import type { TrafficLog, Alert, AlertType } from '@/lib/ids-types';
import { generateNormalTraffic, simulateAttack, detectThreats } from '@/lib/ids-engine';
import { api } from '@/lib/api-client';

const MAX_LOGS = 500;
const MAX_ALERTS = 200;

export function useIDSStore() {
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const logsRef = useRef<TrafficLog[]>([]);

  // Initialize data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [trafficResponse, alertsResponse] = await Promise.all([
          api.getTrafficLogs(),
          api.getAlerts(),
        ]);
        
        const trafficData = Array.isArray(trafficResponse) ? trafficResponse : trafficResponse.results || [];
        const alertsData = Array.isArray(alertsResponse) ? alertsResponse : alertsResponse.results || [];
        
        setTrafficLogs(trafficData.slice(0, MAX_LOGS));
        setAlerts(alertsData.slice(0, MAX_ALERTS));
        logsRef.current = trafficData.slice(0, MAX_LOGS);
      } catch (error) {
        console.error('Failed to load data from backend:', error);
      }
    };
    
    loadData();
  }, []);

  // Keep ref in sync for detection
  useEffect(() => {
    logsRef.current = trafficLogs;
  }, [trafficLogs]);

  // Generate background traffic and sync to backend
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const newLog = generateNormalTraffic();
      
      // Send to backend
      api.createTrafficLog({
        src_ip: newLog.src_ip,
        dst_ip: newLog.dst_ip,
        src_port: newLog.src_port,
        dst_port: newLog.dst_port,
        protocol: newLog.protocol,
        duration: newLog.duration,
        packet_count: newLog.packet_count,
        byte_count: newLog.byte_count,
        bytes_per_packet: newLog.bytes_per_packet,
        packets_per_sec: newLog.packets_per_sec,
        syn_count: newLog.syn_count,
        ack_count: newLog.ack_count,
        fin_count: newLog.fin_count,
      }).catch((error) => {
        console.error('Failed to send traffic log:', error);
      });

      setTrafficLogs(prev => {
        const next = [newLog, ...prev].slice(0, MAX_LOGS);
        logsRef.current = next;
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Run detection periodically
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const detected = detectThreats(logsRef.current, 15);
      if (detected.length > 0) {
        // Send detected alerts to backend
        detected.forEach(alert => {
          api.createAlert({
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            source_ip: alert.source_ip,
            is_resolved: false,
          }).catch((error) => {
            console.error('Failed to send alert:', error);
          });
        });
        
        setAlerts(prev => [...detected, ...prev].slice(0, MAX_ALERTS));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const launchAttack = useCallback((type: AlertType) => {
    const attackLogs = simulateAttack(type);
    
    // Send attack logs to backend
    attackLogs.forEach(log => {
      api.createTrafficLog({
        src_ip: log.src_ip,
        dst_ip: log.dst_ip,
        src_port: log.src_port,
        dst_port: log.dst_port,
        protocol: log.protocol,
        duration: log.duration,
        packet_count: log.packet_count,
        byte_count: log.byte_count,
        bytes_per_packet: log.bytes_per_packet,
        packets_per_sec: log.packets_per_sec,
        syn_count: log.syn_count,
        ack_count: log.ack_count,
        fin_count: log.fin_count,
      }).catch((error) => {
        console.error('Failed to send attack log:', error);
      });
    });
    
    setTrafficLogs(prev => {
      const next = [...attackLogs, ...prev].slice(0, MAX_LOGS);
      logsRef.current = next;
      return next;
    });
    
    // Immediately run detection after attack injection
    setTimeout(() => {
      const detected = detectThreats(logsRef.current, 30);
      if (detected.length > 0) {
        // Send detected alerts
        detected.forEach(alert => {
          api.createAlert({
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            source_ip: alert.source_ip,
            is_resolved: false,
          }).catch((error) => {
            console.error('Failed to send alert:', error);
          });
        });
        
        setAlerts(prev => [...detected, ...prev].slice(0, MAX_ALERTS));
      }
    }, 500);
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);
  const clearLogs = useCallback(() => {
    setTrafficLogs([]);
    logsRef.current = [];
  }, []);

  return {
    trafficLogs,
    alerts,
    isRunning,
    setIsRunning,
    launchAttack,
    clearAlerts,
    clearLogs,
  };
}
