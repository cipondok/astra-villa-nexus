import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
}

const Sparkline = React.memo(function Sparkline({ data, color = 'hsl(var(--primary))' }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 40;
  const h = 14;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block ml-1.5">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export default Sparkline;
