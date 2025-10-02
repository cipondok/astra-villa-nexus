import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Zap,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Loader2
} from 'lucide-react';

interface TestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
  timestamp: string;
  duration: number;
}

const LoadTestingPanel = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  
  const [config, setConfig] = useState({
    testType: 'database' as 'database' | 'api' | 'page',
    targetUrl: '',
    requests: 100,
    concurrency: 10,
  });

  // Fetch historical test results
  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ['load-test-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('load_test_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  const runLoadTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('load-test', {
        body: { config }
      });

      if (error) throw error;

      if (data.success) {
        setTestResult(data.result);
        refetchHistory();
        toast({
          title: "Load Test Completed",
          description: `Completed ${data.result.totalRequests} requests in ${data.result.duration}s`,
        });
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error) {
      console.error('Load test error:', error);
      toast({
        title: "Load Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getPerformanceStatus = (avgResponseTime: number) => {
    if (avgResponseTime < 100) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (avgResponseTime < 300) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (avgResponseTime < 500) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'Poor', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Load Testing & Performance</CardTitle>
              <CardDescription>
                Test system performance and identify bottlenecks
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="config" className="w-full">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure your load test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select
                  value={config.testType}
                  onValueChange={(value: any) => setConfig({ ...config, testType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database Query Test</SelectItem>
                    <SelectItem value="api">API Endpoint Test</SelectItem>
                    <SelectItem value="page">Page Load Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(config.testType === 'api' || config.testType === 'page') && (
                <div className="space-y-2">
                  <Label>Target URL</Label>
                  <Input
                    placeholder="https://example.com/api/endpoint"
                    value={config.targetUrl}
                    onChange={(e) => setConfig({ ...config, targetUrl: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Requests</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={config.requests}
                    onChange={(e) => setConfig({ ...config, requests: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Concurrency</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={config.concurrency}
                    onChange={(e) => setConfig({ ...config, concurrency: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High concurrency and request counts may impact system performance. Start with lower values.
                </AlertDescription>
              </Alert>

              <Button
                onClick={runLoadTest}
                disabled={isRunning || (config.testType !== 'database' && !config.targetUrl)}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Load Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {testResult ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-2xl font-bold">{testResult.totalRequests}</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                        <p className="text-2xl font-bold">{testResult.averageResponseTime}ms</p>
                      </div>
                      <Clock className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Requests/sec</p>
                        <p className="text-2xl font-bold">{testResult.requestsPerSecond}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Error Rate</p>
                        <p className="text-2xl font-bold">{testResult.errorRate}%</p>
                      </div>
                      {testResult.errorRate === 0 ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Performance Analysis</CardTitle>
                    <Badge className={getPerformanceStatus(testResult.averageResponseTime).bg}>
                      {getPerformanceStatus(testResult.averageResponseTime).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-medium">
                          {Math.round((testResult.successfulRequests / testResult.totalRequests) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(testResult.successfulRequests / testResult.totalRequests) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Min Response</p>
                        <p className="text-xl font-bold">{testResult.minResponseTime}ms</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Max Response</p>
                        <p className="text-xl font-bold">{testResult.maxResponseTime}ms</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Response Time Percentiles</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>P50 (Median)</span>
                            <span className="font-medium">{testResult.p50}ms</span>
                          </div>
                          <Progress value={50} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>P95</span>
                            <span className="font-medium">{testResult.p95}ms</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>P99</span>
                            <span className="font-medium">{testResult.p99}ms</span>
                          </div>
                          <Progress value={99} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-lg font-semibold">{testResult.duration}s</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Successful</p>
                        <p className="text-lg font-semibold text-green-500">{testResult.successfulRequests}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-lg font-semibold text-red-500">{testResult.failedRequests}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Test Results</p>
                <p className="text-muted-foreground">
                  Run a load test to see performance metrics
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Previous load test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history && history.length > 0 ? (
                  history.map((test: any) => (
                    <div key={test.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge>{test.test_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(test.created_at).toLocaleString()}
                          </span>
                        </div>
                        <Badge className={getPerformanceStatus(test.average_response_time).bg}>
                          {getPerformanceStatus(test.average_response_time).label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Requests</p>
                          <p className="font-medium">{test.total_requests}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Response</p>
                          <p className="font-medium">{test.average_response_time}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">RPS</p>
                          <p className="font-medium">{test.requests_per_second}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Error Rate</p>
                          <p className="font-medium">{test.error_rate}%</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No test history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadTestingPanel;
