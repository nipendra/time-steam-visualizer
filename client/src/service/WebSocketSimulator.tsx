import { useEffect, useRef, useState, useCallback } from 'react';

interface DataPoint {
  t: number;
  s: number;
  e: number[];
}

export const useWebSocketSimulator = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalReceived, setTotalReceived] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (
      !socketRef.current ||
      socketRef.current.readyState === WebSocket.CLOSED ||
      socketRef.current.readyState === WebSocket.CLOSING
    ) {
      const socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const point: DataPoint = JSON.parse(event.data);
        setData((prev) => [...prev, point]);
        setTotalReceived((prev) => prev + 1);
      };

      socket.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
      };

      socket.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
      };

      socketRef.current = socket;
    }
  }, []);

  const startSimulation = useCallback(() => {
    connect();

    // Wait until WebSocket is OPEN before sending 'START'
    const waitUntilOpen = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send('START');
        setData([]);
        setTotalReceived(0);
        clearInterval(waitUntilOpen);
      }
    }, 100);
  }, [connect]);

  const stopSimulation = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send('STOP');
    } else {
      console.warn('[WebSocket] STOP: Not connected or already closed.');
    }
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return {
    data,
    isConnected,
    totalReceived,
    startSimulation,
    stopSimulation
  };
};
