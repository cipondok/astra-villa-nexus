import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Users, Clock, TrendingUp, Activity, MousePointer } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface BehaviorAnalyticsProps {
  metrics: any;
}

interface UserBehaviorData {
  timeRange: 'day' | 'week' | 'month';
  engagementTrends: Array<{ date: string; engagement: number; users: number }>;
  intentDistribution: Array<{ intent: string; count: number; percentage: number }>;
  topBehaviorPatterns: Array<{ pattern: string; frequency: number; impact: number }>;
  userJourneyFlow: Array<{ step: string; users: number; dropoff: number }>;
  interactionHeatmap: Array<{ hour: number; day: string; interactions: number }>;
}

export function BehaviorAnalytics({ metrics }: BehaviorAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  useEffect(() => {
    loadBehaviorData();
  }, [timeRange]);

  const loadBehaviorData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-behavior-analyzer', {
        body: {
          requestType: 'detailed_analytics',
          timeRange,
          includeHeatmap: true,
          includeJourney: true
        }
      });

      if (error) throw error;
      setBehaviorData(data);
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Behavior Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into user behavior patterns and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadBehaviorData} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.behaviorAnalytics?.totalUsers?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.behaviorAnalytics?.avgEngagementScore?.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Engagement score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intent Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.behaviorAnalytics?.avgIntentScore?.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Purchase intent level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2m</div>
            <p className="text-xs text-muted-foreground">
              Average session time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
            <CardDescription>User engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={behaviorData?.engagementTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="engagement" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="users" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intent Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Intent Distribution</CardTitle>
            <CardDescription>User purchase intent levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={behaviorData?.intentDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ intent, percentage }) => `${intent}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(behaviorData?.intentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Behavior Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Behavior Patterns</CardTitle>
            <CardDescription>Most common user behavior sequences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(behaviorData?.topBehaviorPatterns || []).slice(0, 6).map((pattern, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                    selectedPattern === pattern.pattern ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPattern(
                    selectedPattern === pattern.pattern ? null : pattern.pattern
                  )}
                >
                  <div>
                    <div className="font-medium">{pattern.pattern}</div>
                    <div className="text-sm text-muted-foreground">
                      Frequency: {pattern.frequency}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {pattern.impact.toFixed(1)} impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Journey Flow */}
        <Card>
          <CardHeader>
            <CardTitle>User Journey Flow</CardTitle>
            <CardDescription>Conversion funnel and drop-off points</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behaviorData?.userJourneyFlow || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" />
                <Bar dataKey="dropoff" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Pattern Analysis */}
      {selectedPattern && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Analysis: {selectedPattern}</CardTitle>
            <CardDescription>Detailed breakdown of selected behavior pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">87%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2.3m</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">45%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interaction Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Interaction Heatmap
          </CardTitle>
          <CardDescription>User activity patterns by hour and day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-24 gap-1 p-4">
            {Array.from({ length: 7 }, (_, day) => (
              Array.from({ length: 24 }, (_, hour) => {
                const intensity = Math.random() * 100; // Simulated data
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="aspect-square rounded"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                    }}
                    title={`Day ${day + 1}, Hour ${hour}: ${intensity.toFixed(0)}% activity`}
                  />
                );
              })
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Low Activity</span>
            <span>High Activity</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}