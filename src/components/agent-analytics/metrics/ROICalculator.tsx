import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calculator, PiggyBank, Receipt, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart, Line, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { ROIData } from '@/hooks/useAgentAnalytics';

interface ROICalculatorProps {
  data: ROIData;
  className?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
  return `Rp ${value.toLocaleString()}`;
};

const ROICalculator: React.FC<ROICalculatorProps> = ({ data, className }) => {
  const profitMargin = ((data.netProfit / data.totalRevenue) * 100).toFixed(1);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="h-4 w-4 text-destructive" />
            <span className="text-[10px] text-muted-foreground">Total Investment</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(data.totalInvestment)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-[10px] text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(data.totalRevenue)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank className="h-4 w-4 text-primary" />
            <span className="text-[10px] text-muted-foreground">Net Profit</span>
          </div>
          <p className="text-lg font-bold text-green-500">{formatCurrency(data.netProfit)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-[10px] text-muted-foreground">ROI</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-primary">{data.roi.toFixed(1)}%</p>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Revenue vs Cost Chart */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Revenue vs Costs by Month</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.revenueByMonth}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                fill="url(#revenueGradient)" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
              <Bar dataKey="cost" name="Costs" fill="hsl(var(--destructive))" opacity={0.7} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h4>
          <div className="flex items-center gap-4">
            <div className="h-[120px] w-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {data.costBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {data.costBreakdown.map((item, idx) => (
                <div key={item.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                    <span className="text-muted-foreground">{item.category}</span>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profitability Summary */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Profitability Analysis</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Profit Margin</span>
                <span className="text-sm font-bold text-green-500">{profitMargin}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profitMargin}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Cost Efficiency</span>
                <span className="text-sm font-bold text-primary">{(100 - (data.totalInvestment / data.totalRevenue * 100)).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - (data.totalInvestment / data.totalRevenue * 100)}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Return per Rp invested</span>
                <span className="text-sm font-bold text-foreground">
                  Rp {(data.totalRevenue / data.totalInvestment).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
