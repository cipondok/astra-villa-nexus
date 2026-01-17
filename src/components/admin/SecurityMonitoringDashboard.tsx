import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Users, 
  Globe, 
  Clock,
  Ban,
  Eye,
  TrendingUp,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: unknown;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  attempt_time: string;
  blocked_by_rate_limit?: boolean;
  blocked?: boolean;
  user_id?: string;
  device_fingerprint?: string;
  geolocation?: any;
  risk_score?: number;
  created_at?: string;
}

interface AccountLockout {
  id: string;
  email: string;
  locked_at: string;
  unlock_at: string;
  failed_attempts: number;
  locked_by_ip: unknown;
  is_active: boolean;
  user_id?: string;
  created_at: string;
  unlocked_by?: string;
  unlocked_at?: string;
}

interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  ip_address: unknown;
  risk_score: number;
  is_flagged: boolean;
  created_at: string;
  metadata?: any;
  location_data?: any;
  device_fingerprint?: string;
  user_agent?: string;
}

interface SecurityStats {
  totalAttempts: number;
  failedAttempts: number;
  uniqueIPs: number;
  activeLockouts: number;
  highRiskEvents: number;
  successRate: number;
}

const SecurityMonitoringDashboard = () => {
  const { toast } = useToast();
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [accountLockouts, setAccountLockouts] = useState<AccountLockout[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalAttempts: 0,
    failedAttempts: 0,
    uniqueIPs: 0,
    activeLockouts: 0,
    highRiskEvents: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchIP, setSearchIP] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeFilter]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Calculate time range
      const timeRanges = {
        '1h': new Date(Date.now() - 60 * 60 * 1000),
        '24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
        '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
      
      const timeRange = timeRanges[timeFilter as keyof typeof timeRanges];

      // Fetch login attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('*')
        .gte('attempt_time', timeRange.toISOString())
        .order('attempt_time', { ascending: false })
        .limit(100);

      if (attemptsError) throw attemptsError;

      // Fetch account lockouts
      const { data: lockouts, error: lockoutsError } = await supabase
        .from('account_lockouts')
        .select('*')
        .gte('created_at', timeRange.toISOString())
        .order('created_at', { ascending: false });

      if (lockoutsError) throw lockoutsError;

      // Fetch security logs
      const { data: logs, error: logsError } = await supabase
        .from('user_security_logs')
        .select('*')
        .gte('created_at', timeRange.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      setLoginAttempts(attempts || []);
      setAccountLockouts(lockouts || []);
      setSecurityLogs(logs || []);

      // Calculate stats
      const totalAttempts = attempts?.length || 0;
      const failedAttempts = attempts?.filter(a => !a.success).length || 0;
      const uniqueIPs = new Set(attempts?.map(a => a.ip_address)).size;
      const activeLockouts = lockouts?.filter(l => l.is_active).length || 0;
      const highRiskEvents = logs?.filter(l => l.risk_score > 70).length || 0;
      const successRate = totalAttempts > 0 ? ((totalAttempts - failedAttempts) / totalAttempts) * 100 : 0;

      setSecurityStats({
        totalAttempts,
        failedAttempts,
        uniqueIPs,
        activeLockouts,
        highRiskEvents,
        successRate
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error loading security data",
        description: "Failed to fetch security monitoring data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unlockAccount = async (lockoutId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('account_lockouts')
        .update({ 
          is_active: false, 
          unlocked_by: (await supabase.auth.getUser()).data.user?.id,
          unlocked_at: new Date().toISOString()
        })
        .eq('id', lockoutId);

      if (error) throw error;

      toast({
        title: "Account unlocked",
        description: `Account for ${email} has been unlocked.`,
      });

      fetchSecurityData();
    } catch (error) {
      console.error('Error unlocking account:', error);
      toast({
        title: "Error unlocking account",
        description: "Failed to unlock the account.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (success: boolean, blocked: boolean) => {
    if (blocked) return <Badge variant="destructive">Blocked</Badge>;
    if (success) return <Badge variant="default" className="bg-green-500">Success</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 50) return <Badge variant="outline" className="border-orange-500 text-orange-500">Medium Risk</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-500">Low Risk</Badge>;
  };

  const filteredAttempts = loginAttempts.filter(attempt => {
    const emailMatch = !searchEmail || attempt.email.toLowerCase().includes(searchEmail.toLowerCase());
    const ipMatch = !searchIP || (attempt.ip_address && String(attempt.ip_address).includes(searchIP));
    return emailMatch && ipMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive text-destructive-foreground shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Security Monitoring</h1>
              <p className="text-[10px] text-muted-foreground">Monitor login attempts, security events, and threats</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-24 h-7 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h" className="text-[10px]">Last Hour</SelectItem>
                <SelectItem value="24h" className="text-[10px]">Last 24h</SelectItem>
                <SelectItem value="7d" className="text-[10px]">Last 7 days</SelectItem>
                <SelectItem value="30d" className="text-[10px]">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchSecurityData} variant="outline" size="sm" className="h-7 text-[10px]">
              <Activity className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold">{securityStats.totalAttempts}</div>
            <div className="text-[9px] text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            </div>
            <div className="text-lg font-bold text-destructive">{securityStats.failedAttempts}</div>
            <div className="text-[9px] text-muted-foreground">Failed</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold">{securityStats.uniqueIPs}</div>
            <div className="text-[9px] text-muted-foreground">Unique IPs</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Lock className="h-3.5 w-3.5 text-secondary-foreground" />
            </div>
            <div className="text-lg font-bold text-secondary-foreground">{securityStats.activeLockouts}</div>
            <div className="text-[9px] text-muted-foreground">Lockouts</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Shield className="h-3.5 w-3.5 text-destructive" />
            </div>
            <div className="text-lg font-bold text-destructive">{securityStats.highRiskEvents}</div>
            <div className="text-[9px] text-muted-foreground">High Risk</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">{securityStats.successRate.toFixed(1)}%</div>
            <div className="text-[9px] text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg border border-border/40">
        {[
          { id: 'overview', label: 'Login Attempts', icon: Activity },
          { id: 'lockouts', label: 'Lockouts', icon: Lock },
          { id: 'security', label: 'Security Events', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Login Attempts</CardTitle>
                <CardDescription>Monitor all login attempts and identify suspicious activity</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-10 w-48"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by IP..."
                    value={searchIP}
                    onChange={(e) => setSearchIP(e.target.value)}
                    className="pl-10 w-40"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Failure Reason</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(attempt.attempt_time), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>{attempt.email}</TableCell>
                    <TableCell className="font-mono">{String(attempt.ip_address || 'N/A')}</TableCell>
                    <TableCell>
                      {getStatusBadge(attempt.success, attempt.blocked_by_rate_limit)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {attempt.failure_reason || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {attempt.user_agent}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAttempts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No login attempts found for the selected time period.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'lockouts' && (
        <Card>
          <CardHeader>
            <CardTitle>Account Lockouts</CardTitle>
            <CardDescription>Manage locked accounts and unlock when appropriate</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Locked At</TableHead>
                  <TableHead>Unlock At</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountLockouts.map((lockout) => (
                  <TableRow key={lockout.id}>
                    <TableCell>{lockout.email}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(lockout.locked_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(lockout.unlock_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>{lockout.failed_attempts}</TableCell>
                    <TableCell className="font-mono">{String(lockout.locked_by_ip || 'N/A')}</TableCell>
                    <TableCell>
                      {lockout.is_active ? (
                        <Badge variant="destructive">Locked</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-500">Unlocked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {lockout.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unlockAccount(lockout.id, lockout.email)}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Unlock
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {accountLockouts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No account lockouts found for the selected time period.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Events</CardTitle>
            <CardDescription>Monitor high-risk security events and suspicious activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.event_type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{String(log.ip_address || 'N/A')}</TableCell>
                    <TableCell>
                      {getRiskBadge(log.risk_score)}
                    </TableCell>
                    <TableCell>
                      {log.is_flagged ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {JSON.stringify(log.metadata)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {securityLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No security events found for the selected time period.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityMonitoringDashboard;