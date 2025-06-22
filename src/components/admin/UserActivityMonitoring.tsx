
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  AlertTriangle,
  Eye,
  Ban,
  Shield,
  Search,
  Filter,
  Download
} from 'lucide-react';

const UserActivityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock data - replace with real data from your backend
  const userActivities = [
    {
      id: '1',
      userId: 'user-123',
      userName: 'John Doe',
      email: 'john@example.com',
      action: 'Login',
      timestamp: '2024-01-15 10:30:00',
      ipAddress: '192.168.1.100',
      location: 'Jakarta, Indonesia',
      device: 'Chrome on Windows',
      status: 'success',
      risk: 'low'
    },
    {
      id: '2',
      userId: 'user-456',
      userName: 'Jane Smith',
      email: 'jane@example.com',
      action: 'Property View',
      timestamp: '2024-01-15 10:25:00',
      ipAddress: '192.168.1.101',
      location: 'Surabaya, Indonesia',
      device: 'Safari on iPhone',
      status: 'success',
      risk: 'low'
    },
    // Add more mock data as needed
  ];

  const onlineUsers = [
    { id: '1', name: 'John Doe', status: 'active', lastSeen: 'Now', location: 'Jakarta' },
    { id: '2', name: 'Jane Smith', status: 'idle', lastSeen: '5m ago', location: 'Surabaya' },
    { id: '3', name: 'Bob Wilson', status: 'active', lastSeen: 'Now', location: 'Bandung' },
  ];

  const suspiciousActivities = [
    {
      id: '1',
      type: 'Multiple Login Attempts',
      user: 'unknown@suspicious.com',
      risk: 'high',
      timestamp: '2024-01-15 09:45:00',
      details: '15 failed login attempts in 5 minutes'
    },
    {
      id: '2',
      type: 'Unusual Location',
      user: 'john@example.com',
      risk: 'medium',
      timestamp: '2024-01-15 09:30:00',
      details: 'Login from new country: Singapore'
    }
  ];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'idle':
        return <Badge className="bg-yellow-100 text-yellow-800">Idle</Badge>;
      case 'offline':
        return <Badge variant="outline">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Activity Monitoring</h2>
          <p className="text-gray-600">Monitor user activities, sessions, and security events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Users</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
                <p className="text-2xl font-bold">24m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Activity Log</TabsTrigger>
          <TabsTrigger value="online">Online Users</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Activity Log */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Real-time user activity monitoring</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.userName}</div>
                          <div className="text-sm text-gray-500">{activity.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell className="text-sm">{activity.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{activity.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          <span className="text-sm">{activity.device}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(activity.risk)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
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

        {/* Online Users */}
        <TabsContent value="online">
          <Card>
            <CardHeader>
              <CardTitle>Currently Online Users</CardTitle>
              <CardDescription>Users currently active on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(user.status)}
                      <span className="text-sm text-gray-500">{user.lastSeen}</span>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Suspicious activities and security alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suspiciousActivities.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">{event.type}</div>
                          <div className="text-sm text-gray-600">{event.details}</div>
                          <div className="text-xs text-gray-500">{event.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRiskBadge(event.risk)}
                        <Button size="sm">Investigate</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Activity Chart Placeholder
                  <br />
                  (Integrate with your preferred charting library)
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Map Visualization Placeholder
                  <br />
                  (Integrate with mapping library)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserActivityMonitoring;
