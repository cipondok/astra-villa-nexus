import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingDown, Home, Building2, Palmtree, Store, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { TimeToSellData } from '@/hooks/useAgentAnalytics';

interface TimeToSellTrendsProps {
  data: TimeToSellData;
  className?: string;
}

const propertyIcons: Record<string, React.ElementType> = {
  Villa: Palmtree,
  Apartment: Building2,
  House: Home,
  Land: MapPin,
  Commercial: Store,
};

const TimeToSellTrends: React.FC<TimeToSellTrendsProps> = ({ data, className }) => {
  const sortedByType = [...data.byPropertyType].sort((a, b) => a.avgDays - b.avgDays);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.avgDaysToSell}</p>
          <p className="text-xs text-muted-foreground">Avg. Days to Sell</p>
          <div className="flex items-center gap-1 text-[10px] text-green-500 mt-1">
            <TrendingDown className="h-3 w-3" />
            5 days faster than last month
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.avgDaysToRent}</p>
          <p className="text-xs text-muted-foreground">Avg. Days to Rent</p>
          <div className="flex items-center gap-1 text-[10px] text-green-500 mt-1">
            <TrendingDown className="h-3 w-3" />
            2 days faster than last month
          </div>
        </motion.div>
      </div>

      {/* Trend Chart */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Time-to-Close Trend</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend}>
              <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                formatter={(value: number) => [`${value} days`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="daysToSell" 
                name="Days to Sell" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="daysToRent" 
                name="Days to Rent" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By Property Type */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Average Days by Property Type</h4>
        <div className="space-y-3">
          {sortedByType.map((item, idx) => {
            const Icon = propertyIcons[item.type] || Building2;
            const maxDays = Math.max(...sortedByType.map(i => i.avgDays));
            const percentage = (item.avgDays / maxDays) * 100;
            
            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center",
                      idx === 0 ? "bg-green-500/10" : 
                      idx === sortedByType.length - 1 ? "bg-destructive/10" : 
                      "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-3 w-3",
                        idx === 0 ? "text-green-500" : 
                        idx === sortedByType.length - 1 ? "text-destructive" : 
                        "text-muted-foreground"
                      )} />
                    </div>
                    <span className="text-xs text-foreground">{item.type}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{item.avgDays} days</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className={cn(
                      "h-full rounded-full",
                      idx === 0 ? "bg-gradient-to-r from-green-500 to-green-400" :
                      idx === sortedByType.length - 1 ? "bg-gradient-to-r from-destructive to-destructive/70" :
                      "bg-gradient-to-r from-primary to-primary/70"
                    )}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Performance Benchmark */}
      <div className="bg-gradient-to-r from-green-500/10 via-background to-primary/10 border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Performance vs Market</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Avg (Sale)</p>
            <p className="text-xl font-bold text-green-500">{data.avgDaysToSell} days</p>
            <p className="text-[10px] text-green-600">15% faster than market</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Avg (Rent)</p>
            <p className="text-xl font-bold text-primary">{data.avgDaysToRent} days</p>
            <p className="text-[10px] text-primary">22% faster than market</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeToSellTrends;
