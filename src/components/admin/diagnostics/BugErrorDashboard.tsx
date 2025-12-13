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
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return <Activity className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="h-4 w-4" />
              Bug & Error Detection Center
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-7 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <Badge className="bg-red-500/10 text-red-500 text-[10px]">
                  Critical
                </Badge>
              </div>
              <div className="text-xl font-bold text-red-500 mt-1">{stats.criticalCount}</div>
              <div className="text-[10px] text-muted-foreground">Critical Issues</div>
            </div>
            
            <div className="p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-center justify-between">
                <Bug className="h-4 w-4 text-orange-500" />
                <Badge className="bg-orange-500/10 text-orange-500 text-[10px]">
                  High
                </Badge>
              </div>
              <div className="text-xl font-bold text-orange-500 mt-1">{stats.highCount}</div>
              <div className="text-[10px] text-muted-foreground">High Priority</div>
            </div>
            
            <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <FileWarning className="h-4 w-4 text-blue-500" />
                {getTrendIcon()}
              </div>
              <div className="text-xl font-bold text-blue-500 mt-1">{stats.bugCount24h}</div>
              <div className="text-[10px] text-muted-foreground">Last 24 Hours</div>
            </div>
            
            <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center justify-between">
                <Shield className="h-4 w-4 text-green-500" />
                <Badge className="bg-green-500/10 text-green-500 text-[10px]">
                  Fixed
                </Badge>
              </div>
              <div className="text-xl font-bold text-green-500 mt-1">{stats.fixedCount}</div>
              <div className="text-[10px] text-muted-foreground">Resolved</div>
            </div>
          </div>

          {/* Trend Summary */}
          <div className="mt-3 p-2 rounded-lg border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {stats.trendDirection === 'up' && 'Errors increasing - investigate immediately'}
                {stats.trendDirection === 'down' && 'Errors decreasing - good progress!'}
                {stats.trendDirection === 'stable' && 'Error rate stable'}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {stats.bugCount24h} in 24h | {stats.bugCount7d} in 7d
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="bugs" className="w-full">
        <TabsList className="h-8 p-0.5 mb-3">
          <TabsTrigger value="bugs" className="text-xs h-7 px-3 gap-1">
            <Bug className="h-3 w-3" />
            Bugs ({stats.detectedBugs.filter(b => b.status !== 'fixed').length})
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs h-7 px-3 gap-1">
            <Shield className="h-3 w-3" />
            Security ({stats.securityFindings.filter(f => !f.ignore).length})
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-xs h-7 px-3 gap-1">
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
