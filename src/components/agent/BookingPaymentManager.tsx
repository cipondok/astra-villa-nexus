import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Building,
  Home,
  CreditCard,
  BanknoteIcon,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

interface VendorBooking {
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
  service: { service_name: string } | null;
  customer: { full_name: string; email: string } | null;
  vendor: { full_name: string; email: string } | null;
}

interface RentalBooking {
  id: string;
  property_id: string;
  customer_id: string;
  agent_id: string;
  booking_type: string;
  check_in_date: string;
  check_out_date: string;
  total_days: number;
  base_price: number;
  total_amount: number;
  deposit_amount: number;
  deposit_status: string;
  booking_status: string;
  payment_status: string;
  contact_method: string;
  special_requests: string;
  created_at: string;
  property?: { title: string; location: string; property_type: string };
  customer?: { full_name: string; email: string; phone: string };
}

interface PaymentLog {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
}

const BookingPaymentManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendorBookings, setVendorBookings] = useState<VendorBooking[]>([]);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('vendor-bookings');

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, statusFilter]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchVendorBookings(),
        fetchRentalBookings(),
        fetchPaymentLogs()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorBookings = async () => {
    // Get vendor services for this agent
    const { data: services } = await supabase
      .from('vendor_services')
      .select('id')
      .eq('vendor_id', user!.id);

    if (!services?.length) {
      setVendorBookings([]);
      return;
    }

    const serviceIds = services.map(s => s.id);

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
        customer:profiles!vendor_bookings_customer_id_fkey(full_name, email),
        vendor:profiles!vendor_bookings_vendor_id_fkey(full_name, email)
      `)
      .in('service_id', serviceIds);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    setVendorBookings(data || []);
  };

  const fetchRentalBookings = async () => {
    // Get properties managed by this agent
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('agent_id', user!.id);

    if (!properties?.length) {
      setRentalBookings([]);
      return;
    }

    const propertyIds = properties.map(p => p.id);

    let query = supabase
      .from('rental_bookings')
      .select(`
        *,
        property:properties(title, location, property_type),
        customer:profiles!rental_bookings_customer_id_fkey(full_name, email, phone)
      `)
      .in('property_id', propertyIds);

    if (statusFilter !== 'all') {
      query = query.eq('booking_status', statusFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    setRentalBookings(data || []);
  };

  const fetchPaymentLogs = async () => {
    // Get all payment logs for both booking types
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setPaymentLogs(data || []);
  };

  const updateVendorBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('vendor_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking status updated"
      });

      fetchVendorBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const updateRentalBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('rental_bookings')
        .update({ booking_status: status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking status updated"
      });

      fetchRentalBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const filteredVendorBookings = vendorBookings.filter(booking =>
    booking.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.service?.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.location_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRentalBookings = rentalBookings.filter(booking =>
    booking.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.property?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Booking & Payment Management</h2>
          <p className="text-muted-foreground">Manage all your bookings and payment transactions</p>
        </div>
        <Button onClick={fetchAllData} className="bg-primary hover:bg-primary/90">
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendor-bookings" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Service Bookings ({vendorBookings.length})
          </TabsTrigger>
          <TabsTrigger value="rental-bookings" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Property Rentals ({rentalBookings.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Logs ({paymentLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* Vendor Bookings Tab */}
        <TabsContent value="vendor-bookings" className="space-y-4">
          {filteredVendorBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Service Bookings</h3>
                <p className="text-muted-foreground">No service bookings found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredVendorBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.service?.service_name || 'Service'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Customer: {booking.customer?.full_name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status?.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.booking_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{booking.location_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{formatCurrency(booking.total_amount)}</span>
                      </div>
                    </div>
                    
                    {booking.customer_notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Customer Notes:</strong> {booking.customer_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {booking.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => updateVendorBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateVendorBookingStatus(booking.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateVendorBookingStatus(booking.id, 'in_progress')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Start Service
                        </Button>
                      )}
                      {booking.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateVendorBookingStatus(booking.id, 'completed')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rental Bookings Tab */}
        <TabsContent value="rental-bookings" className="space-y-4">
          {filteredRentalBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Property Rentals</h3>
                <p className="text-muted-foreground">No rental bookings found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRentalBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.property?.title || 'Property'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Guest: {booking.customer?.full_name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(booking.booking_status)}>
                          {booking.booking_status?.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(booking.check_in_date), 'MMM dd')} - {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.total_days} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{booking.property?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{formatCurrency(booking.total_amount)}</span>
                      </div>
                    </div>
                    
                    {booking.special_requests && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Special Requests:</strong> {booking.special_requests}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {booking.booking_status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => updateRentalBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateRentalBookingStatus(booking.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.booking_status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateRentalBookingStatus(booking.id, 'checked_in')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Check In
                        </Button>
                      )}
                      {booking.booking_status === 'checked_in' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateRentalBookingStatus(booking.id, 'completed')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payment Logs Tab */}
        <TabsContent value="payments" className="space-y-4">
          {paymentLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payment Logs</h3>
                <p className="text-muted-foreground">No payment transactions found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paymentLogs.map((payment) => (
                <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {payment.payment_method === 'bank_transfer' ? (
                            <BanknoteIcon className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_method?.replace('_', ' ').toUpperCase()} • {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {payment.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingPaymentManager;