import React, { useRef, useEffect } from "react";
import SectionErrorBoundary from "../shared/SectionErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, MousePointer, Wifi, FileText, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SummaryCard from "./SummaryCard";
import type { ActivityLogEntry } from "@/hooks/useAdminOverviewData";

interface CenterActivityColumnProps {
  hourlyTraffic: { hour: string; count: number }[] | undefined;
  maxTraffic: number;
  trafficAgo: string | null;
  recentActivity: ActivityLogEntry[] | undefined;
  activityAgo: string | null;
  platformStats: {
    activeSessions: number;
    totalOrders: number;
  } | undefined;
  systemHealth: {
    responseTime: number;
    uptime: number;
  } | undefined;
  onQuickAction: (section: string) => void;
}

const CenterActivityColumn = React.memo(function CenterActivityColumn({
  hourlyTraffic, maxTraffic, trafficAgo,
  recentActivity, activityAgo,
  platformStats, systemHealth,
  onQuickAction,
}: CenterActivityColumnProps) {
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      const timer = setTimeout(() => { isFirstRender.current = false; }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="col-span-12 md:col-span-6 space-y-3">
      <SectionErrorBoundary sectionName="Traffic & Activity">
        {/* Live Traffic Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                <TrendingUp className="h-4 w-4 text-primary" /> Traffic (12h)
              </CardTitle>
              <div className="flex items-center gap-2">
                {trafficAgo && <span className="text-[10px] text-muted-foreground">↻ {trafficAgo}</span>}
                <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-chart-1/10 text-chart-1 border-chart-1/30">● Live</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={hourlyTraffic || []} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 500 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'hsl(var(--popover-foreground))',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
                  }}
                  formatter={(value: number) => [`${value} activities`, 'Count']}
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                  {(hourlyTraffic || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count === maxTraffic ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.35)'}
                      stroke={entry.count === maxTraffic ? 'hsl(var(--primary))' : 'transparent'}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border-border bg-card">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                <MousePointer className="h-4 w-4 text-chart-2" /> Live Activity
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{activityAgo ? `↻ ${activityAgo}` : 'Auto-refresh 60s'}</span>
                <button
                  onClick={() => onQuickAction('admin-activity-log')}
                  className="text-[10px] text-primary hover:underline font-medium flex items-center gap-0.5"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ScrollArea className="h-[180px]">
              <div className="space-y-1.5 pr-2">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={isFirstRender.current ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={isFirstRender.current ? { delay: idx * 0.05 } : { duration: 0 }}
                      onClick={() => onQuickAction('admin-activity-log')}
                      role="button"
                      tabIndex={0}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card hover:bg-muted/30 hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">{activity.activity_type}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{activity.activity_description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2">
          <SummaryCard label="Live Users" value={platformStats?.activeSessions || 0} icon={Wifi} color="green" />
          <SummaryCard label="Orders" value={platformStats?.totalOrders || 0} icon={FileText} color="blue" />
          <SummaryCard label="Response" value={`${systemHealth?.responseTime || 0}ms`} icon={Clock} color="purple" />
          <SummaryCard label="Uptime" value={`${systemHealth?.uptime || 99.9}%`} icon={CheckCircle} color="green" />
        </div>
      </SectionErrorBoundary>
    </div>
  );
});

export default CenterActivityColumn;
