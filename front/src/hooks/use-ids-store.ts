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
        source_ip: newLog.sourceIP,
        destination_ip: newLog.destinationIP,
        source_port: newLog.sourcePort,
        destination_port: newLog.destinationPort,
        protocol: newLog.protocol,
        packet_size: newLog.size,
        is_suspicious: false,
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
            title: alert.type,
            description: alert.description,
            severity: alert.severity,
            source_ip: alert.sourceIP,
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
        source_ip: log.sourceIP,
        destination_ip: log.destinationIP,
        source_port: log.sourcePort,
        destination_port: log.destinationPort,
        protocol: log.protocol,
        packet_size: log.size,
        is_suspicious: true,
      }).catch((error) => {
        console.error('Failed to send attack log:', error);
      });
    });
    
    // Send attack simulation
    api.launchAttack({
      attack_type: type,
      target_ip: attackLogs[0]?.destinationIP || '192.168.1.1',
    }).catch((error) => {
      console.error('Failed to record attack simulation:', error);
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
            title: alert.type,
            description: alert.description,
            severity: alert.severity,
            source_ip: alert.sourceIP,
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
