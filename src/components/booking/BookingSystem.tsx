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
import { useAuth } from "@/contexts/AuthContext";
import { format, differenceInDays, addDays } from "date-fns";
import PaymentInstructions from "./PaymentInstructions";
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
  description: string;
  price: number;
  location: string;
  city: string;
  images: string[];
  image_urls: string[];
  property_type?: string;
  rental_periods?: string[];
  minimum_rental_days?: number;
  online_booking_enabled?: boolean;
  booking_type?: string;
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
  const [paymentData, setPaymentData] = useState<any>(null);

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
      // Create booking record — map customer fields into contact_details (jsonb)
      // and payment method into additional_fees metadata per the DB schema
      const bookingData = {
        property_id: property.id,
        customer_id: user?.id,
        check_in_date: checkInDate?.toISOString().split('T')[0],
        check_out_date: checkOutDate?.toISOString().split('T')[0],
        total_days: totalDays,
        base_price: property.price,
        total_amount: totalAmount,
        contact_details: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          idNumber: customerInfo.idNumber,
          emergencyContact: customerInfo.emergencyContact,
          emergencyPhone: customerInfo.emergencyPhone,
        },
        additional_fees: {
          tax: property.price * totalDays * 0.1,
          serviceCharge: property.price * totalDays * 0.05,
          paymentMethod: paymentMethod,
        },
        contact_method: 'online',
        special_requests: specialRequests,
        terms_accepted: agreementAccepted,
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

      // Process payment based on method
      // Process payment for all supported methods via single edge function
      if (paymentMethod) {
        const { data: paymentResult, error: paymentError } = await supabase.functions.invoke('create-booking-payment', {
          body: {
            bookingId: booking.id,
            amount: totalAmount,
            paymentMethod: paymentMethod,
            customerInfo: {
              fullName: customerInfo.fullName,
              email: customerInfo.email,
              phone: customerInfo.phone,
            }
          }
        });

        if (!paymentError && paymentResult?.success) {
          setPaymentData(paymentResult);
        }
      }

      setStep(4);
      onBookingComplete?.(booking.id);

      toast({
        title: "Booking Berhasil Dibuat!",
        description: "Silakan lanjutkan pembayaran sesuai instruksi.",
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
        <Card className="bg-muted/50">
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
        
      {/* Payment Methods - reuse shared selector pattern with themed classes */}
        {[
          { id: 'ovo', label: 'OVO', abbr: 'OVO' },
          { id: 'gopay', label: 'GoPay', abbr: 'GP' },
          { id: 'dana', label: 'DANA', abbr: 'DANA' },
          { id: 'shopeepay', label: 'ShopeePay', abbr: 'SP' },
        ].length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 text-muted-foreground">E-Wallet</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'ovo', label: 'OVO', abbr: 'OVO' },
                { id: 'gopay', label: 'GoPay', abbr: 'GP' },
                { id: 'dana', label: 'DANA', abbr: 'DANA' },
                { id: 'shopeepay', label: 'ShopeePay', abbr: 'SP' },
              ].map((m) => (
                <div
                  key={m.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setPaymentMethod(m.id)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                      <span className="text-foreground text-xs font-bold">{m.abbr}</span>
                    </div>
                    <p className="font-medium">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium mb-2 text-muted-foreground">Transfer Bank</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'bca', label: 'Bank BCA', abbr: 'BCA' },
              { id: 'mandiri', label: 'Bank Mandiri', abbr: 'M' },
              { id: 'bni', label: 'Bank BNI', abbr: 'BNI' },
              { id: 'bri', label: 'Bank BRI', abbr: 'BRI' },
            ].map((m) => (
              <div
                key={m.id}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setPaymentMethod(m.id)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                    <span className="text-foreground text-xs font-bold">{m.abbr}</span>
                  </div>
                  <p className="font-medium">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Kartu Kredit/Debit</p>
          <div className="grid grid-cols-1 gap-3">
            <div
              className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Kartu Kredit/Debit</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, JCB</p>
                </div>
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
          className="mt-1 accent-primary"
        />
        <div className="text-sm">
          <p>
            Saya setuju dengan{" "}
            <a href="#" className="text-primary hover:underline">syarat dan ketentuan</a>
            {" "}serta{" "}
            <a href="#" className="text-primary hover:underline">kebijakan privasi</a>
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    if (paymentData && paymentData.paymentInstructions) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Booking Berhasil Dibuat!</h3>
            <p className="text-muted-foreground mb-6">
              Silakan selesaikan pembayaran sesuai instruksi di bawah ini.
            </p>
          </div>
          
          <PaymentInstructions 
            paymentData={paymentData}
            onPaymentConfirmed={() => {
              toast({
                title: "Pembayaran Dikonfirmasi",
                description: "Terima kasih! Pembayaran Anda sedang diverifikasi.",
              });
            }}
          />
        </div>
      );
    }

    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-primary" />
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
                <span>Status:</span>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Menunggu Pembayaran
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
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