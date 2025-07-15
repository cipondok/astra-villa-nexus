import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { format, differenceInDays, addDays } from "date-fns";
import { 
  Calendar as CalendarIcon,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  User,
  Building,
  Phone,
  Mail
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  property_type: string;
  minimum_rental_days: number;
  images: string[];
  image_urls: string[];
}

interface BookingSystemProps {
  property: Property;
  onBookingComplete?: (bookingId: string) => void;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const BookingSystem = ({ property, onBookingComplete }: BookingSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    idNumber: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const days = differenceInDays(checkOutDate, checkInDate);
      setTotalDays(days);
      
      // Calculate total amount
      const baseAmount = property.price * days;
      const taxAmount = baseAmount * 0.1; // 10% tax
      const serviceCharge = baseAmount * 0.05; // 5% service charge
      setTotalAmount(baseAmount + taxAmount + serviceCharge);
    }
  }, [checkInDate, checkOutDate, property.price]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const validateStep1 = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Tanggal Belum Dipilih",
        description: "Silakan pilih tanggal check-in dan check-out",
        variant: "destructive"
      });
      return false;
    }

    if (totalDays < property.minimum_rental_days) {
      toast({
        title: "Durasi Sewa Kurang",
        description: `Minimum sewa ${property.minimum_rental_days} hari`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'idNumber'];
    const missingFields = requiredFields.filter(field => 
      !customerInfo[field as keyof CustomerInfo]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Data Belum Lengkap",
        description: "Silakan lengkapi semua informasi yang diperlukan",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!paymentMethod) {
      toast({
        title: "Metode Pembayaran Belum Dipilih",
        description: "Silakan pilih metode pembayaran",
        variant: "destructive"
      });
      return false;
    }

    if (!agreementAccepted) {
      toast({
        title: "Syarat & Ketentuan",
        description: "Silakan setujui syarat dan ketentuan",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }

    if (isValid && step < 4) {
      setStep(step + 1);
    } else if (isValid && step === 3) {
      handleBookingSubmit();
    }
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    
    try {
      // Create booking record
      const bookingData = {
        property_id: property.id,
        customer_id: user?.id,
        check_in_date: checkInDate?.toISOString(),
        check_out_date: checkOutDate?.toISOString(),
        total_days: totalDays,
        base_price: property.price,
        total_amount: totalAmount,
        customer_name: customerInfo.fullName,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_id_number: customerInfo.idNumber,
        emergency_contact: customerInfo.emergencyContact,
        emergency_phone: customerInfo.emergencyPhone,
        special_requests: specialRequests,
        payment_method: paymentMethod,
        booking_status: 'pending',
        payment_status: 'pending'
      };

      const { data: booking, error: bookingError } = await supabase
        .from('rental_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Generate invoice
      const { data: invoice, error: invoiceError } = await supabase.functions.invoke('generate-invoice', {
        body: { bookingId: booking.id }
      });

      if (invoiceError) throw invoiceError;

      // Process payment
      if (paymentMethod === 'stripe') {
        const { data: paymentSession, error: paymentError } = await supabase.functions.invoke('create-payment-session', {
          body: {
            bookingId: booking.id,
            amount: totalAmount,
            currency: 'idr',
            customerEmail: customerInfo.email
          }
        });

        if (paymentError) throw paymentError;

        // Redirect to Stripe checkout
        if (paymentSession.url) {
          window.open(paymentSession.url, '_blank');
        }
      }

      setStep(4);
      onBookingComplete?.(booking.id);

      toast({
        title: "Booking Berhasil Dibuat!",
        description: "Booking Anda telah dibuat. Silakan lanjutkan pembayaran.",
      });

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Gagal",
        description: error.message || "Terjadi kesalahan saat memproses booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Pilih Tanggal Sewa</h3>
        <p className="text-muted-foreground">Tentukan periode sewa Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Check-in</label>
          <Calendar
            mode="single"
            selected={checkInDate}
            onSelect={setCheckInDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Check-out</label>
          <Calendar
            mode="single"
            selected={checkOutDate}
            onSelect={setCheckOutDate}
            disabled={(date) => !checkInDate || date <= checkInDate}
            className="rounded-md border"
          />
        </div>
      </div>

      {checkInDate && checkOutDate && (
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Total Durasi: {totalDays} hari</p>
                <p className="text-sm text-muted-foreground">
                  {format(checkInDate, 'dd MMM yyyy')} - {format(checkOutDate, 'dd MMM yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
                <p className="text-sm text-muted-foreground">Total termasuk pajak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Informasi Penyewa</h3>
        <p className="text-muted-foreground">Lengkapi data diri Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nama Lengkap *</label>
          <Input
            value={customerInfo.fullName}
            onChange={(e) => setCustomerInfo(prev => ({...prev, fullName: e.target.value}))}
            placeholder="Masukkan nama lengkap"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Email *</label>
          <Input
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({...prev, email: e.target.value}))}
            placeholder="email@example.com"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Nomor Telepon *</label>
          <Input
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({...prev, phone: e.target.value}))}
            placeholder="+62 xxx xxx xxxx"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Nomor KTP *</label>
          <Input
            value={customerInfo.idNumber}
            onChange={(e) => setCustomerInfo(prev => ({...prev, idNumber: e.target.value}))}
            placeholder="Nomor KTP"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-2 block">Alamat Lengkap *</label>
          <Textarea
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo(prev => ({...prev, address: e.target.value}))}
            placeholder="Alamat lengkap sesuai KTP"
            rows={3}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Kontak Darurat</label>
          <Input
            value={customerInfo.emergencyContact}
            onChange={(e) => setCustomerInfo(prev => ({...prev, emergencyContact: e.target.value}))}
            placeholder="Nama kontak darurat"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Telepon Kontak Darurat</label>
          <Input
            value={customerInfo.emergencyPhone}
            onChange={(e) => setCustomerInfo(prev => ({...prev, emergencyPhone: e.target.value}))}
            placeholder="+62 xxx xxx xxxx"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Permintaan Khusus</label>
        <Textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Tuliskan permintaan khusus jika ada..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Pembayaran & Konfirmasi</h3>
        <p className="text-muted-foreground">Pilih metode pembayaran dan konfirmasi booking</p>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Ringkasan Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Properti:</span>
            <span className="font-medium">{property.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Durasi:</span>
            <span className="font-medium">{totalDays} hari</span>
          </div>
          <div className="flex justify-between">
            <span>Harga per hari:</span>
            <span>{formatCurrency(property.price)}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(property.price * totalDays)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%):</span>
            <span>{formatCurrency(property.price * totalDays * 0.1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Biaya layanan (5%):</span>
            <span>{formatCurrency(property.price * totalDays * 0.05)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <div>
        <label className="text-sm font-medium mb-3 block">Metode Pembayaran</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setPaymentMethod('stripe')}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3" />
              <div>
                <p className="font-medium">Kartu Kredit/Debit</p>
                <p className="text-sm text-muted-foreground">Visa, Mastercard, dll</p>
              </div>
            </div>
          </div>
          
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setPaymentMethod('bank_transfer')}
          >
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-3" />
              <div>
                <p className="font-medium">Transfer Bank</p>
                <p className="text-sm text-muted-foreground">BCA, Mandiri, BNI, BRI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={agreementAccepted}
          onChange={(e) => setAgreementAccepted(e.target.checked)}
          className="mt-1"
        />
        <div className="text-sm">
          <p>
            Saya setuju dengan{" "}
            <a href="#" className="text-blue-600 hover:underline">syarat dan ketentuan</a>
            {" "}serta{" "}
            <a href="#" className="text-blue-600 hover:underline">kebijakan privasi</a>
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Booking Berhasil Dibuat!</h3>
        <p className="text-muted-foreground">
          Booking Anda telah berhasil dibuat. Invoice akan dikirim ke email Anda.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Booking ID:</span>
              <span className="font-mono text-sm">#{Date.now()}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                Menunggu Pembayaran
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Booking {property.title}
        </CardTitle>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-4 mt-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNum}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Kembali
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : step === 3 ? (
                'Buat Booking'
              ) : (
                'Lanjut'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingSystem;