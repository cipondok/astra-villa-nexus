import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  MoreVertical,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookingSettings {
  id?: string;
  max_bookings_per_day: number;
  min_advance_hours: number;
  max_advance_days: number;
  default_duration_minutes: number;
  auto_confirm_enabled: boolean;
  send_reminders: boolean;
  reminder_hours_before: number;
  allowed_booking_types: string[];
  working_hours_start: string;
  working_hours_end: string;
  blocked_dates: string[];
}

const defaultSettings: BookingSettings = {
  max_bookings_per_day: 10,
  min_advance_hours: 24,
  max_advance_days: 30,
  default_duration_minutes: 60,
  auto_confirm_enabled: false,
  send_reminders: true,
  reminder_hours_before: 24,
  allowed_booking_types: ['viewing', 'rental', 'purchase_inquiry'],
  working_hours_start: '09:00',
  working_hours_end: '18:00',
  blocked_dates: [],
};

const BookingManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settings, setSettings] = useState<BookingSettings>(defaultSettings);

  // Fetch all bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('property_bookings')
        .select(`
          *,
          properties:property_id (id, title, location, city, images),
          requester:profiles!property_bookings_user_id_fkey (id, full_name, email, avatar_url, phone)
        `)
        .order('scheduled_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch booking stats
  const { data: stats } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [total, pending, confirmed, completed, cancelled, todayBookings] = await Promise.all([
        supabase.from('property_bookings').select('id', { count: 'exact', head: true }),
        supabase.from('property_bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('property_bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('property_bookings').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('property_bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('property_bookings').select('id', { count: 'exact', head: true }).eq('scheduled_date', today),
      ]);

      return {
        total: total.count || 0,
        pending: pending.count || 0,
        confirmed: confirmed.count || 0,
        completed: completed.count || 0,
        cancelled: cancelled.count || 0,
        today: todayBookings.count || 0,
      };
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) => {
      const updateData: Record<string, any> = { status };
      
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        if (notes) updateData.cancellation_reason = notes;
      }

      const { error } = await supabase
        .from('property_bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
      toast.success('Booking status updated');
      setDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking');
    },
  });

  const filteredBookings = bookings.filter((booking: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.properties?.title?.toLowerCase().includes(searchLower) ||
      booking.requester?.full_name?.toLowerCase().includes(searchLower) ||
      booking.requester?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending: { variant: 'secondary', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
      confirmed: { variant: 'default', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
      completed: { variant: 'default', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
      cancelled: { variant: 'destructive', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
      no_show: { variant: 'outline', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const getBookingTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      viewing: 'Property Viewing',
      rental: 'Rental Inquiry',
      purchase_inquiry: 'Purchase Inquiry',
    };
    return <Badge variant="outline" className="text-xs">{labels[type] || type}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold">Booking Management</h1>
          <p className="text-sm text-muted-foreground">Manage property viewing bookings and settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats?.total || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats?.pending || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Confirmed</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats?.confirmed || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats?.completed || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Cancelled</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats?.cancelled || 0}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <p className="text-xl font-bold mt-1">{stats?.today || 0}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bookings" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            All Bookings
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by property or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.properties?.images?.[0] ? (
                              <img
                                src={booking.properties.images[0]}
                                alt={booking.properties?.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[150px]">
                                {booking.properties?.title || 'Unknown Property'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {booking.properties?.city}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[120px]">
                                {booking.requester?.full_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {booking.requester?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getBookingTypeBadge(booking.booking_type)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(booking.scheduled_date), 'MMM d, yyyy')}</p>
                            <p className="text-xs text-muted-foreground">{booking.scheduled_time}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setDetailsOpen(true); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {booking.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}>
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'completed' })}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'no_show' })}>
                                    <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                                    Mark No Show
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking Settings</CardTitle>
              <CardDescription>Configure booking rules and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Hours Start</Label>
                  <Input
                    type="time"
                    value={settings.working_hours_start}
                    onChange={(e) => setSettings({ ...settings, working_hours_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours End</Label>
                  <Input
                    type="time"
                    value={settings.working_hours_end}
                    onChange={(e) => setSettings({ ...settings, working_hours_end: e.target.value })}
                  />
                </div>
              </div>

              {/* Booking Rules */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Bookings Per Day</Label>
                  <Input
                    type="number"
                    value={settings.max_bookings_per_day}
                    onChange={(e) => setSettings({ ...settings, max_bookings_per_day: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.default_duration_minutes}
                    onChange={(e) => setSettings({ ...settings, default_duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Advance Notice (hours)</Label>
                  <Input
                    type="number"
                    value={settings.min_advance_hours}
                    onChange={(e) => setSettings({ ...settings, min_advance_hours: parseInt(e.target.value) || 24 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Advance Booking (days)</Label>
                  <Input
                    type="number"
                    value={settings.max_advance_days}
                    onChange={(e) => setSettings({ ...settings, max_advance_days: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Auto-Confirm Bookings</p>
                    <p className="text-xs text-muted-foreground">Automatically confirm new booking requests</p>
                  </div>
                  <Switch
                    checked={settings.auto_confirm_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_confirm_enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Send Reminder Emails</p>
                    <p className="text-xs text-muted-foreground">Send email reminders before scheduled viewings</p>
                  </div>
                  <Switch
                    checked={settings.send_reminders}
                    onCheckedChange={(checked) => setSettings({ ...settings, send_reminders: checked })}
                  />
                </div>
                {settings.send_reminders && (
                  <div className="space-y-2 pl-4">
                    <Label>Reminder Hours Before</Label>
                    <Input
                      type="number"
                      value={settings.reminder_hours_before}
                      onChange={(e) => setSettings({ ...settings, reminder_hours_before: parseInt(e.target.value) || 24 })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              <Button className="w-full md:w-auto" onClick={() => toast.success('Settings saved!')}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {/* Property Info */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {selectedBooking.properties?.images?.[0] ? (
                  <img
                    src={selectedBooking.properties.images[0]}
                    alt={selectedBooking.properties?.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedBooking.properties?.title}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {selectedBooking.properties?.city}, {selectedBooking.properties?.location}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Customer Information</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedBooking.requester?.full_name || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedBooking.requester?.email || selectedBooking.contact_email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedBooking.requester?.phone || selectedBooking.contact_phone || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedBooking.booking_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedBooking.scheduled_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedBooking.scheduled_time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedBooking.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(selectedBooking.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm p-2 rounded bg-muted/50">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.cancellation_reason && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cancellation Reason</p>
                  <p className="text-sm p-2 rounded bg-red-50 text-red-700">{selectedBooking.cancellation_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedBooking?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateStatusMutation.mutate({ bookingId: selectedBooking.id, status: 'cancelled' })}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={() => updateStatusMutation.mutate({ bookingId: selectedBooking.id, status: 'confirmed' })}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              </>
            )}
            {selectedBooking?.status === 'confirmed' && (
              <Button onClick={() => updateStatusMutation.mutate({ bookingId: selectedBooking.id, status: 'completed' })}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Completed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;
