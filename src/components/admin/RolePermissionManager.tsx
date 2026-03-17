import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllRolePermissions } from '@/hooks/usePermissions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Shield, Users, Search, UserPlus, UserMinus, Check, X,
  Loader2, ShieldCheck, Crown, Building2, Briefcase, HardHat,
  Wrench, Scale, Headphones, Pen, User, ChevronDown, ChevronRight,
  Plus, Trash2
} from 'lucide-react';

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'text-chart-3' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-destructive' },
  agent: { label: 'Agent', icon: Briefcase, color: 'text-chart-1' },
  property_owner: { label: 'Property Owner', icon: Building2, color: 'text-chart-2' },
  investor: { label: 'Investor', icon: Users, color: 'text-chart-4' },
  developer: { label: 'Developer', icon: HardHat, color: 'text-chart-5' },
  vendor: { label: 'Vendor', icon: Wrench, color: 'text-primary' },
  service_provider: { label: 'Service Provider', icon: Wrench, color: 'text-chart-1' },
  legal_consultant: { label: 'Legal Consultant', icon: Scale, color: 'text-chart-2' },
  customer_service: { label: 'Customer Service', icon: Headphones, color: 'text-chart-3' },
  editor: { label: 'Editor', icon: Pen, color: 'text-chart-4' },
  general_user: { label: 'General User', icon: User, color: 'text-muted-foreground' },
};

// ── User Role Assignment Tab ──
function UserRoleAssignment() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; full_name: string; email: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-search', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: search.length >= 2,
  });

  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['user-role-assignments', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, role, is_active, assigned_at')
        .eq('user_id', selectedUser.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedUser?.id,
  });

  const assignRole = useMutation({
    mutationFn: async (role: string) => {
      if (!selectedUser) return;
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.id, role: role as any, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role-assignments', selectedUser?.id] });
      toast.success('Role assigned successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role-assignments', selectedUser?.id] });
      toast.success('Role removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ roleId, active }: { roleId: string; active: boolean }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: active })
        .eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role-assignments', selectedUser?.id] });
      toast.success('Role status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const assignedRoleNames = userRoles.map((r: any) => r.role);
  const availableRoles = Object.keys(ROLE_META).filter((r) => !assignedRoleNames.includes(r));

  return (
    <div className="space-y-4">
      {/* User Search */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Find User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background/50"
          />
          {usersLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {users.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {users.map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u); setSearch(''); }}
                  className={`w-full text-left p-2 rounded-lg text-sm hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                    selectedUser?.id === u.id ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected User Roles */}
      {selectedUser && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-chart-1" />
                Roles for {selectedUser.full_name || selectedUser.email}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current roles */}
            {rolesLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : userRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No roles assigned</p>
            ) : (
              <div className="space-y-2">
                {userRoles.map((ur: any) => {
                  const meta = ROLE_META[ur.role] || { label: ur.role, icon: User, color: 'text-muted-foreground' };
                  const Icon = meta.icon;
                  return (
                    <div key={ur.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-background/30">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                        <span className="text-sm font-medium">{meta.label}</span>
                        <Badge variant={ur.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {ur.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => toggleActive.mutate({ roleId: ur.id, active: !ur.is_active })}
                        >
                          {ur.is_active ? <X className="h-3 w-3 mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                          {ur.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeRole.mutate(ur.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Assign new role */}
            {availableRoles.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Assign new role:</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableRoles.map((role) => {
                    const meta = ROLE_META[role];
                    const Icon = meta.icon;
                    return (
                      <Button
                        key={role}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => assignRole.mutate(role)}
                        disabled={assignRole.isPending}
                      >
                        <Icon className={`h-3 w-3 ${meta.color}`} />
                        {meta.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Role Permissions Matrix Tab ──
function RolePermissionsMatrix() {
  const { data: allPerms = [], isLoading } = useAllRolePermissions();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [newPerm, setNewPerm] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');

  const grouped = useMemo(() => {
    const map: Record<string, { permission: string; description: string | null }[]> = {};
    allPerms.forEach((p) => {
      if (!map[p.role]) map[p.role] = [];
      map[p.role].push({ permission: p.permission, description: p.description });
    });
    return map;
  }, [allPerms]);

  const addPermission = useMutation({
    mutationFn: async ({ role, permission, description }: { role: string; permission: string; description: string }) => {
      const { error } = await supabase
        .from('role_permissions')
        .insert({ role: role as any, permission, description });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      setNewPerm('');
      setNewPermDesc('');
      toast.success('Permission added');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePermission = useMutation({
    mutationFn: async ({ role, permission }: { role: string; permission: string }) => {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role)
        .eq('permission', permission);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast.success('Permission removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const roles = Object.keys(ROLE_META);

  return (
    <div className="space-y-2">
      {roles.map((role) => {
        const meta = ROLE_META[role];
        const Icon = meta.icon;
        const perms = grouped[role] || [];
        const isExpanded = expandedRole === role;

        return (
          <Card key={role} className="bg-card/60 backdrop-blur-sm border-border/50">
            <button
              onClick={() => setExpandedRole(isExpanded ? null : role)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${meta.color}`} />
                <span className="text-sm font-semibold">{meta.label}</span>
                <Badge variant="outline" className="text-[10px]">{perms.length} permissions</Badge>
              </div>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isExpanded && (
              <CardContent className="pt-0 pb-3 space-y-2">
                {perms.map((p) => (
                  <div key={p.permission} className="flex items-center justify-between py-1.5 px-2 rounded bg-background/30 group">
                    <div>
                      <code className="text-xs font-mono text-foreground">{p.permission}</code>
                      {p.description && <p className="text-[10px] text-muted-foreground">{p.description}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => deletePermission.mutate({ role, permission: p.permission })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* Add new permission */}
                <div className="flex gap-2 pt-2 border-t border-border/30">
                  <Input
                    placeholder="permission_key"
                    value={newPerm}
                    onChange={(e) => setNewPerm(e.target.value)}
                    className="text-xs h-8 bg-background/50 font-mono flex-1"
                  />
                  <Input
                    placeholder="Description"
                    value={newPermDesc}
                    onChange={(e) => setNewPermDesc(e.target.value)}
                    className="text-xs h-8 bg-background/50 flex-1"
                  />
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    disabled={!newPerm.trim() || addPermission.isPending}
                    onClick={() => addPermission.mutate({ role, permission: newPerm.trim(), description: newPermDesc.trim() })}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Main Component ──
export default function RolePermissionManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Role & Permission Management
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Assign roles to users and manage granular feature permissions</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-muted/50 h-auto gap-1 p-1">
          <TabsTrigger value="users" className="text-xs gap-1"><Users className="h-3 w-3" /> User Roles</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs gap-1"><Shield className="h-3 w-3" /> Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UserRoleAssignment /></TabsContent>
        <TabsContent value="permissions"><RolePermissionsMatrix /></TabsContent>
      </Tabs>
    </div>
  );
}
