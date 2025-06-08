import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  total_amount: number;
  status: string;
  customer_notes: string;
  vendor_notes: string;
  location_address: string;
  contact_phone: string;
  contact_email: string;
  service: {
    service_name: string;
  } | null;
  customer: {
    full_name: string;
    email: string;
  } | null;
}

const VendorBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('vendor_bookings')
        .select(`
          *,
          service:vendor_services(service_name),
          customer:profiles(full_name, email)
        `)
        .eq('vendor_id', user.id);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('booking_date', { ascending: false });

      if (error) throw error;

      // Type-safe data handling
      const typedBookings: Booking[] = (data || []).map(booking => {
        // Safe customer handling
        const customerData = booking.customer && 
          typeof booking.customer === 'object' && 
          'full_name' in booking.customer && 
          'email' in booking.customer ? booking.customer : null;

        return {
          id: booking.id,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          duration_minutes: booking.duration_minutes,
          total_amount: booking.total_amount,
          status: booking.status,
          customer_notes: booking.customer_notes,
          vendor_notes: booking.vendor_notes,
          location_address: booking.location_address,
          contact_phone: booking.contact_phone,
          contact_email: booking.contact_email,
          service: booking.service && typeof booking.service === 'object' && 'service_name' in booking.service
            ? { service_name: booking.service.service_name }
            : null,
          customer: customerData ? {
            full_name: customerData.full_name || 'Unknown',
            email: customerData.email || ''
          } : null
        };
      });

      setBookings(typedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('vendor_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${status} successfully`
      });
      
      fetchBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filters = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your service bookings</p>
        </div>
        
        <div className="flex space-x-2">
          {filters.map((filterOption) => (
            <Button
              key={filterOption.value}
              variant={filter === filterOption.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.value)}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'You have no bookings yet' : `No ${filter} bookings`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {booking.service?.service_name}
                  </CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>
                  Booking #{booking.id.slice(0, 8)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                    </div>
                    
                    {booking.booking_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{booking.booking_time}</span>
                      </div>
                    )}
                    
                    {booking.location_address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.location_address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{booking.customer?.full_name || 'Unknown Customer'}</span>
                    </div>
                    
                    {booking.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.contact_email}</span>
                      </div>
                    )}
                    
                    {booking.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {booking.customer_notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Customer Notes:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.customer_notes}
                    </p>
                  </div>
                )}
                
                {booking.total_amount && (
                  <div className="mt-4 text-right">
                    <span className="text-lg font-semibold">
                      ${booking.total_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {booking.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
                
                {booking.status === 'confirmed' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                    >
                      Start Service
                    </Button>
                  </div>
                )}
                
                {booking.status === 'in_progress' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
