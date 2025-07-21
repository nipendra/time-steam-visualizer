import { useEffect, useState, useCallback } from 'react';

interface DataPoint {
  t: number;
  s: number;
  e: number[];
}

interface WebSocketSimulatorProps {
  onDataReceived: (data: DataPoint) => void;
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export const useWebSocketSimulator = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalReceived, setTotalReceived] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Generate mock data that follows the required format
  const generateDataPoint = useCallback((index: number): DataPoint => {
    const baseTime = Date.now() - (11000 - index) * 100; // Spread over time
    
    return {
      t: baseTime,
      s: 107804 + index,
      e: Array.from({ length: 8 }, () => 
        200 + Math.random() * 200 + Math.sin(index * 0.1) * 50
      )
    };
  }, []);

  const startSimulation = useCallback(() => {
    // Clear any existing interval first
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    setIsConnected(true);
    setData([]);
    setTotalReceived(0);

    let currentIndex = 0;
    const targetPoints = 11000;

    const interval = setInterval(() => {
      if (currentIndex >= targetPoints) {
        clearInterval(interval);
        setIsConnected(false);
        setIntervalId(null);
        return;
      }

      const newPoint = generateDataPoint(currentIndex);
      
      setData(prev => [...prev, newPoint]);
      setTotalReceived(currentIndex + 1);
      
      // Notify service worker about new data
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'DATA_POINT',
          data: newPoint
        });
      }

      currentIndex++;
    }, 50); // 50ms interval for smooth streaming

    setIntervalId(interval);
  }, [generateDataPoint, intervalId]);

  const stopSimulation = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsConnected(false);
  }, [intervalId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    data,
    isConnected,
    totalReceived,
    startSimulation,
    stopSimulation
  };
};