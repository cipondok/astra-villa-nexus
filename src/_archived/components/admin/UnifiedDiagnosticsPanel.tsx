import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  Bug, 
  Code, 
  Database, 
  Shield, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { CodeHealthChecker } from './diagnostics/CodeHealthChecker';
import { FunctionHealthChecker } from './diagnostics/FunctionHealthChecker';
import { BugDetectionSystem } from './diagnostics/BugDetectionSystem';
import { DatabaseHealthChecker } from './diagnostics/DatabaseHealthChecker';
import RealTimeSystemHealth from './RealTimeSystemHealth';
import SupabaseDiagnosticsPanel from './SupabaseDiagnosticsPanel';
import EnhancedAlertManagement from './EnhancedAlertManagement';

// Mock data generators
const generateCodeIssues = () => [
  {
    id: '1',
    type: 'error' as const,
    severity: 'critical' as const,
    file: 'src/components/admin/SystemMonitor.tsx',
    line: 45,
    message: 'Potential memory leak in useEffect hook',
    category: 'Performance',
    suggestion: 'Add cleanup function to prevent memory leaks'
  },
  {
    id: '2',
    type: 'warning' as const,
    severity: 'high' as const,
    file: 'src/hooks/useRealTimeMetrics.ts',
    line: 23,
    message: 'Missing error boundary',
    category: 'Error Handling',
    suggestion: 'Wrap component with error boundary'
  },
  {
    id: '3',
    type: 'warning' as const,
    severity: 'medium' as const,
    file: 'src/components/ui/Card.tsx',
    line: 12,
    message: 'Unused CSS classes detected',
    category: 'Code Quality'
  }
];

const generateFunctionStatus = () => [
  {
    id: '1',
    name: 'handleUserAuthentication',
    module: 'AuthContext',
    status: 'complete' as const,
    completionPercentage: 100,
    issues: [],
    dependencies: ['supabase', 'react-query'],
    lastChecked: new Date().toISOString()
  },
  {
    id: '2',
    name: 'processPaymentTransaction',
    module: 'PaymentService',
    status: 'incomplete' as const,
    completionPercentage: 75,
    issues: ['Missing error handling for network failures', 'Incomplete validation logic'],
    dependencies: ['stripe', 'supabase'],
    lastChecked: new Date().toISOString(),
    estimatedFixTime: '2-3 hours'
  },
  {
    id: '3',
    name: 'generateAnalyticsReport',
    module: 'AnalyticsEngine',
    status: 'broken' as const,
    completionPercentage: 45,
    issues: ['Database query timeout', 'Memory leak in loop'],
    dependencies: ['recharts', 'date-fns'],
    lastChecked: new Date().toISOString(),
    estimatedFixTime: '4-6 hours'
  }
];

const generateBugs = () => [
  {
    id: '1',
    type: 'runtime' as const,
    severity: 'critical' as const,
    title: 'Null Reference Exception in Property Listing',
    description: 'Attempting to access property of undefined in property card component',
    location: 'src/components/properties/PropertyCard.tsx:67',
    impact: 'Users cannot view property listings',
    occurrences: 47,
    firstSeen: '2025-10-01T10:23:45Z',
    lastSeen: '2025-10-03T19:10:30Z',
    status: 'open' as const,
    stackTrace: 'TypeError: Cannot read property "images" of undefined\n  at PropertyCard.tsx:67:23\n  at Array.map\n  at PropertyList.tsx:45:12'
  },
  {
    id: '2',
    type: 'security' as const,
    severity: 'high' as const,
    title: 'Potential XSS Vulnerability in User Input',
    description: 'User input not properly sanitized before rendering',
    location: 'src/components/forms/ContactForm.tsx:34',
    impact: 'Risk of cross-site scripting attacks',
    occurrences: 12,
    firstSeen: '2025-10-02T14:15:20Z',
    lastSeen: '2025-10-03T18:45:10Z',
    status: 'investigating' as const
  }
];

const generateDatabaseChecks = () => [
  {
    name: 'Connection Pool Health',
    status: 'healthy' as const,
    responseTime: 45,
    message: 'All connection pools are operating normally',
    lastChecked: new Date().toISOString()
  },
  {
    name: 'Query Performance',
    status: 'warning' as const,
    responseTime: 890,
    message: 'Some queries are taking longer than expected',
    lastChecked: new Date().toISOString()
  },
  {
    name: 'RLS Policy Verification',
    status: 'healthy' as const,
    responseTime: 23,
    message: 'All RLS policies are properly configured',
    lastChecked: new Date().toISOString()
  },
  {
    name: 'Backup Status',
    status: 'healthy' as const,
    responseTime: 12,
    message: 'Last backup completed successfully 2 hours ago',
    lastChecked: new Date().toISOString()
  }
];

const UnifiedDiagnosticsPanel = () => {
  const codeIssues = generateCodeIssues();
  const functionStatus = generateFunctionStatus();
  const bugs = generateBugs();
  const databaseChecks = generateDatabaseChecks();

  return (
    <div className="space-y-3">
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs text-foreground">
            <Activity className="h-3.5 w-3.5" />
            Complete System Diagnostics & Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <Tabs defaultValue="overview" className="space-y-3">
            <TabsList className="inline-flex h-7 w-auto gap-0.5 bg-muted/40 p-0.5 rounded-md border border-border/30 flex-wrap">
              <TabsTrigger value="overview" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="code" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <Code className="h-3 w-3" />
                Code
              </TabsTrigger>
              <TabsTrigger value="functions" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Functions
              </TabsTrigger>
              <TabsTrigger value="bugs" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <Bug className="h-3 w-3" />
                Bugs
              </TabsTrigger>
              <TabsTrigger value="database" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <Database className="h-3 w-3" />
                Database
              </TabsTrigger>
              <TabsTrigger value="security" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Security
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-[10px] h-6 px-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <RealTimeSystemHealth />
            </TabsContent>

            <TabsContent value="code" className="space-y-3">
              <CodeHealthChecker 
                issues={codeIssues}
                healthScore={82}
              />
            </TabsContent>

            <TabsContent value="functions" className="space-y-3">
              <FunctionHealthChecker functions={functionStatus} />
            </TabsContent>

            <TabsContent value="bugs" className="space-y-3">
              <BugDetectionSystem 
                bugs={bugs}
                trendDirection="down"
                bugCount24h={5}
                bugCount7d={23}
              />
            </TabsContent>

            <TabsContent value="database" className="space-y-3">
              <DatabaseHealthChecker 
                checks={databaseChecks}
                connectionStatus="connected"
                queryPerformance={156}
                activeConnections={12}
                totalTables={45}
                rlsEnabled={42}
              />
              <SupabaseDiagnosticsPanel />
            </TabsContent>

            <TabsContent value="security" className="space-y-3">
              <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="flex items-center gap-2 text-xs text-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    Security Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0">
                  <div className="text-center py-6 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Security monitoring and vulnerability scanning</p>
                    <p className="text-[10px] mt-1">Coming soon with advanced threat detection</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-3">
              <EnhancedAlertManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedDiagnosticsPanel;
