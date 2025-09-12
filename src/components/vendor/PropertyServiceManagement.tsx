import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Star,
  Shield,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const PropertyServiceManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch vendor bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['vendor-property-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('property-services', {
        body: { action: 'get_bookings', role: 'vendor' }
      });
      
      if (error) throw error;
      return data.bookings;
    },
    enabled: !!user
  });

  // Fetch vendor permissions
  const { data: permissions } = useQuery({
    queryKey: ['vendor-service-permissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('property-services', {
        body: { action: 'get_vendor_permissions' }
      });
      
      if (error) throw error;
      return data.permissions;
    },
    enabled: !!user
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ booking_id, status, completion_notes, vendor_response }: any) => {
      const { data, error } = await supabase.functions.invoke('property-services', {
        body: {
          action: 'update_booking_status',
          booking_id,
          status,
          completion_notes,
          vendor_response
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-property-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': AlertCircle,
      'confirmed': CheckCircle,
      'in_progress': Clock,
      'completed': CheckCircle,
      'cancelled': XCircle
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  const handleStatusUpdate = async (booking: any, newStatus: string) => {
    let vendor_response = '';
    let completion_notes = '';

    if (newStatus === 'confirmed') {
      vendor_response = 'Booking confirmed. We will arrive at the scheduled time.';
    } else if (newStatus === 'completed') {
      completion_notes = prompt('Please add completion notes:') || '';
    }

    await updateStatusMutation.mutateAsync({
      booking_id: booking.id,
      status: newStatus,
      completion_notes,
      vendor_response
    });
  };

  const pendingBookings = bookings?.filter((b: any) => b.booking_status === 'pending') || [];
  const activeBookings = bookings?.filter((b: any) => ['confirmed', 'in_progress'].includes(b.booking_status)) || [];
  const completedBookings = bookings?.filter((b: any) => ['completed', 'cancelled'].includes(b.booking_status)) || [];

  if (bookingsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedBookings.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  IDR {completedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Permissions Status */}
      {permissions && permissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Service Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((permission: any) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{permission.property_service_types?.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{permission.property_service_types?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {permission.background_check_status}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {permission.insurance_verified && (
                      <Badge variant="secondary" className="text-xs">Insured</Badge>
                    )}
                    {permission.can_access_property && (
                      <Badge variant="secondary" className="text-xs">Property Access</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Property Service Bookings</CardTitle>
          <CardDescription>Manage your property service bookings and customer requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {pendingBookings.map((booking: any) => (
                  <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{booking.vendor_services?.service_name}</h3>
                          <p className="text-muted-foreground">{booking.vendor_services?.service_description}</p>
                        </div>
                        <Badge className={getStatusColor(booking.booking_status)}>
                          {getStatusIcon(booking.booking_status)}
                          <span className="ml-1 capitalize">{booking.booking_status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.booking_time}</span>
                            <span className="text-muted-foreground">({booking.duration_hours}h)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{booking.service_address}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-lg font-semibold">
                            IDR {booking.total_amount?.toLocaleString()}
                          </p>
                          {booking.special_instructions && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Instructions:</strong> {booking.special_instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking, 'confirmed')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Booking
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(booking, 'cancelled')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pendingBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending bookings at the moment.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {activeBookings.map((booking: any) => (
                  <Card key={booking.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{booking.vendor_services?.service_name}</h3>
                          <p className="text-muted-foreground">{booking.service_address}</p>
                        </div>
                        <Badge className={getStatusColor(booking.booking_status)}>
                          {getStatusIcon(booking.booking_status)}
                          <span className="ml-1 capitalize">{booking.booking_status.replace('_', ' ')}</span>
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        {booking.booking_status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking, 'in_progress')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Start Service
                          </Button>
                        )}
                        {booking.booking_status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking, 'completed')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {activeBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active bookings at the moment.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {completedBookings.map((booking: any) => (
                  <Card key={booking.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{booking.vendor_services?.service_name}</h3>
                          <p className="text-muted-foreground">{booking.service_address}</p>
                          {booking.customer_rating && (
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{booking.customer_rating}/5</span>
                              {booking.customer_review && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  "{booking.customer_review}"
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {getStatusIcon(booking.booking_status)}
                            <span className="ml-1 capitalize">{booking.booking_status}</span>
                          </Badge>
                          <p className="text-lg font-semibold mt-2">
                            IDR {booking.total_amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {completedBookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed bookings yet.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyServiceManagement;