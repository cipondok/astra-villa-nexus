
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Clock, Users, Building, Shield, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  alert_category: string;
  is_read: boolean;
  created_at: string;
  urgency_level: number;
}

const EnhancedAlertManagement = () => {
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin-alerts', filterCategory, filterPriority],
    queryFn: async () => {
      let query = supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterCategory !== 'all') {
        query = query.eq('alert_category', filterCategory);
      }
      if (filterPriority !== 'all') {
        query = query.eq('priority', filterPriority);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Alert[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertIds: string[]) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .in('id', alertIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      setSelectedAlerts([]);
      toast.success('Alerts marked as read');
    },
    onError: () => {
      toast.error('Failed to update alerts');
    }
  });

  const deleteAlertsMutation = useMutation({
    mutationFn: async (alertIds: string[]) => {
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .in('id', alertIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      setSelectedAlerts([]);
      toast.success('Alerts deleted');
    },
    onError: () => {
      toast.error('Failed to delete alerts');
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return <Users className="h-4 w-4" />;
      case 'properties': return <Building className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'support': return <MessageSquare className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(alerts?.map(alert => alert.id) || []);
    } else {
      setSelectedAlerts([]);
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts(prev => [...prev, alertId]);
    } else {
      setSelectedAlerts(prev => prev.filter(id => id !== alertId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Enhanced Alert Management
        </CardTitle>
        <CardDescription>
          Real-time alert monitoring with bulk actions and smart filtering
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="flex gap-4 mb-6">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="properties">Properties</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="vendors">Vendors</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedAlerts.length > 0 && (
          <div className="flex gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium">
              {selectedAlerts.length} alert(s) selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAsReadMutation.mutate(selectedAlerts)}
              disabled={markAsReadMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Read
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteAlertsMutation.mutate(selectedAlerts)}
              disabled={deleteAlertsMutation.isPending}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Alerts Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAlerts.length === alerts?.length && alerts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading alerts...
                  </TableCell>
                </TableRow>
              ) : alerts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alerts?.map((alert) => (
                  <TableRow key={alert.id} className={alert.is_read ? 'opacity-60' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAlerts.includes(alert.id)}
                        onCheckedChange={(checked) => handleSelectAlert(alert.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {alert.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(alert.alert_category)}
                        <Badge variant="outline" className="capitalize">
                          {alert.alert_category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(alert.priority) as any} className="capitalize">
                        {alert.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">L{alert.urgency_level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.is_read ? 'default' : 'destructive'}>
                        {alert.is_read ? 'Read' : 'Unread'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAlertManagement;
