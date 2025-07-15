import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import InvoiceGenerator from "@/components/booking/InvoiceGenerator";
import { 
  CheckCircle, 
  Clock, 
  Download, 
  FileText,
  ArrowLeft,
  Home
} from "lucide-react";

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  
  const [bookingData, setBookingData] = useState<any>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    if (sessionId && bookingId) {
      verifyPaymentAndFetchBooking();
    } else if (bookingId) {
      fetchBookingData();
    }
  }, [sessionId, bookingId]);

  const verifyPaymentAndFetchBooking = async () => {
    try {
      setLoading(true);
      
      // Verify payment with Stripe
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId, bookingId }
      });

      if (verificationError) {
        throw verificationError;
      }

      if (verificationData.success) {
        setPaymentStatus('success');
        await fetchBookingData();
        
        toast({
          title: "Pembayaran Berhasil!",
          description: "Booking Anda telah dikonfirmasi dan dibayar.",
        });
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Pembayaran Gagal",
          description: "Terjadi masalah dengan pembayaran Anda.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('failed');
      toast({
        title: "Error",
        description: "Gagal memverifikasi pembayaran.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      
      // Fetch booking details
      const { data: booking, error: bookingError } = await supabase
        .from('rental_bookings')
        .select(`
          *,
          properties:property_id (
            title,
            location,
            city,
            property_type
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      
      setBookingData(booking);

      // Generate invoice
      const { data: invoice, error: invoiceError } = await supabase.functions.invoke('generate-invoice', {
        body: { bookingId }
      });

      if (!invoiceError && invoice.success) {
        setInvoiceData(invoice.invoiceData);
      }

    } catch (error) {
      console.error('Error fetching booking data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data booking.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Memverifikasi Pembayaran...</h2>
            <p className="text-muted-foreground">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Pembayaran Gagal</h2>
              <p className="text-muted-foreground mb-6">
                Terjadi masalah dengan pembayaran Anda. Silakan coba lagi atau hubungi customer service.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/booking/' + bookingId)}>
                  Coba Lagi
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {paymentStatus === 'success' ? 'Pembayaran Berhasil!' : 'Booking Berhasil Dibuat!'}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            {paymentStatus === 'success' 
              ? 'Terima kasih! Pembayaran Anda telah berhasil diproses.'
              : 'Booking Anda telah berhasil dibuat. Silakan lanjutkan pembayaran.'
            }
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Beranda
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/my-bookings')}>
              <FileText className="h-4 w-4 mr-2" />
              Booking Saya
            </Button>
          </div>
        </div>

        {/* Booking Summary */}
        {bookingData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ringkasan Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Detail Properti</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Properti:</strong> {bookingData.properties?.title}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Lokasi:</strong> {bookingData.properties?.location}, {bookingData.properties?.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Tipe:</strong> {bookingData.properties?.property_type}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Detail Booking</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Booking ID:</strong> {bookingData.id}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Durasi:</strong> {bookingData.total_days} hari
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Total:</strong> {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(bookingData.total_amount)}
                  </p>
                  
                  <div className="flex gap-2">
                    <Badge variant={bookingData.booking_status === 'confirmed' ? 'default' : 'secondary'}>
                      {bookingData.booking_status}
                    </Badge>
                    <Badge variant={bookingData.payment_status === 'paid' ? 'default' : 'outline'}>
                      {bookingData.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice */}
        {invoiceData && (
          <InvoiceGenerator 
            invoiceData={invoiceData}
            onPaymentInitiate={() => {
              // Navigate to payment page if payment is still pending
              if (bookingData?.payment_status !== 'paid') {
                navigate('/payment/' + bookingId);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BookingSuccessPage;