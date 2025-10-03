import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';

interface ProgressAnalyticsProps {
  vendorId: string;
  vendorName: string;
}

const ProgressAnalyticsDashboard: React.FC<ProgressAnalyticsProps> = ({ vendorId, vendorName }) => {
  // Mock data for progress trends over time
  const progressTrendData = [
    { month: 'Jan', progress: 15, tasks: 2, rating: 3.5 },
    { month: 'Feb', progress: 25, tasks: 4, rating: 3.8 },
    { month: 'Mar', progress: 40, tasks: 6, rating: 4.0 },
    { month: 'Apr', progress: 55, tasks: 8, rating: 4.2 },
    { month: 'May', progress: 70, tasks: 10, rating: 4.5 },
    { month: 'Jun', progress: 85, tasks: 12, rating: 4.7 },
  ];

  // Task completion rate data
  const completionRateData = [
    { week: 'Week 1', completed: 2, pending: 1 },
    { week: 'Week 2', completed: 3, pending: 2 },
    { week: 'Week 3', completed: 4, pending: 1 },
    { week: 'Week 4', completed: 5, pending: 0 },
  ];

  // Performance metrics
  const performanceMetrics = [
    { metric: 'Tasks/Week', value: 3.5, trend: 'up', change: '+12%' },
    { metric: 'Avg Completion Time', value: 2.3, unit: 'days', trend: 'down', change: '-8%' },
    { metric: 'Success Rate', value: 92, unit: '%', trend: 'up', change: '+5%' },
    { metric: 'Rating Growth', value: 4.5, trend: 'up', change: '+0.3' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Progress Analytics</h3>
          <p className="text-sm text-muted-foreground">Vendor: {vendorName}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Last 6 months</span>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.metric}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Progress Trend Over Time
          </CardTitle>
          <CardDescription>
            Track progress percentage, completed tasks, and rating improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progressTrendData}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorProgress)"
                name="Progress (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dual Metrics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
            <CardDescription>Weekly completed vs pending tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={completionRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                <Bar dataKey="pending" fill="hsl(var(--muted))" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Improvement */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Improvement</CardTitle>
            <CardDescription>Service quality rating over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                  name="Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Strong Progress: </span>
              85% completion rate shows excellent momentum toward next level
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Improving Quality: </span>
              Rating increased by 0.3 points in the last month
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Productivity Peak: </span>
              Task completion rate increased by 12% this month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressAnalyticsDashboard;
