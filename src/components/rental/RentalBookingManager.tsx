import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Eye,
  Filter
} from "lucide-react";

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
  additional_fees: any;
  total_amount: number;
  deposit_amount: number;
  deposit_status: string;
  booking_status: string;
  payment_status: string;
  contact_method: string;
  contact_details: any;
  special_requests: string;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    location: string;
    property_type: string;
  };
  customer?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const RentalBookingManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['rental-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch bookings where user is either the agent or property owner
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .or(`agent_id.eq.${user.id},owner_id.eq.${user.id}`);
        
      if (!properties?.length) return [];
      
      const propertyIds = properties.map(p => p.id);
      
      const { data, error } = await supabase
        .from('rental_bookings')
        .select(`
          *,
          property:properties(title, location, property_type),
          customer:profiles!rental_bookings_customer_id_fkey(full_name, email, phone)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('rental_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-bookings'] });
      toast({
        title: "Booking updated successfully",
        description: "The booking status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update booking",
        description: "An error occurred while updating the booking.",
        variant: "destructive",
      });
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;
    const matchesSearch = !searchTerm || 
      booking.property?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }) || [];

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    updateBookingMutation.mutate({
      id: bookingId,
      updates: { 
        booking_status: newStatus,
        updated_at: new Date().toISOString()
      }
    });
  };

  const handlePaymentStatusChange = (bookingId: string, newStatus: string) => {
    updateBookingMutation.mutate({
      id: bookingId,
      updates: { 
        payment_status: newStatus,
        updated_at: new Date().toISOString()
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleWhatsAppContact = (booking: RentalBooking) => {
    const phoneNumber = booking.customer?.phone;
    if (!phoneNumber) {
      toast({
        title: "WhatsApp number not available",
        description: "Please use other contact methods.",
        variant: "destructive"
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello ${booking.customer?.full_name}, regarding your booking for "${booking.property?.title}". ` +
      `Check-in: ${format(new Date(booking.check_in_date), 'dd MMMM yyyy', { locale: id })}, ` +
      `Check-out: ${format(new Date(booking.check_out_date), 'dd MMMM yyyy', { locale: id })}. ` +
      `How can I help you?`
    );

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rental Booking Management
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search by property or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' ? 'No bookings available yet.' : `No ${statusFilter} bookings found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.property?.title}</h3>
                      <p className="text-sm text-muted-foreground">{booking.property?.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{booking.customer?.full_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(booking.booking_status)} className="capitalize">
                        {booking.booking_status}
                      </Badge>
                      <Badge variant={getPaymentStatusColor(booking.payment_status)} className="capitalize">
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Check-in:</span>
                      <p className="font-medium">
                        {format(new Date(booking.check_in_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check-out:</span>
                      <p className="font-medium">
                        {format(new Date(booking.check_out_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{booking.total_days} days</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Special Requests:</p>
                      <p className="text-sm text-blue-700">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Booking Type: {booking.booking_type}</span>
                      <span>Contact: {booking.contact_method}</span>
                      <span>Created: {format(new Date(booking.created_at), 'dd MMM yyyy')}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Contact Actions */}
                      {booking.customer?.phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWhatsAppContact(booking)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                      
                      {booking.customer?.phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${booking.customer?.phone}`)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      )}
                      
                      {booking.customer?.email && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`mailto:${booking.customer?.email}`)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      )}

                      {/* Status Actions */}
                      {booking.booking_status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}

                      {booking.booking_status === 'confirmed' && booking.payment_status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePaymentStatusChange(booking.id, 'paid')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Mark Paid
                        </Button>
                      )}

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Property Information</h4>
                <p>{selectedBooking.property?.title}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.property?.location}</p>
              </div>

              <div>
                <h4 className="font-semibold">Customer Information</h4>
                <p>{selectedBooking.customer?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.customer?.email}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.customer?.phone}</p>
              </div>

              <div>
                <h4 className="font-semibold">Booking Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Check-in:</span>
                  <span>{format(new Date(selectedBooking.check_in_date), 'dd MMMM yyyy', { locale: id })}</span>
                  <span>Check-out:</span>
                  <span>{format(new Date(selectedBooking.check_out_date), 'dd MMMM yyyy', { locale: id })}</span>
                  <span>Duration:</span>
                  <span>{selectedBooking.total_days} days</span>
                  <span>Base Price:</span>
                  <span>{formatCurrency(selectedBooking.base_price)}/day</span>
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedBooking.total_amount)}</span>
                  {selectedBooking.deposit_amount > 0 && (
                    <>
                      <span>Deposit:</span>
                      <span>{formatCurrency(selectedBooking.deposit_amount)}</span>
                    </>
                  )}
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <h4 className="font-semibold">Special Requests</h4>
                  <p className="text-sm">{selectedBooking.special_requests}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RentalBookingManager;