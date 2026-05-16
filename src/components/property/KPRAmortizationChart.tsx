import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Table } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPRAmortizationChartProps {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  monthlyPayment: number;
}

interface AmortizationRow {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

const formatCompact = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}Jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}Rb`;
  return value.toFixed(0);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs space-y-1.5">
      <p className="font-semibold text-popover-foreground">Tahun {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-popover-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
      {payload[0]?.payload?.balance != null && (
        <div className="pt-1 border-t border-border/50">
          <span className="text-muted-foreground">Sisa Pinjaman: </span>
          <span className="font-medium text-popover-foreground">
            {formatCurrency(payload[0].payload.balance)}
          </span>
        </div>
      )}
    </div>
  );
};

const KPRAmortizationChart: React.FC<KPRAmortizationChartProps> = ({
  loanAmount,
  interestRate,
  loanTermYears,
  monthlyPayment,
}) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const data = useMemo<AmortizationRow[]>(() => {
    const monthlyRate = interestRate / 100 / 12;
    let balance = loanAmount;
    const rows: AmortizationRow[] = [];

    for (let year = 1; year <= loanTermYears; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(
          monthlyPayment - interestPayment,
          balance
        );
        yearPrincipal += principalPayment;
        yearInterest += interestPayment;
        balance -= principalPayment;
      }

      rows.push({
        year,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
      });
    }
    return rows;
  }, [loanAmount, interestRate, loanTermYears, monthlyPayment]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-foreground">
          Jadwal Amortisasi
        </p>
        <div className="flex gap-1">
          <Button
            variant={view === 'chart' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setView('chart')}
          >
            <BarChart3 className="h-3.5 w-3.5 mr-1" />
            Grafik
          </Button>
          <Button
            variant={view === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setView('table')}
          >
            <Table className="h-3.5 w-3.5 mr-1" />
            Tabel
          </Button>
        </div>
      </div>

      {view === 'chart' ? (
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'Tahun',
                  position: 'insideBottomRight',
                  offset: -2,
                  fontSize: 10,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${formatCompact(v)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              />
              <Area
                type="monotone"
                dataKey="principal"
                name="Pokok"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="url(#gradPrincipal)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="interest"
                name="Bunga"
                stackId="1"
                stroke="hsl(var(--chart-3))"
                fill="url(#gradInterest)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-border/50">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr>
                <th className="text-left p-2 font-medium text-muted-foreground">Thn</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Pokok</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Bunga</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.year}
                  className={cn(
                    'border-t border-border/30',
                    row.year % 2 === 0 && 'bg-muted/20'
                  )}
                >
                  <td className="p-2 font-medium">{row.year}</td>
                  <td className="p-2 text-right text-chart-1 font-medium">
                    {formatCompact(row.principal)}
                  </td>
                  <td className="p-2 text-right text-chart-3 font-medium">
                    {formatCompact(row.interest)}
                  </td>
                  <td className="p-2 text-right">{formatCompact(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-chart-1" />
          Pokok meningkat seiring waktu
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-chart-3" />
          Bunga menurun seiring waktu
        </div>
      </div>
    </div>
  );
};

export default KPRAmortizationChart;
