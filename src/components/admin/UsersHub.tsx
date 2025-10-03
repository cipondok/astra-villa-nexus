import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  Briefcase, 
  Home, 
  UserCheck, 
  Headphones, 
  Shield,
  Activity,
  TrendingUp,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import UserManagement from './UserManagement';
import VendorUserManagement from './VendorUserManagement';
import CustomerServiceUserManagement from './CustomerServiceUserManagement';
import SimpleUserManagement from './SimpleUserManagement';

const UsersHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user statistics
  const { data: userStats, refetch: refetchStats } = useQuery({
    queryKey: ['user-hub-stats'],
    queryFn: async () => {
      const [
        allUsers,
        generalUsers,
        vendors,
        agents,
        propertyOwners,
        customerService,
        admins,
        suspendedUsers,
        pendingUsers,
        activeToday
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'general_user'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'vendor'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'agent'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'property_owner'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer_service'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .gte('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        total: allUsers.count || 0,
        generalUsers: generalUsers.count || 0,
        vendors: vendors.count || 0,
        agents: agents.count || 0,
        propertyOwners: propertyOwners.count || 0,
        customerService: customerService.count || 0,
        admins: admins.count || 0,
        suspended: suspendedUsers.count || 0,
        pending: pendingUsers.count || 0,
        activeToday: activeToday.count || 0
      };
    },
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const stats = userStats || {
    total: 0,
    generalUsers: 0,
    vendors: 0,
    agents: 0,
    propertyOwners: 0,
    customerService: 0,
    admins: 0,
    suspended: 0,
    pending: 0,
    activeToday: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Users Hub
          </h2>
          <p className="text-muted-foreground mt-1">
            Centralized management for all website users and their actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-blue-100 text-xs mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.vendors.toLocaleString()}</div>
            <p className="text-purple-100 text-xs mt-1">Service providers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Agents & Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats.agents + stats.propertyOwners).toLocaleString()}
            </div>
            <p className="text-green-100 text-xs mt-1">
              {stats.agents} agents, {stats.propertyOwners} owners
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeToday.toLocaleString()}</div>
            <p className="text-orange-100 text-xs mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats.pending + stats.suspended).toLocaleString()}
            </div>
            <p className="text-red-100 text-xs mt-1">
              {stats.pending} pending, {stats.suspended} suspended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">General Users</p>
                <p className="text-2xl font-bold">{stats.generalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Service</p>
                <p className="text-2xl font-bold">{stats.customerService.toLocaleString()}</p>
              </div>
              <Headphones className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admin Staff</p>
                <p className="text-2xl font-bold">{stats.admins.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="all-users">
            <Users className="h-4 w-4 mr-2" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Briefcase className="h-4 w-4 mr-2" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Home className="h-4 w-4 mr-2" />
            Agents/Owners
          </TabsTrigger>
          <TabsTrigger value="support">
            <Headphones className="h-4 w-4 mr-2" />
            Support Staff
          </TabsTrigger>
          <TabsTrigger value="management">
            <Shield className="h-4 w-4 mr-2" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
              <CardDescription>Real-time insights into user engagement and platform usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">User Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">General Users</span>
                        <Badge>{((stats.generalUsers / stats.total) * 100).toFixed(1)}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vendors</span>
                        <Badge>{((stats.vendors / stats.total) * 100).toFixed(1)}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Agents & Owners</span>
                        <Badge>{(((stats.agents + stats.propertyOwners) / stats.total) * 100).toFixed(1)}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Staff</span>
                        <Badge>{(((stats.customerService + stats.admins) / stats.total) * 100).toFixed(1)}%</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">User Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Today</span>
                        <Badge className="bg-green-100 text-green-800">{stats.activeToday}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Verification</span>
                        <Badge className="bg-yellow-100 text-yellow-800">{stats.pending}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Suspended</span>
                        <Badge className="bg-red-100 text-red-800">{stats.suspended}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Users</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {stats.total - stats.suspended - stats.pending}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common user management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => setActiveTab('all-users')}>
                  <Users className="h-4 w-4 mr-2" />
                  View All Users
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('vendors')}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Vendors
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('agents')}>
                  <Home className="h-4 w-4 mr-2" />
                  Manage Agents
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('support')}>
                  <Headphones className="h-4 w-4 mr-2" />
                  Support Staff
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="all-users">
          <SimpleUserManagement />
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <VendorUserManagement />
        </TabsContent>

        {/* Agents/Owners Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Property Agents & Owners</CardTitle>
              <CardDescription>Manage property professionals and owners</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Staff Tab */}
        <TabsContent value="support">
          <CustomerServiceUserManagement />
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>Admin & Staff Management</CardTitle>
              <CardDescription>Manage administrative users and staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleUserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersHub;
