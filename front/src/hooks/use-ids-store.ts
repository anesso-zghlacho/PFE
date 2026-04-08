import { useState, useCallback, useEffect, useRef } from 'react';
import type { TrafficLog, Alert } from '@/lib/ids-types';
import { api } from '@/lib/api-client';

const MAX_LOGS = 500;
const MAX_ALERTS = 200;

export function useIDSStore() {
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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

  // Keep ref in sync with the current traffic log list
  useEffect(() => {
    logsRef.current = trafficLogs;
  }, [trafficLogs]);

  const clearAlerts = useCallback(() => setAlerts([]), []);
  const clearLogs = useCallback(() => {
    setTrafficLogs([]);
    logsRef.current = [];
  }, []);

  return {
    trafficLogs,
    alerts,
    clearAlerts,
    clearLogs,
  };
}
