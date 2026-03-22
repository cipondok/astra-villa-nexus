import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, AlertTriangle, Users, Activity, Search,
  Clock, MapPin, Monitor, Ban, Eye, TrendingUp, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface LoginActivity {
  id: string;
  email: string;
  login_success: boolean;
  login_timestamp: string;
  device_type: string;
  browser: string;
  os: string;
  risk_score: number;
  is_suspicious: boolean;
  failure_reason: string | null;
}

const RISK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-3))', 'hsl(var(--destructive))'];

const AdminSecurityIntelligence: React.FC = () => {
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('login_activity_log' as any)
        .select('*')
        .order('login_timestamp', { ascending: false })
        .limit(200);

      if (!error && data) {
        setActivities(data as unknown as LoginActivity[]);
      }
    } catch (e) {
      console.error('Failed to fetch login activity:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter(a =>
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suspiciousCount = activities.filter(a => a.is_suspicious).length;
  const failedCount = activities.filter(a => !a.login_success).length;
  const successCount = activities.filter(a => a.login_success).length;
  const uniqueUsers = new Set(activities.map(a => a.email)).size;

  // Build hourly login data for chart
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const hourActivities = activities.filter(a => {
      const h = new Date(a.login_timestamp).getHours();
      return h === hour;
    });
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      successful: hourActivities.filter(a => a.login_success).length,
      failed: hourActivities.filter(a => !a.login_success).length,
    };
  });

  const riskDistribution = [
    { name: 'Low (0-30)', value: activities.filter(a => a.risk_score <= 30).length },
    { name: 'Medium (31-60)', value: activities.filter(a => a.risk_score > 30 && a.risk_score <= 60).length },
    { name: 'High (61-100)', value: activities.filter(a => a.risk_score > 60).length },
  ];

  const deviceBreakdown = (() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => {
      const key = a.device_type || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security Intelligence Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Login activity monitoring, risk detection, and fraud prevention
          </p>
        </div>
        <Button onClick={fetchActivities} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Logins</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-chart-1">
                  {activities.length ? Math.round((successCount / activities.length) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-chart-1/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold text-chart-3">{failedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-chart-3/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Suspicious</p>
                <p className="text-2xl font-bold text-destructive">{suspiciousCount}</p>
              </div>
              <Ban className="h-8 w-8 text-destructive/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Login Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50 backdrop-blur">
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Device</th>
                      <th className="text-left p-3 font-medium">Risk</th>
                      <th className="text-left p-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No login activity found</td></tr>
                    ) : (
                      filtered.slice(0, 100).map((a) => (
                        <tr key={a.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono text-xs">{a.email}</td>
                          <td className="p-3">
                            <Badge variant={a.login_success ? 'default' : 'destructive'} className="text-xs">
                              {a.login_success ? 'Success' : 'Failed'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Monitor className="h-3 w-3" />
                              {a.device_type} · {a.browser}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                a.risk_score > 60 ? 'border-destructive text-destructive' :
                                a.risk_score > 30 ? 'border-chart-3 text-chart-3' :
                                'border-chart-1 text-chart-1'
                              }`}
                            >
                              {a.risk_score}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(a.login_timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Login Activity by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="successful" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                      {riskDistribution.map((_, i) => (
                        <Cell key={i} fill={RISK_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suspicious Tab */}
        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Suspicious Login Attempts ({suspiciousCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.filter(a => a.is_suspicious).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No suspicious activity detected. System is clean.
                </p>
              ) : (
                <div className="space-y-3">
                  {activities.filter(a => a.is_suspicious).slice(0, 20).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <div>
                        <p className="text-sm font-medium">{a.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.failure_reason || 'Multiple failed attempts'} · {a.browser} · {a.os}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">Risk: {a.risk_score}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.login_timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurityIntelligence;
