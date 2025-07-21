import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface DataPoint {
  t: number;
  s: number;
  e: number[];
}

interface WordDisplayProps {
  currentDataPoint?: DataPoint;
}

const SAMPLE_WORDS = [
  'FOCUS', 'REACT', 'STREAM', 'DATA', 'SIGNAL', 'PULSE', 'WAVE', 'FLOW',
  'SYNC', 'LINK', 'NODE', 'PEAK', 'TREND', 'SPIKE', 'BURST', 'CYCLE'
];

export const WordDisplay: React.FC<WordDisplayProps> = ({ currentDataPoint }) => {
  const [currentWord, setCurrentWord] = useState<string>('');
  const [wordHistory, setWordHistory] = useState<Array<{ word: string; timestamp: number; id: number }>>([]);

  useEffect(() => {
    if (!currentDataPoint) return;

    // Generate word based on data point characteristics
    const maxValue = Math.max(...currentDataPoint.e);
    const wordIndex = Math.floor((maxValue / 500) * SAMPLE_WORDS.length) % SAMPLE_WORDS.length;
    const word = SAMPLE_WORDS[wordIndex] || 'UNKNOWN';
    
    setCurrentWord(word);
    setWordHistory(prev => [
      ...prev.slice(-4), // Keep last 4 words
      { word, timestamp: currentDataPoint.t, id: currentDataPoint.s }
    ]);
  }, [currentDataPoint]);

  return (
    <Card className="p-6 text-center">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-muted-foreground">Word Display</h3>
        
        <div className="min-h-20 flex items-center justify-center">
          {currentWord ? (
            <div className="text-4xl font-bold text-primary animate-pulse">
              {currentWord}
            </div>
          ) : (
            <div className="text-2xl text-muted-foreground">
              Waiting for data...
            </div>
          )}
        </div>

        {currentDataPoint && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Timestamp: {new Date(currentDataPoint.t).toLocaleTimeString()}</p>
            <p>Data ID: {currentDataPoint.s}</p>
          </div>
        )}

        {wordHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recent Words</h4>
            <div className="space-y-1">
              {wordHistory.map((item, index) => (
                <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                  {item.word} - {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};