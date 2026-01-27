import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageSquare, Heart, TrendingUp, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { ListingPerformance as ListingPerformanceType } from '@/hooks/useAgentAnalytics';
import { Button } from '@/components/ui/button';

interface ListingPerformanceProps {
  data: ListingPerformanceType;
  className?: string;
}

const ListingPerformance: React.FC<ListingPerformanceProps> = ({ data, className }) => {
  const stats = [
    { label: 'Total Views', value: data.totalViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Inquiries', value: data.totalInquiries, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Saves', value: data.totalSaves, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Avg Views/Listing', value: data.avgViewsPerListing, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const inquiryRate = ((data.totalInquiries / data.totalViews) * 100).toFixed(2);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="text-lg font-bold text-foreground">{stat.value.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Views & Inquiries Trend</h4>
          <span className="text-xs text-muted-foreground">
            Inquiry Rate: <span className="font-semibold text-primary">{inquiryRate}%</span>
          </span>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.viewsTrend.slice(-14)}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9 }} 
                tickFormatter={(val) => new Date(val).getDate().toString()}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                name="Views"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="inquiries" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={false}
                name="Inquiries"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Listings */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Top Performing Listings</h4>
        <div className="space-y-2">
          {data.topListings.map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                  idx === 0 ? "bg-yellow-500/20 text-yellow-600" :
                  idx === 1 ? "bg-gray-300/20 text-gray-500" :
                  idx === 2 ? "bg-orange-500/20 text-orange-600" :
                  "bg-muted text-muted-foreground"
                )}>
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs font-medium text-foreground">{listing.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {listing.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {listing.inquiries}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingPerformance;
