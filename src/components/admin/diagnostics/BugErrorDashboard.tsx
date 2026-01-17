import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Shield, 
  FileWarning, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useBugErrorDetection } from '@/hooks/useBugErrorDetection';
import { BugDetectionSystem } from './BugDetectionSystem';
import { SecurityFindingsPanel } from './SecurityFindingsPanel';
import { ErrorLogViewer } from './ErrorLogViewer';

export const BugErrorDashboard = () => {
  const { stats, isLoading, error, refresh } = useBugErrorDetection();

  const getTrendIcon = () => {
    switch (stats.trendDirection) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-primary" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive text-destructive-foreground shadow-sm">
              <Bug className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Bug & Error Detection</h1>
              <p className="text-[10px] text-muted-foreground">Monitor bugs, security issues, and error logs</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-7 text-[10px]"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4">Critical</Badge>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.criticalCount}</div>
            <div className="text-[9px] text-muted-foreground">Critical Issues</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Bug className="h-3.5 w-3.5 text-secondary-foreground" />
              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">High</Badge>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.highCount}</div>
            <div className="text-[9px] text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <FileWarning className="h-3.5 w-3.5 text-accent-foreground" />
              {getTrendIcon()}
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.bugCount24h}</div>
            <div className="text-[9px] text-muted-foreground">Last 24 Hours</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">Fixed</Badge>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.fixedCount}</div>
            <div className="text-[9px] text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Summary */}
      <div className="p-2 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-[10px] font-medium">
            {stats.trendDirection === 'up' && 'Errors increasing - investigate immediately'}
            {stats.trendDirection === 'down' && 'Errors decreasing - good progress!'}
            {stats.trendDirection === 'stable' && 'Error rate stable'}
          </span>
        </div>
        <Badge variant="outline" className="text-[9px]">
          {stats.bugCount24h} in 24h | {stats.bugCount7d} in 7d
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bugs" className="w-full">
        <TabsList className="h-7 p-0.5 bg-muted/20 border border-border/40 mb-2">
          <TabsTrigger value="bugs" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bug className="h-3 w-3" />
            Bugs ({stats.detectedBugs.filter(b => b.status !== 'fixed').length})
          </TabsTrigger>
          <TabsTrigger value="security" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-3 w-3" />
            Security ({stats.securityFindings.filter(f => !f.ignore).length})
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileWarning className="h-3 w-3" />
            Error Logs ({stats.errorLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bugs" className="mt-0">
          <BugDetectionSystem
            bugs={stats.detectedBugs}
            trendDirection={stats.trendDirection}
            bugCount24h={stats.bugCount24h}
            bugCount7d={stats.bugCount7d}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SecurityFindingsPanel
            findings={stats.securityFindings}
            onRefresh={refresh}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="errors" className="mt-0">
          <ErrorLogViewer
            logs={stats.errorLogs}
            onRefresh={refresh}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
