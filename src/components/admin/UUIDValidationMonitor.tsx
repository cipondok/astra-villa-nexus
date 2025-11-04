/**
 * UUID Validation Monitor Component
 * Admin dashboard component to track and analyze UUID validation failures
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Download, Trash2, RefreshCw } from 'lucide-react';
import { uuidValidationLogger, UUIDValidationError } from '@/utils/uuid-validation-logger';

export const UUIDValidationMonitor = () => {
  const [stats, setStats] = useState(uuidValidationLogger.getStats());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Refresh stats when component mounts or refreshKey changes
    setStats(uuidValidationLogger.getStats());
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all UUID validation error logs?')) {
      uuidValidationLogger.clearErrors();
      handleRefresh();
    }
  };

  const handleExport = () => {
    const data = uuidValidationLogger.exportErrors();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuid-validation-errors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                UUID Validation Monitor
              </CardTitle>
              <CardDescription>
                Track and analyze UUID validation failures across the application
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {stats.totalErrors}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Contexts Affected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.errorsByContext).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Routes Affected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.errorsByRoute).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent Errors</TabsTrigger>
              <TabsTrigger value="contexts">By Context</TabsTrigger>
              <TabsTrigger value="routes">By Route</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {stats.recentErrors.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No UUID validation errors logged
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentErrors.map((error, index) => (
                      <ErrorCard key={index} error={error} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="contexts">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {Object.entries(stats.errorsByContext)
                    .sort(([, a], [, b]) => b - a)
                    .map(([context, count]) => (
                      <div
                        key={context}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">{context}</span>
                        <Badge variant="destructive">{count} errors</Badge>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="routes">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {Object.entries(stats.errorsByRoute)
                    .sort(([, a], [, b]) => b - a)
                    .map(([route, count]) => (
                      <div
                        key={route}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="font-mono text-sm">{route}</span>
                        <Badge variant="destructive">{count} errors</Badge>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const ErrorCard = ({ error }: { error: UUIDValidationError }) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{error.context}</Badge>
              {error.route && (
                <span className="text-xs text-muted-foreground font-mono">
                  {error.route}
                </span>
              )}
            </div>
            <div className="text-sm">
              <span className="font-medium">Invalid value:</span>{' '}
              <code className="px-2 py-1 bg-muted rounded text-xs">
                {error.invalidValue}
              </code>
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(error.timestamp).toLocaleString()}
          </span>
        </div>
        
        {error.additionalInfo && (
          <div className="text-xs text-muted-foreground">
            <details className="cursor-pointer">
              <summary className="font-medium">Additional Info</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                {JSON.stringify(error.additionalInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        {error.stackTrace && (
          <div className="text-xs text-muted-foreground">
            <details className="cursor-pointer">
              <summary className="font-medium">Stack Trace</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto font-mono text-[10px]">
                {error.stackTrace}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
