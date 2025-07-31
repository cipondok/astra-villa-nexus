import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users as UsersIcon,
  Search,
  User,
  Crown,
  Shield,
  Building2,
  Wrench,
  Headphones,
  Mail,
  Phone,
  Calendar,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string;
  company_name: string;
  verification_status: string;
  created_at: string;
  last_seen_at: string;
  is_suspended: boolean;
}

const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', searchQuery, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'agent': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'vendor': return <Wrench className="h-4 w-4 text-green-500" />;
      case 'customer_service': return <Headphones className="h-4 w-4 text-purple-500" />;
      case 'property_owner': return <Building2 className="h-4 w-4 text-orange-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'agent': return 'secondary';
      case 'vendor': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadge = (status: string, isSuspended: boolean) => {
    if (isSuspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === "admins") return user.role === 'admin';
    if (activeTab === "agents") return user.role === 'agent';
    if (activeTab === "vendors") return user.role === 'vendor';
    if (activeTab === "customers") return user.role === 'general_user';
    if (activeTab === "suspended") return user.is_suspended;
    return true;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length,
    vendors: users.filter(u => u.role === 'vendor').length,
    customers: users.filter(u => u.role === 'general_user').length,
    suspended: users.filter(u => u.is_suspended).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <UsersIcon className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Users Management</h1>
          </div>
          <p className="text-xl opacity-90">Manage and monitor all platform users</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.admins}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.agents}</div>
              <div className="text-sm text-muted-foreground">Agents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.vendors}</div>
              <div className="text-sm text-muted-foreground">Vendors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.customers}</div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
              <div className="text-sm text-muted-foreground">Suspended</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={roleFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('all')}
              size="sm"
            >
              All Roles
            </Button>
            <Button
              variant={roleFilter === 'admin' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('admin')}
              size="sm"
            >
              Admin
            </Button>
            <Button
              variant={roleFilter === 'agent' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('agent')}
              size="sm"
            >
              Agent
            </Button>
            <Button
              variant={roleFilter === 'vendor' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('vendor')}
              size="sm"
            >
              Vendor
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="admins">Admins ({stats.admins})</TabsTrigger>
            <TabsTrigger value="agents">Agents ({stats.agents})</TabsTrigger>
            <TabsTrigger value="vendors">Vendors ({stats.vendors})</TabsTrigger>
            <TabsTrigger value="customers">Customers ({stats.customers})</TabsTrigger>
            <TabsTrigger value="suspended">Suspended ({stats.suspended})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-1 w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold line-clamp-1">
                              {user.full_name || 'No Name'}
                            </h4>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(user.verification_status, user.is_suspended)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="line-clamp-1">{user.email}</span>
                        </div>
                        
                        {user.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        
                        {user.company_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span className="line-clamp-1">{user.company_name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                        </div>
                        
                        {user.last_seen_at && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Last seen {formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Users;