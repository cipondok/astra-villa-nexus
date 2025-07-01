
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CreditCard, Banknote, Smartphone, Coins } from "lucide-react";
import { format } from "date-fns";
import PaymentInstructions from "./PaymentInstructions";

interface ServiceBookingFormProps {
  service: any;
  onBookingCreated?: (bookingId: string) => void;
}

const ServiceBookingForm = ({ service, onBookingCreated }: ServiceBookingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bookingDate: undefined as Date | undefined,
    bookingTime: '',
    customerNotes: '',
    locationAddress: '',
    contactPhone: '',
    contactEmail: user?.email || '',
    paymentMethod: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    bankCode: '',
    ewalletType: '',
    useAstraToken: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [bookingCreated, setBookingCreated] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const calculateTotal = () => {
    const basePrice = service?.price_range?.min || 0;
    return basePrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book services",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('vendor_bookings')
        .insert({
          vendor_id: service.vendor_id,
          customer_id: user.id,
          service_id: service.id,
          booking_date: formData.bookingDate?.toISOString().split('T')[0],
          booking_time: formData.bookingTime,
          duration_minutes: service.duration_minutes || 60,
          total_amount: calculateTotal(),
          customer_notes: formData.customerNotes,
          location_address: formData.locationAddress,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      setBookingCreated(booking.id);
      
      toast({
        title: "Booking Created",
        description: "Please complete payment to confirm your booking",
      });

    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingCreated) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          bookingId: bookingCreated,
          paymentMethod: formData.paymentMethod,
          amount: calculateTotal(),
          currency: 'IDR',
          bankCode: paymentDetails.bankCode,
          ewalletType: paymentDetails.ewalletType,
          useAstraToken: paymentDetails.useAstraToken
        }
      });

      if (error) throw error;

      setPaymentData(data);

      if (data.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
        onBookingCreated?.(bookingCreated);
      } else {
        toast({
          title: "Payment Instructions",
          description: data.paymentInstructions?.instructions || "Please complete payment",
        });
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirmed = () => {
    onBookingCreated?.(bookingCreated || '');
  };

  if (paymentData) {
    return (
      <PaymentInstructions 
        paymentData={paymentData} 
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Service: {service?.service_name}</CardTitle>
          <CardDescription>
            Fill in the details to book this service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Booking Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.bookingDate ? format(formData.bookingDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.bookingDate}
                    onSelect={(date) => setFormData({...formData, bookingDate: date})}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="bookingTime">Preferred Time</Label>
              <Input
                id="bookingTime"
                type="time"
                value={formData.bookingTime}
                onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+62 xxx xxxx xxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="locationAddress">Service Location</Label>
              <Textarea
                id="locationAddress"
                value={formData.locationAddress}
                onChange={(e) => setFormData({...formData, locationAddress: e.target.value})}
                placeholder="Enter the address where service should be provided"
                required
              />
            </div>

            {/* Customer Notes */}
            <div className="space-y-2">
              <Label htmlFor="customerNotes">Additional Notes</Label>
              <Textarea
                id="customerNotes"
                value={formData.customerNotes}
                onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                placeholder="Any special requirements or notes for the vendor"
              />
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(calculateTotal())}
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Booking..." : "Create Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Options */}
      {bookingCreated && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
            <CardDescription>
              Select your preferred payment method to complete the booking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant={formData.paymentMethod === 'stripe' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, paymentMethod: 'stripe'})}
                className="h-20 flex-col"
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-xs">Credit Card</span>
              </Button>

              <Button
                variant={formData.paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, paymentMethod: 'bank_transfer'})}
                className="h-20 flex-col"
              >
                <Banknote className="h-6 w-6 mb-2" />
                <span className="text-xs">Bank Transfer</span>
              </Button>

              <Button
                variant={formData.paymentMethod === 'ewallet' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, paymentMethod: 'ewallet'})}
                className="h-20 flex-col"
              >
                <Smartphone className="h-6 w-6 mb-2" />
                <span className="text-xs">E-Wallet</span>
              </Button>

              <Button
                variant={formData.paymentMethod === 'astra_token' ? 'default' : 'outline'}
                onClick={() => setFormData({...formData, paymentMethod: 'astra_token'})}
                className="h-20 flex-col"
              >
                <Coins className="h-6 w-6 mb-2" />
                <span className="text-xs">ASTRA Token</span>
              </Button>
            </div>

            {/* Bank Selection for Bank Transfer */}
            {formData.paymentMethod === 'bank_transfer' && (
              <Select onValueChange={(value) => setPaymentDetails({...paymentDetails, bankCode: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="014">BCA</SelectItem>
                  <SelectItem value="008">Mandiri</SelectItem>
                  <SelectItem value="009">BNI</SelectItem>
                  <SelectItem value="002">BRI</SelectItem>
                  <SelectItem value="013">Permata</SelectItem>
                  <SelectItem value="011">Danamon</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* E-Wallet Selection */}
            {formData.paymentMethod === 'ewallet' && (
              <Select onValueChange={(value) => setPaymentDetails({...paymentDetails, ewalletType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select E-Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gopay">GoPay</SelectItem>
                  <SelectItem value="ovo">OVO</SelectItem>
                  <SelectItem value="dana">DANA</SelectItem>
                  <SelectItem value="linkaja">LinkAja</SelectItem>
                  <SelectItem value="shopeepay">ShopeePay</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button 
              onClick={handlePayment} 
              className="w-full" 
              disabled={!formData.paymentMethod || isLoading}
            >
              {isLoading ? "Processing Payment..." : "Complete Payment"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceBookingForm;
