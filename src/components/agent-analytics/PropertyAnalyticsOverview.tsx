import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePropertyAnalytics } from '@/hooks/usePropertyAnalytics';
import { Eye, Heart, Phone, Share2, MousePointer, TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  dateRange?: '7d' | '30d' | '90d';
}

const PropertyAnalyticsOverview: React.FC<Props> = ({ dateRange = '30d' }) => {
  const { data, isLoading } = usePropertyAnalytics(dateRange);

  if (isLoading) {
    return (
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-8 text-center">
          <Eye className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No analytics data yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Views, saves, and contacts will appear here as your listings get traffic</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'Total Views', value: data.totalViews, icon: Eye, color: 'text-primary', bgColor: 'from-primary/20 to-primary/5 border-primary/30' },
    { label: 'Saves', value: data.totalSaves, icon: Heart, color: 'text-destructive', bgColor: 'from-destructive/20 to-destructive/5 border-destructive/30' },
    { label: 'Contacts', value: data.totalContacts, icon: Phone, color: 'text-chart-1', bgColor: 'from-chart-1/20 to-chart-1/5 border-chart-1/30' },
    { label: 'Shares', value: data.totalShares, icon: Share2, color: 'text-amber-500', bgColor: 'from-amber-500/20 to-amber-500/5 border-amber-500/30' },
    { label: 'Clicks', value: data.totalClicks, icon: MousePointer, color: 'text-chart-2', bgColor: 'from-chart-2/20 to-chart-2/5 border-chart-2/30' },
    { 
      label: 'Conversion', 
      value: `${(data.conversionRate * 100).toFixed(1)}%`, 
      icon: TrendingUp, 
      color: 'text-emerald-500',
      bgColor: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`bg-gradient-to-br ${stat.bgColor} border`}>
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Views Trend Chart */}
      {data.viewsTrend.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Views & Contacts Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.viewsTrend}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="contactsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-10" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', fontSize: 12 }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="contacts" stroke="hsl(var(--chart-1))" fill="url(#contactsGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Properties */}
      {data.topProperties.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-chart-1" />
              Top Performing Listings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              {data.topProperties.map((prop, i) => (
                <div key={prop.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <span className="flex-1 text-sm font-medium truncate">{prop.title}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{prop.views}</span>
                    <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{prop.saves}</span>
                    <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{prop.contacts}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyAnalyticsOverview;
