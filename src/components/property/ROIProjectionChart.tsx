import React from "react";
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

interface ProjectionPoint {
  year: number;
  property_value: number;
  cumulative_rent: number;
  equity_position: number;
}

interface ROIProjectionChartProps {
  projection: ProjectionPoint[];
  chartMode: "all" | "value" | "equity" | "rent";
}

const ROIProjectionChart: React.FC<ROIProjectionChartProps> = ({ projection, chartMode }) => (
  <div className="rounded-lg bg-card border border-border/50 p-3 pt-4" style={{ background: 'hsl(var(--card) / 0.8)' }}>
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={projection} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v) => `Yr ${v}`}
          axisLine={{ stroke: 'hsl(var(--border) / 0.3)' }}
        />
        <YAxis
          tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '11px',
            boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
          }}
          labelFormatter={(v) => `Year ${v}`}
          formatter={(value: number, name: string) => [
            `Rp ${value.toLocaleString('id-ID')}`,
            name === 'property_value' ? 'Property Value'
              : name === 'cumulative_rent' ? 'Cumulative Rent'
              : 'Equity Position'
          ]}
        />
        {(chartMode === 'all' || chartMode === 'value') && (
          <Line type="monotone" dataKey="property_value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} animationDuration={800} animationEasing="ease-out" />
        )}
        {(chartMode === 'all' || chartMode === 'rent') && (
          <Line type="monotone" dataKey="cumulative_rent" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(142, 71%, 45%)' }} animationDuration={800} animationEasing="ease-out" />
        )}
        {(chartMode === 'all' || chartMode === 'equity') && (
          <Line type="monotone" dataKey="equity_position" stroke="hsl(45, 93%, 47%)" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: 'hsl(45, 93%, 47%)' }} animationDuration={800} animationEasing="ease-out" />
        )}
      </LineChart>
    </ResponsiveContainer>
    {/* Legend */}
    <div className="flex items-center justify-center gap-4 mt-2">
      {(chartMode === 'all' || chartMode === 'value') && (
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-primary" />
          <span className="text-[9px] text-muted-foreground">Value</span>
        </div>
      )}
      {(chartMode === 'all' || chartMode === 'rent') && (
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
          <span className="text-[9px] text-muted-foreground">Rent</span>
        </div>
      )}
      {(chartMode === 'all' || chartMode === 'equity') && (
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'hsl(45, 93%, 47%)' }} />
          <span className="text-[9px] text-muted-foreground">Equity</span>
        </div>
      )}
    </div>
  </div>
);

export default ROIProjectionChart;
