import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: userStats,
    error: userStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['user-hub-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_profile_stats');
      if (error) throw error;

      const stats = (Array.isArray(data) ? data[0] : data) as any;
      return {
        total: Number(stats?.total || 0),
        generalUsers: Number(stats?.general_users || 0),
        vendors: Number(stats?.vendors || 0),
        agents: Number(stats?.agents || 0),
        propertyOwners: Number(stats?.property_owners || 0),
        customerService: Number(stats?.customer_service || 0),
        admins: Number(stats?.admins || 0),
        suspended: Number(stats?.suspended || 0),
        pending: Number(stats?.pending || 0),
        activeToday: Number(stats?.active_today || 0),
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
    activeToday: 0,
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Please sign in with an admin account to view users.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {userStatsError && (
        <Card>
          <CardHeader>
            <CardTitle>Access / Data Error</CardTitle>
            <CardDescription>
              Signed in as: {user.email || user.id}
              <br />
              {String((userStatsError as any)?.message || userStatsError)}
            </CardDescription>
          </CardHeader>
        </Card>
      )}


      {/* Compact Micro Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">Total</p>
                <p className="text-xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <Users className="h-6 w-6 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">Vendors</p>
                <p className="text-xl font-bold">{stats.vendors.toLocaleString()}</p>
              </div>
              <Briefcase className="h-6 w-6 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">Agents</p>
                <p className="text-xl font-bold">{(stats.agents + stats.propertyOwners).toLocaleString()}</p>
              </div>
              <UserCheck className="h-6 w-6 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">Active</p>
                <p className="text-xl font-bold">{stats.activeToday.toLocaleString()}</p>
              </div>
              <Activity className="h-6 w-6 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-90">Pending</p>
                <p className="text-xl font-bold">{(stats.pending + stats.suspended).toLocaleString()}</p>
              </div>
              <Shield className="h-6 w-6 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">General</p>
                <p className="text-lg font-bold">{stats.generalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">CS Staff</p>
                <p className="text-lg font-bold">{stats.customerService.toLocaleString()}</p>
              </div>
              <Headphones className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-lg font-bold">{stats.admins.toLocaleString()}</p>
              </div>
              <Shield className="h-5 w-5 text-purple-500" />
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
