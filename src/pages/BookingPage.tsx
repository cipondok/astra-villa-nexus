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
import BookingSystem from "@/components/booking/BookingSystem";
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
  Minus,
  Navigation as NavigationIcon,
  Building,
  Home,
  Store
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
  
  // Location selection
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
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

    // Validate location selection
    if (!selectedLocation) {
      toast({
        title: "Lokasi Belum Dipilih",
        description: "Mohon pilih lokasi atau gunakan lokasi Anda saat ini.",
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

  const getPropertyTypeIcon = (type: string) => {
    switch(type) {
      case 'virtual_office': return <Building className="h-4 w-4" />;
      case 'office': return <Building className="h-4 w-4" />;
      case 'apartment': return <Home className="h-4 w-4" />;
      case 'house': return <Home className="h-4 w-4" />;
      case 'villa': return <Home className="h-4 w-4" />;
      case 'retail': return <Store className="h-4 w-4" />;
      case 'warehouse': return <Building className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch(type) {
      case 'virtual_office': return 'Virtual Office';
      case 'office': return 'Office Space';
      case 'apartment': return 'Apartment';
      case 'house': return 'House';
      case 'villa': return 'Villa';
      case 'retail': return 'Retail Space';
      case 'warehouse': return 'Warehouse';
      default: return 'Property';
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setSelectedLocation("my_location");
          setLocationLoading(false);
          toast({
            title: "Lokasi Terdeteksi",
            description: "Lokasi Anda telah terdeteksi",
          });
        },
        (error) => {
          setLocationLoading(false);
          toast({
            title: "Tidak Dapat Mengakses Lokasi",
            description: "Mohon izinkan akses lokasi atau pilih lokasi secara manual",
            variant: "destructive"
          });
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Geolocation Tidak Tersedia",
        description: "Browser Anda tidak mendukung geolocation",
        variant: "destructive"
      });
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
            <BookingSystem 
              property={property} 
              onBookingComplete={(bookingId) => {
                navigate(`/booking-success?booking_id=${bookingId}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;