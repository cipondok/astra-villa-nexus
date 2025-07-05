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
    console.log('🧪 Testing optimized vendor profile query...');
    
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
    console.log('🔍 Testing database connection...');
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
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Connection Status</span>
            </div>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {connectionStatus}
            </Badge>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">
                {metrics.averageResponseTime > 0 ? `${Math.round(metrics.averageResponseTime)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-blue-600">Avg Response</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{metrics.successfulQueries}</div>
              <div className="text-xs text-green-600">Successful</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{metrics.failedQueries}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">{metrics.timeouts}</div>
              <div className="text-xs text-orange-600">Timeouts</div>
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
            <div className={`p-4 rounded-lg border ${testResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
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