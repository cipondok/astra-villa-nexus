import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Mail, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  total_amount: number;
  status: string;
  payment_status: string;
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
  vendor: {
    full_name: string;
    email: string;
  } | null;
}

const BookingManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const isVendor = profile?.role === 'vendor';

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
          id,
          booking_date,
          booking_time,
          duration_minutes,
          total_amount,
          status,
          payment_status,
          customer_notes,
          vendor_notes,
          location_address,
          contact_phone,
          contact_email,
          service:vendor_services(service_name),
          customer:profiles!customer_id(full_name, email),
          vendor:profiles!vendor_id(full_name, email)
        `);

      if (isVendor) {
        query = query.eq('vendor_id', user.id);
      } else {
        query = query.eq('customer_id', user.id);
      }

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure it matches our Booking interface
      const mappedBookings: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        duration_minutes: booking.duration_minutes,
        total_amount: booking.total_amount,
        status: booking.status,
        payment_status: booking.payment_status || 'pending',
        customer_notes: booking.customer_notes || '',
        vendor_notes: booking.vendor_notes || '',
        location_address: booking.location_address || '',
        contact_phone: booking.contact_phone || '',
        contact_email: booking.contact_email || '',
        service: booking.service,
        customer: booking.customer,
        vendor: booking.vendor
      }));
      
      setBookings(mappedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load bookings",
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
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
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isVendor ? 'My Service Bookings' : 'My Bookings'}
          </h2>
          <p className="text-muted-foreground">
            {isVendor ? 'Manage your service bookings' : 'View and manage your service bookings'}
          </p>
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
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'You have no bookings yet' : `No ${filter} bookings`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {booking.service?.service_name || 'Service'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Booking #{booking.id.slice(0, 8)} • 
                  {isVendor ? ` Customer: ${booking.customer?.full_name || 'Unknown'}` : 
                             ` Vendor: ${booking.vendor?.full_name || 'Unknown'}`}
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
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{booking.contact_phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{booking.contact_email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(booking.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {booking.customer_notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">
                      {isVendor ? 'Customer Notes:' : 'Your Notes:'}
                    </h4>
                    <p className="text-sm text-gray-600">{booking.customer_notes}</p>
                  </div>
                )}
                
                {isVendor && booking.status === 'pending' && (
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
                
                {isVendor && booking.status === 'confirmed' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                    >
                      Start Service
                    </Button>
                  </div>
                )}
                
                {isVendor && booking.status === 'in_progress' && (
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

export default BookingManagement;
