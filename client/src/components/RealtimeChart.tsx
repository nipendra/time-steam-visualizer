import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Brush } from 'recharts';

interface DataPoint {
  t: number;
  s: number;
  e: number[];
}

interface RealtimeChartProps {
  data: DataPoint[];
  maxPoints?: number;
}

const CHART_COLORS = [
  'hsl(var(--chart-line-1))',
  'hsl(var(--chart-line-2))',
  'hsl(var(--chart-line-3))',
  'hsl(var(--chart-line-4))',
  'hsl(var(--chart-line-5))',
  'hsl(var(--chart-line-6))',
  'hsl(var(--chart-line-7))',
  'hsl(var(--chart-line-8))',
];

export const RealtimeChart: React.FC<RealtimeChartProps> = ({ 
  data, 
  maxPoints = 100 
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data.length === 0) return;

    const latestData = data.slice(-maxPoints);
    const formattedData = latestData.map(point => {
      const formatted: any = {
        time: new Date(point.t).toLocaleTimeString(),
        timestamp: point.t
      };
      
      point.e.forEach((value, index) => {
        formatted[`line${index + 1}`] = value;
      });
      
      return formatted;
    });

    setChartData(formattedData);
  }, [data, maxPoints]);

  return (
    <div className="w-full h-full bg-card rounded-lg border border-border p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Real-time Data Stream</h3>
        <p className="text-sm text-muted-foreground">
          {data.length} data points • 8 channels • Use brush below chart to zoom
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Brush
              dataKey="time"
              height={30}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--muted))"
            />
            
            {Array.from({ length: 8 }, (_, index) => (
              <Line
                key={`line${index + 1}`}
                type="monotone"
                dataKey={`line${index + 1}`}
                stroke={CHART_COLORS[index]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                animationDuration={0}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index] }}
            />
            <span className="text-xs text-muted-foreground">
              Line {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};