import React, { useEffect, useState, useCallback } from 'react';
import { KeyboardTracker } from '@/components/KeyboardTracker';
import { WordDisplay } from '@/components/WordDisplay';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DataPoint {
  t: number;
  s: number;
  e: number[];
}

interface KeyboardEvent {
  timestamp: number;
  key: 'left' | 'right';
  dataPointId?: number;
}

const SecondTab = () => {
  const [currentDataPoint, setCurrentDataPoint] = useState<DataPoint | null>(null);
  const [keyboardEvents, setKeyboardEvents] = useState<KeyboardEvent[]>([]);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  // Initialize service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered on second tab:', registration);
          setServiceWorkerReady(true);
          
          // Register this tab with the service worker
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'REGISTER_TAB'
            });
          }
        })
        .catch((error) => {
          console.error('SW registration failed on second tab:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data: messageData } = event.data;
        console.log('Second tab received message:', type, messageData);
        
        switch (type) {
          case 'DATA_UPDATE':
            setCurrentDataPoint(messageData);
            break;
          case 'KEYBOARD_EVENT':
            setKeyboardEvents(prev => [...prev, messageData]);
            break;
        }
      });
    }
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    setKeyboardEvents(prev => [...prev, event]);
    
    // Send to service worker for cross-tab communication
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'KEYBOARD_EVENT',
        data: event
      });
    }
  }, []);

  const openMainTab = () => {
    const newTab = window.open('/', '_blank');
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
                Keyboard Event Tracker
              </h1>
              <p className="text-muted-foreground">
                Word display and keyboard event capture interface
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={serviceWorkerReady ? "default" : "secondary"}>
                SW: {serviceWorkerReady ? 'Connected' : 'Loading'}
              </Badge>
              <Button onClick={openMainTab} variant="outline">
                Open Main Tab
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Word Display */}
          <div className="space-y-4">
            <WordDisplay currentDataPoint={currentDataPoint} />
          </div>

          {/* Keyboard Tracker */}
          <div className="space-y-4">
            <KeyboardTracker 
              currentDataPoint={currentDataPoint}
              onKeyPress={handleKeyPress}
            />

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Service Worker</span>
                  <Badge variant={serviceWorkerReady ? "default" : "secondary"}>
                    {serviceWorkerReady ? 'Active' : 'Loading'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data Sync</span>
                  <Badge variant={currentDataPoint ? "default" : "secondary"}>
                    {currentDataPoint ? 'Synced' : 'Waiting'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Keyboard Events</span>
                  <span className="text-sm font-mono">{keyboardEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Current ID</span>
                  <span className="text-sm font-mono">
                    {currentDataPoint?.s || 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. This tab will automatically sync with the main tab</p>
                <p>2. Start keyboard tracking to capture events</p>
                <p>3. Use ← → arrows to capture keyboard events</p>
                <p>4. Download keyboard data as JSON when complete</p>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondTab;