import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { 
  MapPin, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  User,
  Baby,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Plus,
  Minus
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

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

const BookingPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [rentalPeriod, setRentalPeriod] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Company information for virtual office/office space
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    ptNumber: '',
    businessLicense: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    businessType: '',
    needDomicile: false,
    needMailHandling: false
  });

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    calculateTotalPrice();
  }, [checkInDate, checkOutDate, rentalPeriod, property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
      
      // Set default rental period if available
      if (data.rental_periods?.length > 0) {
        setRentalPeriod(data.rental_periods[0]);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data properti.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!property || !checkInDate || !checkOutDate) {
      setTotalPrice(0);
      return;
    }

    const days = differenceInDays(checkOutDate, checkInDate);
    let price = property.price || 0;
    
    switch (rentalPeriod) {
      case 'daily':
        setTotalPrice(price * days);
        break;
      case 'weekly':
        const weeks = Math.ceil(days / 7);
        setTotalPrice(price * weeks);
        break;
      case 'monthly':
        const months = Math.ceil(days / 30);
        setTotalPrice(price * months);
        break;
      case 'yearly':
        const years = Math.ceil(days / 365);
        setTotalPrice(price * years);
        break;
      default:
        setTotalPrice(price * days);
    }
  };

  const handleBooking = async () => {
    if (!property || !checkInDate || !checkOutDate) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon pilih tanggal check-in dan check-out.",
        variant: "destructive",
      });
      return;
    }

    const days = differenceInDays(checkOutDate, checkInDate);
    const minDays = property.minimum_rental_days || 1;
    
    if (days < minDays) {
      toast({
        title: "Periode Terlalu Singkat",
        description: `Minimum sewa ${minDays} hari.`,
        variant: "destructive",
      });
      return;
    }

    // Validate company information for virtual office/office space
    if (property.property_type === 'virtual_office' || property.property_type === 'office') {
      const requiredFields = ['companyName', 'ptNumber', 'businessLicense', 'contactPerson', 'contactEmail', 'contactPhone', 'businessType'];
      const missingFields = requiredFields.filter(field => !companyInfo[field as keyof typeof companyInfo]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Informasi Perusahaan Tidak Lengkap",
          description: "Mohon lengkapi semua informasi perusahaan yang diperlukan.",
          variant: "destructive",
        });
        return;
      }
    }

    setBookingLoading(true);
    
    try {
      // Here you would integrate with your booking system/payment processor
      // For now, we'll simulate the booking process
      
      toast({
        title: "ASTRA Villa Booking",
        description: "Memproses booking Anda...",
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Booking Berhasil!",
        description: "Booking Anda telah dikonfirmasi. Silakan cek email untuk detail.",
      });
      
      // Navigate to booking confirmation or success page
      navigate('/booking-success');
      
    } catch (error) {
      toast({
        title: "Booking Gagal",
        description: "Terjadi kesalahan saat memproses booking Anda.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getRentalPeriodLabel = (period: string) => {
    switch(period) {
      case 'daily': return 'Per Hari';
      case 'weekly': return 'Per Minggu';
      case 'monthly': return 'Per Bulan';
      case 'yearly': return 'Per Tahun';
      default: return 'Per Bulan';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Properti Tidak Ditemukan</h1>
          <Button onClick={() => navigate('/disewa')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Properti
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/disewa')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Properti
          </Button>
          
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Online Booking
            </Badge>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}{property.city && `, ${property.city}`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images */}
          <div className="lg:col-span-2">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
              {property.image_urls?.[0] || property.images?.[0] ? (
                <img 
                  src={property.image_urls?.[0] || property.images?.[0]} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </div>
            
            {/* Property Description */}
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi Properti</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{property.description || "Deskripsi tidak tersedia."}</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Booking Online ASTRA Villa
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Rental Period Selection */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Periode Sewa</label>
                  <Select value={rentalPeriod} onValueChange={setRentalPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih periode sewa" />
                    </SelectTrigger>
                    <SelectContent>
                      {property.rental_periods?.map(period => (
                        <SelectItem key={period} value={period}>
                          {getRentalPeriodLabel(period)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Check-in</label>
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border p-3 pointer-events-auto"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Check-out</label>
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => 
                        date < new Date() || 
                        (checkInDate && date <= checkInDate)
                      }
                      className="rounded-md border p-3 pointer-events-auto"
                    />
                  </div>
                </div>

                {/* Guest Selection - Adults and Children */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold block">Jumlah Tamu</label>
                  
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium">Dewasa</span>
                        <p className="text-xs text-gray-500">Usia 13+</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setAdults(Math.min(10, adults + 1))}
                        disabled={adults >= 10}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Baby className="h-4 w-4 mr-2 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium">Anak-anak</span>
                        <p className="text-xs text-gray-500">Usia 2-12</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setChildren(Math.min(8, children + 1))}
                        disabled={children >= 8}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Total Guest Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Total Tamu:</span>
                      <span className="font-semibold">{adults + children} orang</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {adults} dewasa{children > 0 && `, ${children} anak-anak`}
                    </div>
                  </div>
                </div>

                {/* Company Information for Virtual Office/Office Space */}
                {(property.property_type === 'virtual_office' || property.property_type === 'office') && (
                  <div className="border-t pt-4">
                    <div className="space-y-4">
                      <label className="text-sm font-semibold block">Informasi Perusahaan</label>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Nama Perusahaan *</label>
                          <Input
                            value={companyInfo.companyName}
                            onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))}
                            placeholder="Masukkan nama perusahaan"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">Nomor PT/SIUP *</label>
                          <Input
                            value={companyInfo.ptNumber}
                            onChange={(e) => setCompanyInfo(prev => ({ ...prev, ptNumber: e.target.value }))}
                            placeholder="Masukkan nomor PT/SIUP"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">Izin Usaha *</label>
                          <Input
                            value={companyInfo.businessLicense}
                            onChange={(e) => setCompanyInfo(prev => ({ ...prev, businessLicense: e.target.value }))}
                            placeholder="NIB/SIUP/TDP"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">Nama Penanggung Jawab *</label>
                          <Input
                            value={companyInfo.contactPerson}
                            onChange={(e) => setCompanyInfo(prev => ({ ...prev, contactPerson: e.target.value }))}
                            placeholder="Nama lengkap penanggung jawab"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">Email Perusahaan *</label>
                          <Input
                            type="email"
                            value={companyInfo.contactEmail}
                            onChange={(e) => setCompanyInfo(prev => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="email@perusahaan.com"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">Telepon Perusahaan *</label>
                          <Input
                            value={companyInfo.contactPhone}
                            onChange={(e) => setCompanyInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                            placeholder="021-xxxx-xxxx"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium mb-1 block">Jenis Bisnis *</label>
                          <Select value={companyInfo.businessType} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, businessType: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis bisnis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="teknologi">Teknologi</SelectItem>
                              <SelectItem value="perdagangan">Perdagangan</SelectItem>
                              <SelectItem value="konsultan">Konsultan</SelectItem>
                              <SelectItem value="jasa">Jasa</SelectItem>
                              <SelectItem value="manufaktur">Manufaktur</SelectItem>
                              <SelectItem value="lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Additional Services */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium block">Layanan Tambahan</label>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="domicile"
                              checked={companyInfo.needDomicile}
                              onCheckedChange={(checked) => setCompanyInfo(prev => ({ ...prev, needDomicile: checked as boolean }))}
                            />
                            <label htmlFor="domicile" className="text-xs">
                              Layanan Domisili Usaha
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mail"
                              checked={companyInfo.needMailHandling}
                              onCheckedChange={(checked) => setCompanyInfo(prev => ({ ...prev, needMailHandling: checked as boolean }))}
                            />
                            <label htmlFor="mail" className="text-xs">
                              Layanan Penanganan Surat
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-xs text-amber-700">
                          <strong>Catatan:</strong> Untuk Virtual Office dan Office Space, diperlukan dokumen legalitas perusahaan yang valid. 
                          Dokumen akan diverifikasi setelah booking dikonfirmasi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                {checkInDate && checkOutDate && (
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Harga dasar ({getRentalPeriodLabel(rentalPeriod)})</span>
                        <span>{formatPrice(property.price || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Durasi</span>
                        <span>{differenceInDays(checkOutDate, checkInDate)} hari</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-purple-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Button */}
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleBooking}
                  disabled={!checkInDate || !checkOutDate || bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Book Sekarang - {formatPrice(totalPrice)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Dengan melakukan booking, Anda setuju dengan syarat dan ketentuan ASTRA Villa
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;