import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Search, Shield, ShieldOff, Mail, Key, AlertTriangle,
  CheckCircle, Clock, MoreHorizontal, RefreshCw, Ban, UserCheck
} from 'lucide-react';
import { format } from 'date-fns';

interface UserRecord {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  verification_status: string | null;
  is_suspended: boolean | null;
  suspension_reason: string | null;
  created_at: string | null;
  last_seen_at: string | null;
  profile_completion_percentage: number | null;
}

const AdminUserControlPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, phone, avatar_url, verification_status, is_suspended, suspension_reason, created_at, last_seen_at, profile_completion_percentage')
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      if (statusFilter === 'suspended') {
        query = query.eq('is_suspended', true);
      } else if (statusFilter === 'verified') {
        query = query.eq('verification_status', 'verified');
      } else if (statusFilter === 'unverified') {
        query = query.or('verification_status.is.null,verification_status.eq.pending');
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as UserRecord[];
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, is_active')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const getRolesForUser = (userId: string) => {
    return userRoles.filter(r => r.user_id === userId).map(r => r.role);
  };

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, suspend, reason }: { userId: string; suspend: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: suspend, 
          suspension_reason: suspend ? (reason || 'Suspended by admin') : null 
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.suspend ? 'User Suspended' : 'User Activated',
        description: variables.suspend 
          ? 'Account has been suspended successfully.'
          : 'Account has been reactivated.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuspendDialogOpen(false);
      setSuspendReason('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'User Verified', description: 'Email verification status updated.' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Reset Email Sent', description: 'Password reset link has been sent to the user.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const totalUsers = users.length;
  const suspendedCount = users.filter(u => u.is_suspended).length;
  const verifiedCount = users.filter(u => u.verification_status === 'verified').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Control Panel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, verify identities, and handle suspensions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{suspendedCount}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUsers - verifiedCount}</p>
                <p className="text-xs text-muted-foreground">Unverified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roles = getRolesForUser(user.id);
                  return (
                    <TableRow key={user.id} className={user.is_suspended ? 'opacity-60' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-foreground">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? roles.map(role => (
                            <Badge key={role} variant="secondary" className="text-[10px]">
                              {role}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="text-[10px]">user</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_suspended ? (
                          <Badge variant="destructive" className="text-[10px]">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspended
                          </Badge>
                        ) : user.verification_status === 'verified' ? (
                          <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {user.last_seen_at 
                            ? format(new Date(user.last_seen_at), 'MMM d, HH:mm')
                            : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {user.created_at 
                            ? format(new Date(user.created_at), 'MMM d, yyyy')
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.verification_status !== 'verified' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => verifyMutation.mutate(user.id)}
                              disabled={verifyMutation.isPending}
                              title="Force verify"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => resetPasswordMutation.mutate(user.email)}
                            disabled={resetPasswordMutation.isPending}
                            title="Send password reset"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                          {user.is_suspended ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-chart-1"
                              onClick={() => suspendMutation.mutate({ userId: user.id, suspend: false })}
                              disabled={suspendMutation.isPending}
                              title="Reactivate"
                            >
                              <Shield className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setSuspendDialogOpen(true);
                              }}
                              title="Suspend"
                            >
                              <ShieldOff className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" />
              Suspend User Account
            </DialogTitle>
            <DialogDescription>
              Suspending <strong>{selectedUser?.email}</strong> will prevent them from logging in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason for suspension</label>
              <Input
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g., Violation of terms of service"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedUser) {
                    suspendMutation.mutate({ userId: selectedUser.id, suspend: true, reason: suspendReason });
                  }
                }}
                disabled={suspendMutation.isPending}
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Confirm Suspend'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserControlPanel;
