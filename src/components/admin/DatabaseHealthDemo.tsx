import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedDatabaseConnection } from '@/hooks/useEnhancedDatabaseConnection';
import { Database, Timer, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const DatabaseHealthDemo = () => {
  const {
    isConnected,
    connectionStatus,
    metrics,
    queryVendorProfiles,
    checkConnection,
    retryConnection
  } = useEnhancedDatabaseConnection();
  
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingQuery, setIsTestingQuery] = useState(false);

  const handleTestOptimizedQuery = async () => {
    setIsTestingQuery(true);
    
    const startTime = Date.now();
    const result = await queryVendorProfiles({
      isActive: true,
      isVerified: true,
      limit: 10
    });
    const duration = Date.now() - startTime;
    
    setTestResults({
      success: result.error === null,
      duration,
      dataCount: result.data?.length || 0,
      retryCount: result.retryCount,
      error: result.error?.message
    });
    
    setIsTestingQuery(false);
  };

  const handleTestConnection = async () => {
    await checkConnection();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Health Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
          {isConnected ? (
                <CheckCircle className="h-4 w-4 text-chart-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium">Connection Status</span>
            </div>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {connectionStatus}
            </Badge>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-chart-2/10 rounded-lg text-center">
              <div className="text-lg font-bold text-chart-2">
                {metrics.averageResponseTime > 0 ? `${Math.round(metrics.averageResponseTime)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-chart-2">Avg Response</div>
            </div>
            <div className="p-3 bg-chart-1/10 rounded-lg text-center">
              <div className="text-lg font-bold text-chart-1">{metrics.successfulQueries}</div>
              <div className="text-xs text-chart-1">Successful</div>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg text-center">
              <div className="text-lg font-bold text-destructive">{metrics.failedQueries}</div>
              <div className="text-xs text-destructive">Failed</div>
            </div>
            <div className="p-3 bg-chart-4/10 rounded-lg text-center">
              <div className="text-lg font-bold text-chart-4">{metrics.timeouts}</div>
              <div className="text-xs text-chart-4">Timeouts</div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleTestOptimizedQuery} 
              disabled={isTestingQuery}
              className="flex-1"
            >
              <Timer className="h-4 w-4 mr-2" />
              {isTestingQuery ? 'Testing...' : 'Test Optimized Query'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={retryConnection}
            >
              Retry Connection
            </Button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className={`p-4 rounded-lg border ${testResults.success ? 'bg-chart-1/10 border-chart-1/30' : 'bg-destructive/10 border-destructive/30'}`}>
              <h4 className="font-medium mb-2">Optimized Query Test Results</h4>
              <div className="space-y-1 text-sm">
                <div>✅ Status: {testResults.success ? 'Success' : 'Failed'}</div>
                <div>⏱️ Duration: {testResults.duration}ms</div>
                <div>📊 Records: {testResults.dataCount}</div>
                <div>🔄 Retries: {testResults.retryCount}</div>
                {testResults.error && <div>❌ Error: {testResults.error}</div>}
              </div>
            </div>
          )}

          {/* Improvements Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 text-primary">✅ Database Timeout Issues Resolved</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Added 9 optimized database indexes for vendor_business_profiles</li>
              <li>• Implemented query timeout handling (configurable, default 8s)</li>
              <li>• Added automatic retry logic with exponential backoff</li>
              <li>• Enhanced error handling for connection issues</li>
              <li>• Added performance monitoring and metrics tracking</li>
              <li>• Connection health checks every 30 seconds</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseHealthDemo;