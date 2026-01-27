import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserCheck, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { LeadStats } from '@/hooks/useAgentAnalytics';

interface LeadGenerationStatsProps {
  data: LeadStats;
  className?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

const LeadGenerationStats: React.FC<LeadGenerationStatsProps> = ({ data, className }) => {
  const conversionRate = ((data.convertedLeads / data.totalLeads) * 100).toFixed(1);
  const qualificationRate = ((data.qualifiedLeads / data.totalLeads) * 100).toFixed(1);

  const stats = [
    { 
      label: 'Total Leads', 
      value: data.totalLeads, 
      icon: Users, 
      change: +12.5,
      color: 'text-primary' 
    },
    { 
      label: 'New This Week', 
      value: data.newLeads, 
      icon: UserPlus, 
      change: +8.3,
      color: 'text-accent' 
    },
    { 
      label: 'Qualified', 
      value: data.qualifiedLeads, 
      icon: UserCheck, 
      change: +15.2,
      color: 'text-green-500' 
    },
    { 
      label: 'Converted', 
      value: data.convertedLeads, 
      icon: Target, 
      change: +5.7,
      color: 'text-orange-500' 
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              <span className={cn(
                "flex items-center text-[10px] font-medium",
                stat.change >= 0 ? "text-green-500" : "text-destructive"
              )}>
                {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">{stat.value.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Leads Trend Chart */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">Lead Trend (30 Days)</h4>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.leadsTrend.slice(-14)}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9 }} 
                  tickFormatter={(val) => new Date(val).getDate().toString()}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#leadGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Lead Sources</h4>
          <div className="flex items-center gap-4">
            <div className="h-[140px] w-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.leadsBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {data.leadsBySource.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {data.leadsBySource.map((source, idx) => (
                <div key={source.source} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                    <span className="text-muted-foreground">{source.source}</span>
                  </div>
                  <span className="font-medium text-foreground">{source.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Conversion Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Qualification Rate</span>
              <span className="text-sm font-bold text-foreground">{qualificationRate}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${qualificationRate}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Conversion Rate</span>
              <span className="text-sm font-bold text-foreground">{conversionRate}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${parseFloat(conversionRate) * 5}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadGenerationStats;
