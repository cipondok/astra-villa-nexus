import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlert } from '@/contexts/AlertContext';
import { 
  Users, UserPlus, Search, Shield, Ban, UserCheck, 
  Crown, Star, Gem, Sparkles, Activity, Clock, 
  Mail, Phone, Building, ChevronRight, Eye, Edit,
  AlertTriangle, CheckCircle, XCircle, MoreHorizontal
} from 'lucide-react';
import { MEMBERSHIP_LEVELS, getMembershipFromUserLevel } from '@/types/membership';

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service' | 'super_admin';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  verification_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  user_level_id?: string;
  created_at: string;
  last_seen_at?: string;
  avatar_url?: string;
  user_levels?: {
    id: string;
    name: string;
    max_properties: number;
    max_listings: number;
  };
}

interface UserWithRole extends UserProfile {
  role: UserRole;
  roles: UserRole[];
}

const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  super_admin: { label: 'Super Admin', color: 'bg-destructive text-destructive-foreground', icon: <Shield className="h-3 w-3" /> },
  admin: { label: 'Admin', color: 'bg-chart-4 text-background', icon: <Shield className="h-3 w-3" /> },
  agent: { label: 'Agent', color: 'bg-chart-2 text-background', icon: <Building className="h-3 w-3" /> },
  vendor: { label: 'Vendor', color: 'bg-primary text-primary-foreground', icon: <Star className="h-3 w-3" /> },
  property_owner: { label: 'Property Owner', color: 'bg-chart-1 text-background', icon: <Building className="h-3 w-3" /> },
  customer_service: { label: 'CS', color: 'bg-secondary text-secondary-foreground', icon: <Users className="h-3 w-3" /> },
  general_user: { label: 'User', color: 'bg-muted text-muted-foreground', icon: <Users className="h-3 w-3" /> },
};

const getLevelIcon = (levelName: string) => {
  const membership = getMembershipFromUserLevel(levelName);
  switch (membership) {
    case 'diamond': return <Gem className="h-3.5 w-3.5 text-chart-2" />;
    case 'platinum': return <Sparkles className="h-3.5 w-3.5 text-primary" />;
    case 'gold': return <Crown className="h-3.5 w-3.5 text-chart-3" />;
    case 'vip': return <Star className="h-3.5 w-3.5 text-chart-4" />;
    case 'verified': return <Shield className="h-3.5 w-3.5 text-chart-1" />;
    default: return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch users with levels
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-enhanced'],
    queryFn: async (): Promise<UserWithRole[]> => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, phone, company_name, verification_status,
          is_suspended, suspension_reason, user_level_id, created_at, 
          last_seen_at, avatar_url,
          user_levels (id, name, max_properties, max_listings)
        `)
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('is_active', true);
      
      if (rolesError) throw rolesError;

      // Group roles by user
      const userRolesMap = new Map<string, UserRole[]>();
      roles?.forEach(r => {
        const existing = userRolesMap.get(r.user_id) || [];
        existing.push(r.role as UserRole);
        userRolesMap.set(r.user_id, existing);
      });

      // Get primary role (highest priority)
      const rolePriority: UserRole[] = ['super_admin', 'admin', 'agent', 'vendor', 'property_owner', 'customer_service', 'general_user'];
      
      return (profiles || []).map(profile => {
        const userRoles = userRolesMap.get(profile.id) || ['general_user'];
        const primaryRole = rolePriority.find(r => userRoles.includes(r)) || 'general_user';
        return {
          ...profile,
          role: primaryRole,
          roles: userRoles,
        };
      });
    },
  });

  // Fetch user levels for assignment
  const { data: userLevels } = useQuery({
    queryKey: ['user-levels-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_levels')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Stats calculation
  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => !u.is_suspended).length || 0,
    suspended: users?.filter(u => u.is_suspended).length || 0,
    pending: users?.filter(u => u.verification_status === 'pending').length || 0,
    admins: users?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0,
    agents: users?.filter(u => u.role === 'agent').length || 0,
    vendors: users?.filter(u => u.role === 'vendor').length || 0,
    owners: users?.filter(u => u.role === 'property_owner').length || 0,
  };

  // Mutations
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('User Suspended', 'User has been suspended successfully.');
      setShowSuspendModal(false);
      setSelectedUser(null);
      setSuspensionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-users-enhanced'] });
    },
    onError: (error: any) => {
      showError('Suspension Failed', error.message);
    },
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('User Unsuspended', 'User has been activated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users-enhanced'] });
    },
    onError: (error: any) => {
      showError('Failed', error.message);
    },
  });

  const updateUserLevelMutation = useMutation({
    mutationFn: async ({ userId, levelId }: { userId: string; levelId: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ user_level_id: levelId })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Level Updated', 'User level has been updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users-enhanced'] });
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // First check if role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();
      
      if (existingRole) {
        // Update to active
        await supabase
          .from('user_roles')
          .update({ is_active: true })
          .eq('id', existingRole.id);
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role, is_active: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess('Role Added', 'User role has been updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-users-enhanced'] });
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    },
  });

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !user.is_suspended) ||
      (statusFilter === 'suspended' && user.is_suspended) ||
      (statusFilter === 'pending' && user.verification_status === 'pending');
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getStatusBadge = (user: UserWithRole) => {
    if (user.is_suspended) {
      return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Suspended</Badge>;
    }
    const statusColors: Record<string, string> = {
      approved: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
      pending: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
      rejected: 'bg-destructive/10 text-destructive border-destructive/30',
    };
    return (
      <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[user.verification_status] || statusColors.pending}`}>
        {user.verification_status}
      </Badge>
    );
  };

  return (
    <div className="space-y-3 p-1 md:p-0">
      {/* Professional Header */}
      <div className="bg-primary/5 rounded-lg border border-border p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">User Management</h2>
                <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px] px-1.5 py-0 h-4">
                  <Activity className="h-2.5 w-2.5 mr-0.5" />
                  {stats.total} Users
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Manage users, roles, levels & permissions</p>
            </div>
          </div>
          <Button size="sm" className="h-7 text-[10px] px-2">
            <UserPlus className="h-3 w-3 mr-1" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
        {[
          { label: 'Total', value: stats.total, icon: <Users className="h-3 w-3 text-primary" /> },
          { label: 'Active', value: stats.active, icon: <CheckCircle className="h-3 w-3 text-chart-1" /> },
          { label: 'Suspended', value: stats.suspended, icon: <Ban className="h-3 w-3 text-destructive" /> },
          { label: 'Pending', value: stats.pending, icon: <Clock className="h-3 w-3 text-chart-3" /> },
          { label: 'Admins', value: stats.admins, icon: <Shield className="h-3 w-3 text-chart-4" /> },
          { label: 'Agents', value: stats.agents, icon: <Building className="h-3 w-3 text-chart-2" /> },
          { label: 'Vendors', value: stats.vendors, icon: <Star className="h-3 w-3 text-primary" /> },
          { label: 'Owners', value: stats.owners, icon: <Building className="h-3 w-3 text-chart-1" /> },
        ].map((stat) => (
          <Card key={stat.label} className="p-2">
            <div className="flex items-center gap-1">
              {stat.icon}
              <div>
                <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-1.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-7 text-[10px]"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[110px] h-7 text-[10px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[100px] h-7 text-[10px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Users ({filteredUsers.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            {isLoading ? (
              <div className="text-center py-6 text-[10px] text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-[10px] text-muted-foreground">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px]">
                    <TableHead className="w-[220px]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="text-xs">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.full_name || 'No name'}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={`${roleConfig[user.role]?.color} text-[10px] px-1.5 py-0 w-fit`}>
                            {roleConfig[user.role]?.label}
                          </Badge>
                          <Select 
                            value="" 
                            onValueChange={(role: UserRole) => updateUserRoleMutation.mutate({ userId: user.id, role })}
                          >
                            <SelectTrigger className="h-5 text-[10px] w-[80px] border-dashed">
                              <span className="text-muted-foreground">+ role</span>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleConfig)
                                .filter(([key]) => !user.roles.includes(key as UserRole))
                                .map(([key, config]) => (
                                  <SelectItem key={key} value={key} className="text-xs">{config.label}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.user_levels ? (
                          <div className="flex items-center gap-1.5">
                            {getLevelIcon(user.user_levels.name)}
                            <span className="text-[11px]">{user.user_levels.name}</span>
                          </div>
                        ) : (
                          <Select 
                            value={user.user_level_id || ''} 
                            onValueChange={(levelId) => updateUserLevelMutation.mutate({ userId: user.id, levelId })}
                          >
                            <SelectTrigger className="h-6 text-[10px] w-[90px]">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {userLevels?.map((level) => (
                                <SelectItem key={level.id} value={level.id} className="text-xs">
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {user.is_suspended ? (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-chart-1"
                              onClick={() => unsuspendUserMutation.mutate(user.id)}
                              disabled={unsuspendUserMutation.isPending}
                            >
                              <UserCheck className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSuspendModal(true);
                              }}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Suspend Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Suspend User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium">{selectedUser?.full_name || 'No name'}</p>
              <p className="text-muted-foreground">{selectedUser?.email}</p>
            </div>
            <div>
              <Label className="text-xs">Suspension Reason</Label>
              <Textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                className="text-xs min-h-[80px] mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => {
                  if (selectedUser) {
                    suspendUserMutation.mutate({ userId: selectedUser.id, reason: suspensionReason });
                  }
                }}
                disabled={suspendUserMutation.isPending}
              >
                {suspendUserMutation.isPending ? 'Suspending...' : 'Suspend User'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => setShowSuspendModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
