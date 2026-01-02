import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  TestTube2, 
  Monitor, 
  Smartphone, 
  Globe, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Server,
  Chrome,
  Layers,
  Activity,
  FileText,
  BarChart3,
  Timer,
  Users,
  Database,
  Gauge,
  Target,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  duration: number;
  lastRun: Date;
  category: string;
}

interface TestSuite {
  name: string;
  passed: number;
  failed: number;
  pending: number;
  skipped: number;
  coverage: number;
  lastRun: Date;
}

const TestingDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock test data - in production this would come from actual test results
  const unitTests: TestSuite = {
    name: 'Unit Tests',
    passed: 156,
    failed: 3,
    pending: 8,
    skipped: 2,
    coverage: 78.5,
    lastRun: new Date()
  };

  const e2eTests: TestSuite = {
    name: 'E2E Tests',
    passed: 42,
    failed: 1,
    pending: 3,
    skipped: 0,
    coverage: 85.2,
    lastRun: new Date()
  };

  const crossBrowserResults = [
    { browser: 'Chrome', version: '120', passed: 46, failed: 0, status: 'passed' as const },
    { browser: 'Firefox', version: '121', passed: 45, failed: 1, status: 'warning' as const },
    { browser: 'Safari', version: '17', passed: 44, failed: 2, status: 'warning' as const },
    { browser: 'Edge', version: '120', passed: 46, failed: 0, status: 'passed' as const },
  ];

  const mobileTests = [
    { device: 'iPhone 13 Pro', os: 'iOS 17', passed: 38, failed: 0, status: 'passed' as const },
    { device: 'Pixel 5', os: 'Android 14', passed: 37, failed: 1, status: 'warning' as const },
    { device: 'iPad Pro', os: 'iPadOS 17', passed: 38, failed: 0, status: 'passed' as const },
    { device: 'Samsung S23', os: 'Android 14', passed: 36, failed: 2, status: 'warning' as const },
  ];

  const loadTestResults = {
    avgResponseTime: 245,
    maxResponseTime: 1850,
    minResponseTime: 45,
    requestsPerSecond: 1250,
    errorRate: 0.12,
    p95ResponseTime: 520,
    p99ResponseTime: 980,
    concurrentUsers: 500,
    totalRequests: 50000,
    successRate: 99.88
  };

  const testCategories = [
    { name: 'Authentication', tests: 24, passed: 24, coverage: 95 },
    { name: 'User Management', tests: 18, passed: 17, coverage: 88 },
    { name: 'Property System', tests: 32, passed: 30, coverage: 82 },
    { name: 'Payment Integration', tests: 15, passed: 14, coverage: 90 },
    { name: 'API Endpoints', tests: 45, passed: 43, coverage: 85 },
    { name: 'Search & Filters', tests: 22, passed: 22, coverage: 92 },
    { name: 'Admin Dashboard', tests: 28, passed: 27, coverage: 78 },
    { name: 'AI Features', tests: 12, passed: 11, coverage: 75 },
  ];

  const recentTestRuns: TestResult[] = [
    { id: '1', name: 'PropertySearch.test.tsx', status: 'passed', duration: 1.2, lastRun: new Date(), category: 'Unit' },
    { id: '2', name: 'AuthFlow.spec.ts', status: 'passed', duration: 8.5, lastRun: new Date(), category: 'E2E' },
    { id: '3', name: 'PaymentIntegration.test.tsx', status: 'failed', duration: 2.1, lastRun: new Date(), category: 'Integration' },
    { id: '4', name: 'UserManagement.test.tsx', status: 'passed', duration: 0.8, lastRun: new Date(), category: 'Unit' },
    { id: '5', name: 'MobileNavigation.spec.ts', status: 'pending', duration: 0, lastRun: new Date(), category: 'E2E' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-500/10 border-green-500/30';
      case 'failed': return 'text-red-600 bg-red-500/10 border-red-500/30';
      case 'pending': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
      case 'warning': return 'text-orange-600 bg-orange-500/10 border-orange-500/30';
      case 'skipped': return 'text-muted-foreground bg-muted/50 border-border';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalTests = unitTests.passed + unitTests.failed + unitTests.pending + e2eTests.passed + e2eTests.failed + e2eTests.pending;
  const totalPassed = unitTests.passed + e2eTests.passed;
  const totalFailed = unitTests.failed + e2eTests.failed;
  const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);

  const handleRunTests = (type: string) => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <TestTube2 className="h-6 w-6 text-primary" />
            </div>
            Testing Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive testing overview and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRunTests('all')}
            disabled={isRunning}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Refresh Results'}
          </Button>
          <Button 
            size="sm"
            onClick={() => handleRunTests('full')}
            disabled={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">{overallPassRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold text-blue-600">{totalTests}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coverage</p>
                <p className="text-2xl font-bold text-purple-600">78.5%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{totalFailed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="unit" className="gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden sm:inline">Unit</span>
          </TabsTrigger>
          <TabsTrigger value="e2e" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">E2E</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="load" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Load</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Test Suites Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Test Suites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[unitTests, e2eTests].map((suite, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{suite.name}</span>
                      <Badge className={getStatusColor(suite.failed > 0 ? 'warning' : 'passed')}>
                        {suite.passed}/{suite.passed + suite.failed + suite.pending} passed
                      </Badge>
                    </div>
                    <Progress value={(suite.passed / (suite.passed + suite.failed + suite.pending)) * 100} className="h-2" />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="text-green-600">✓ {suite.passed} passed</span>
                      <span className="text-red-600">✗ {suite.failed} failed</span>
                      <span className="text-yellow-600">◷ {suite.pending} pending</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cross-Browser Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Cross-Browser Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crossBrowserResults.map((browser, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Chrome className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{browser.browser}</p>
                          <p className="text-xs text-muted-foreground">v{browser.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(browser.status)}
                        <span className="text-sm">{browser.passed}/{browser.passed + browser.failed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Coverage */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Test Coverage by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {testCategories.map((category, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.coverage}%
                        </Badge>
                      </div>
                      <Progress value={category.coverage} className="h-1.5 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {category.passed}/{category.tests} tests passing
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Test Runs */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Test Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {recentTestRuns.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <p className="text-sm font-medium">{test.name}</p>
                            <p className="text-xs text-muted-foreground">{test.category} Test</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(test.status)}`}>
                            {test.status}
                          </Badge>
                          {test.duration > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">{test.duration}s</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Unit Tests Tab */}
        <TabsContent value="unit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TestTube2 className="h-5 w-5 text-primary" />
                    Unit Test Results
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleRunTests('unit')}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Unit Tests
                  </Button>
                </div>
                <CardDescription>
                  Last run: {format(unitTests.lastRun, 'PPpp')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-2xl font-bold text-green-600">{unitTests.passed}</p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-600">{unitTests.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-2xl font-bold text-yellow-600">{unitTests.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{unitTests.skipped}</p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Code Coverage</span>
                    <span className="text-sm font-bold text-primary">{unitTests.coverage}%</span>
                  </div>
                  <Progress value={unitTests.coverage} className="h-3" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Target: 70%</span>
                    <span className={unitTests.coverage >= 70 ? 'text-green-600' : 'text-red-600'}>
                      {unitTests.coverage >= 70 ? '✓ Above threshold' : '✗ Below threshold'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Watch Mode</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Coverage Report</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Parallel Execution</span>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Framework</p>
                  <Badge variant="outline">Vitest v4.0.6</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Test Library</p>
                  <Badge variant="outline">@testing-library/react</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* E2E Tests Tab */}
        <TabsContent value="e2e" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    E2E Test Results
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleRunTests('e2e')}>
                    <Play className="h-4 w-4 mr-2" />
                    Run E2E Tests
                  </Button>
                </div>
                <CardDescription>
                  End-to-end testing with Playwright
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-2xl font-bold text-green-600">{e2eTests.passed}</p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-600">{e2eTests.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-2xl font-bold text-yellow-600">{e2eTests.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{e2eTests.skipped}</p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Browser Matrix</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {crossBrowserResults.map((browser, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                        <div className="flex items-center gap-2">
                          <Chrome className="h-4 w-4" />
                          <span className="text-sm">{browser.browser}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(browser.status)}
                          <span className="text-xs">{browser.passed}/{browser.passed + browser.failed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">E2E Test Specs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {['chat-widget.spec.ts', 'accessibility.spec.ts', 'debug-panel.spec.ts', 'integration.spec.ts', 'visual-regression.spec.ts'].map((spec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{spec}</span>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mobile Tests Tab */}
        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Mobile Device Testing
                </CardTitle>
                <CardDescription>
                  Responsive and touch interaction tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mobileTests.map((device, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{device.device}</p>
                          <p className="text-xs text-muted-foreground">{device.os}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{device.passed}/{device.passed + device.failed}</p>
                          <p className="text-xs text-muted-foreground">tests passed</p>
                        </div>
                        {getStatusIcon(device.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Mobile Test Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Touch Interactions', passed: 45, total: 48 },
                    { name: 'Responsive Layout', passed: 32, total: 32 },
                    { name: 'Gestures', passed: 18, total: 20 },
                    { name: 'Viewport Scaling', passed: 12, total: 12 },
                    { name: 'PWA Features', passed: 8, total: 10 },
                  ].map((category, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.passed}/{category.total}
                        </span>
                      </div>
                      <Progress value={(category.passed / category.total) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Load Tests Tab */}
        <TabsContent value="load" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Load Test Results
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleRunTests('load')}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Load Test
                  </Button>
                </div>
                <CardDescription>
                  Performance under simulated load conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Avg Response</span>
                    </div>
                    <p className="text-2xl font-bold">{loadTestResults.avgResponseTime}ms</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Req/Second</span>
                    </div>
                    <p className="text-2xl font-bold">{loadTestResults.requestsPerSecond}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-muted-foreground">Concurrent Users</span>
                    </div>
                    <p className="text-2xl font-bold">{loadTestResults.concurrentUsers}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-muted-foreground">Success Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{loadTestResults.successRate}%</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Min Response</p>
                    <p className="font-semibold">{loadTestResults.minResponseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Response</p>
                    <p className="font-semibold">{loadTestResults.maxResponseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P95 Response</p>
                    <p className="font-semibold">{loadTestResults.p95ResponseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P99 Response</p>
                    <p className="font-semibold">{loadTestResults.p99ResponseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Load Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-lg font-bold">{loadTestResults.totalRequests.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Error Rate</p>
                  <p className="text-lg font-bold text-green-600">{loadTestResults.errorRate}%</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Test Endpoints</p>
                  <div className="space-y-1 text-xs">
                    <Badge variant="outline" className="mr-1">/api/properties</Badge>
                    <Badge variant="outline" className="mr-1">/api/users</Badge>
                    <Badge variant="outline" className="mr-1">/api/search</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;
