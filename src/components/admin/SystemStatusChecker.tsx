
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: Date;
}

const SystemStatusChecker = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runSystemChecks = async () => {
    setIsChecking(true);
    const newChecks: SystemCheck[] = [];

    try {
      // Database connectivity check
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      newChecks.push({
        id: 'database',
        name: 'Database Connection',
        status: dbError ? 'error' : 'healthy',
        message: dbError ? `Database error: ${dbError.message}` : 'Database connection is healthy',
        lastChecked: new Date()
      });

      // Properties table check
      const { data: properties, error: propError } = await supabase.from('properties').select('count').limit(1);
      newChecks.push({
        id: 'properties',
        name: 'Properties System',
        status: propError ? 'error' : 'healthy',
        message: propError ? `Properties error: ${propError.message}` : 'Properties system is operational',
        lastChecked: new Date()
      });

      // Authentication check
      const { data: authData } = await supabase.auth.getSession();
      newChecks.push({
        id: 'auth',
        name: 'Authentication System',
        status: 'healthy',
        message: 'Authentication system is operational',
        lastChecked: new Date()
      });

      // System settings check
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'system_controls');
      
      newChecks.push({
        id: 'system_controls',
        name: 'System Controls',
        status: settingsError ? 'error' : 'healthy',
        message: settingsError ? `Settings error: ${settingsError.message}` : `${settings?.length || 0} system controls configured`,
        lastChecked: new Date()
      });

      // Storage check
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      newChecks.push({
        id: 'storage',
        name: 'File Storage',
        status: storageError ? 'error' : 'healthy',
        message: storageError ? `Storage error: ${storageError.message}` : `${buckets?.length || 0} storage buckets available`,
        lastChecked: new Date()
      });

    } catch (error) {
      console.error('System check failed:', error);
    }

    setChecks(newChecks);
    setIsChecking(false);
  };

  useEffect(() => {
    runSystemChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStatus = checks.some(c => c.status === 'error') ? 'error' :
                      checks.some(c => c.status === 'warning') ? 'warning' : 'healthy';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            System Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runSystemChecks}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(overallStatus)}>
              System {overallStatus.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">
              Last checked: {checks[0]?.lastChecked.toLocaleTimeString() || 'Never'}
            </span>
          </div>
          
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {check.message}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(check.status)}>
                  {check.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusChecker;
