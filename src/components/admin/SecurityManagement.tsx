
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Lock, Search, Ban, CheckCircle, XCircle } from 'lucide-react';

const SecurityManagement = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const { showSuccess, showError } = useAlert();

  const securityLogs = [
    { id: '1', type: 'Failed Login', ip: '192.168.1.100', user: 'admin@test.com', timestamp: '2024-01-15 10:30:00', risk: 'medium' },
    { id: '2', type: 'Suspicious Activity', ip: '10.0.0.1', user: 'unknown', timestamp: '2024-01-15 09:45:00', risk: 'high' },
  ];

  const runSecurityScan = async () => {
    setIsScanning(true);
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResults = [
        { type: 'System Health', status: 'pass', message: 'All systems operational' },
        { type: 'Database Security', status: 'pass', message: 'Database connections secure' },
        { type: 'User Access', status: 'warning', message: '2 users with admin privileges' },
        { type: 'Failed Logins', status: 'fail', message: '15 failed login attempts in last hour' }
      ];
      
      setScanResults(mockResults);
      showSuccess('Security Scan Complete', 'Security scan completed successfully');
    } catch (error) {
      showError('Scan Failed', 'Security scan encountered an error');
    } finally {
      setIsScanning(false);
    }
  };

  const blockIP = async (ip: string) => {
    try {
      // In a real implementation, you would add the IP to a blocked IPs table
      await supabase
        .from('system_settings')
        .upsert({
          key: `blocked_ip_${ip.replace(/\./g, '_')}`,
          value: { ip, blocked_at: new Date().toISOString() },
          category: 'security',
          description: `Blocked IP ${ip}`
        });
      
      showSuccess('IP Blocked', `IP address ${ip} has been blocked`);
    } catch (error) {
      showError('Block Failed', 'Failed to block IP address');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Management</h2>
          <p className="text-gray-600">Security monitoring, logs, and threat detection</p>
        </div>
        <Button onClick={runSecurityScan} disabled={isScanning}>
          <Shield className="h-4 w-4 mr-2" />
          {isScanning ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <Ban className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Lock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {result.status === 'pass' ? 
                      <CheckCircle className="h-5 w-5 text-green-500" /> :
                      result.status === 'warning' ?
                      <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
                      <XCircle className="h-5 w-5 text-red-500" />
                    }
                    <div>
                      <div className="font-medium">{result.type}</div>
                      <div className="text-sm text-gray-500">{result.message}</div>
                    </div>
                  </div>
                  <Badge variant={
                    result.status === 'pass' ? 'default' : 
                    result.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="firewall">Firewall</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant={log.risk === 'high' ? 'destructive' : 'outline'}>
                          {log.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Search className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => blockIP(log.ip)}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firewall">
          <Card>
            <CardHeader>
              <CardTitle>Firewall Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Block Suspicious IPs</div>
                      <div className="text-sm text-gray-500">Automatically block IPs with suspicious activity</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Rate Limiting</div>
                      <div className="text-sm text-gray-500">Limit requests per IP address</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Threat Detection</h3>
                <p className="text-gray-600 mb-4">AI-powered threat detection and prevention</p>
                <Button onClick={runSecurityScan} disabled={isScanning}>
                  {isScanning ? 'Analyzing...' : 'Run Threat Analysis'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Two-Factor Authentication</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Password Policy</span>
                  <Badge className="bg-green-100 text-green-800">Strong</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Timeout</span>
                  <Badge className="bg-blue-100 text-blue-800">30 minutes</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>IP Whitelist</span>
                  <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityManagement;
