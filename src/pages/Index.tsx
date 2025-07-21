import React, { useEffect, useState, useCallback } from 'react';
import { RealtimeChart } from '@/components/RealtimeChart';
import { useWebSocketSimulator } from '@/components/WebSocketSimulator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DataPoint {
  t: number;
  s: number;
  e: number[];
}

const Index = () => {
  const [currentDataPoint, setCurrentDataPoint] = useState<DataPoint | null>(null);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  const {
    data,
    isConnected,
    totalReceived,
    startSimulation,
    stopSimulation
  } = useWebSocketSimulator();

  // Initialize service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          setServiceWorkerReady(true);
          
          // Register this tab with the service worker
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'REGISTER_TAB'
            });
          }
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data: messageData } = event.data;
        
        switch (type) {
          case 'DATA_UPDATE':
            setCurrentDataPoint(messageData);
            break;
        }
      });
    }
  }, []);

  // Update current data point when new data arrives and send to service worker
  useEffect(() => {
    if (data.length > 0) {
      const latestPoint = data[data.length - 1];
      setCurrentDataPoint(latestPoint);
      
      // Send to service worker for cross-tab communication
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'DATA_POINT',
          data: latestPoint
        });
      }
    }
  }, [data]);


  const openSecondTab = () => {
    const newTab = window.open('/second-tab', '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Data Visualization Dashboard
              </h1>
              <p className="text-muted-foreground">
                Real-time streaming data visualization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={serviceWorkerReady ? "default" : "secondary"}>
                SW: {serviceWorkerReady ? 'Ready' : 'Loading'}
              </Badge>
              <Badge variant={isConnected ? "default" : "secondary"}>
                Stream: {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button onClick={openSecondTab} variant="outline">
                Open Tracker Tab
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Chart Section - Full Width */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Data Stream Visualization</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={startSimulation} 
                  disabled={isConnected}
                  variant="default"
                >
                  Start Stream
                </Button>
                <Button 
                  onClick={stopSimulation} 
                  disabled={!isConnected}
                  variant="outline"
                >
                  Stop Stream
                </Button>
              </div>
            </div>
            
            <Card className="p-1">
              <RealtimeChart data={data} maxPoints={200} />
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Points received: {totalReceived.toLocaleString()}</span>
                  <span>Target: 11,000 points</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalReceived / 11000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Click "Start Stream" to begin data visualization</p>
              <p>2. Use "Open Tracker Tab" to open the second tab for keyboard tracking</p>
              <p>3. Use the brush below the chart to zoom into specific time ranges</p>
              <p>4. Data is automatically synchronized between tabs via Service Worker</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
