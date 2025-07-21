import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface KeyboardEvent {
  timestamp: number;
  key: 'left' | 'right';
  dataPointId?: number;
}

interface KeyboardTrackerProps {
  currentDataPoint?: { t: number; s: number };
  onKeyPress: (event: KeyboardEvent) => void;
}

export const KeyboardTracker: React.FC<KeyboardTrackerProps> = ({ 
  currentDataPoint, 
  onKeyPress 
}) => {
  const [events, setEvents] = useState<KeyboardEvent[]>([]);
  const [isActive, setIsActive] = useState(false);

  const handleKeyPress = useCallback((event: globalThis.KeyboardEvent) => {
    if (!isActive) return;
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      
      const keyEvent: KeyboardEvent = {
        timestamp: Date.now(),
        key: event.key === 'ArrowLeft' ? 'left' : 'right',
        dataPointId: currentDataPoint?.s
      };
      
      console.log('Key pressed:', keyEvent);
      setEvents(prev => [...prev, keyEvent]);
      onKeyPress(keyEvent);
    }
  }, [isActive, currentDataPoint, onKeyPress]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      handleKeyPress(event);
    };

    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyPress, isActive]);

  const downloadEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyboard-events-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Keyboard Tracker</h3>
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Press ← or → arrows when tracking is active
          </p>
          <p className="text-sm">
            Events captured: <span className="font-mono">{events.length}</span>
          </p>
          {currentDataPoint && (
            <p className="text-sm">
              Current data point: <span className="font-mono">{currentDataPoint.s}</span>
            </p>
          )}
        </div>

        {events.length > 0 && (
          <>
            <Button onClick={downloadEvents} variant="outline" size="sm">
              Download Events JSON
            </Button>
            
            <div className="max-h-32 overflow-y-auto space-y-1">
              {events.slice(-5).map((event, index) => (
                <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                  {new Date(event.timestamp).toLocaleTimeString()} - 
                  {event.key.toUpperCase()} 
                  {event.dataPointId && ` (ID: ${event.dataPointId})`}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};