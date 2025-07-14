import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Calendar as CalendarIcon,
  MessageCircle,
  Phone,
  Mail,
  User,
  CreditCard,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  booking_type: string;
  online_booking_enabled: boolean;
  minimum_rental_days: number;
  rental_periods: string[];
  advance_booking_days: number;
  owner_id: string;
  agent_id?: string;
}

interface AgentInfo {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url?: string;
  company_name?: string;
  whatsapp_number?: string;
}

interface PropertyBookingProps {
  property: Property;
  agentInfo?: AgentInfo;
  onBookingSubmit: (bookingData: any) => void;
}

const PropertyBooking: React.FC<PropertyBookingProps> = ({ 
  property, 
  agentInfo,
  onBookingSubmit 
}) => {
  const { toast } = useToast();
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [contactMethod, setContactMethod] = useState<'platform' | 'whatsapp' | 'phone' | 'email'>('platform');
  const [specialRequests, setSpecialRequests] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canBookOnline = property.online_booking_enabled && 
    (property.booking_type === 'astra_villa' || property.booking_type === 'both');

  const totalDays = checkInDate && checkOutDate ? 
    differenceInDays(checkOutDate, checkInDate) : 0;
    
  const totalAmount = totalDays * (property.price || 0);
  const depositAmount = Math.floor(totalAmount * 0.3); // 30% deposit

  const handleWhatsAppContact = () => {
    const phoneNumber = agentInfo?.whatsapp_number || agentInfo?.phone;
    if (!phoneNumber) {
      toast({
        title: "Nomor WhatsApp tidak tersedia",
        description: "Silakan gunakan metode kontak lainnya.",
        variant: "destructive"
      });
      return;
    }

    const message = encodeURIComponent(
      `Halo, saya tertarik dengan properti "${property.title}". ` +
      (checkInDate && checkOutDate ? 
        `Saya ingin sewa dari ${format(checkInDate, 'dd MMMM yyyy', { locale: id })} sampai ${format(checkOutDate, 'dd MMMM yyyy', { locale: id })}. ` : '') +
      `Bisakah kita diskusikan lebih lanjut?`
    );

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBookingSubmit = async () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Tanggal tidak lengkap",
        description: "Silakan pilih tanggal check-in dan check-out.",
        variant: "destructive"
      });
      return;
    }

    if (totalDays < property.minimum_rental_days) {
      toast({
        title: "Durasi sewa tidak mencukupi",
        description: `Minimum sewa adalah ${property.minimum_rental_days} hari.`,
        variant: "destructive"
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Syarat dan ketentuan",
        description: "Harap setujui syarat dan ketentuan terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      property_id: property.id,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_days: totalDays,
      base_price: property.price,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      contact_method: contactMethod,
      special_requests: specialRequests,
      terms_accepted: termsAccepted,
      booking_type: canBookOnline ? 'online' : 'offline'
    };

    try {
      await onBookingSubmit(bookingData);
      toast({
        title: "Booking berhasil diajukan",
        description: canBookOnline ? 
          "Silakan lanjutkan pembayaran untuk mengkonfirmasi booking." :
          "Pemilik akan menghubungi Anda segera untuk konfirmasi.",
      });
    } catch (error) {
      toast({
        title: "Gagal mengajukan booking",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Booking Properti
          </span>
          <div className="flex space-x-2">
            {canBookOnline && (
              <Badge className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Online Booking
              </Badge>
            )}
            {property.booking_type === 'owner_only' && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <User className="h-3 w-3 mr-1" />
                Owner Only
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Check-in</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? (
                    format(checkInDate, "dd MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal masuk</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  disabled={(date) => {
                    const minDate = new Date();
                    minDate.setDate(minDate.getDate() + property.advance_booking_days);
                    return date < minDate;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Check-out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? (
                    format(checkOutDate, "dd MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal keluar</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={(date) => 
                    !checkInDate || 
                    date <= checkInDate ||
                    differenceInDays(date, checkInDate) < property.minimum_rental_days
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Booking Summary */}
        {checkInDate && checkOutDate && totalDays > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Ringkasan Booking</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Durasi sewa:</span>
                <span className="font-medium">{totalDays} hari</span>
              </div>
              <div className="flex justify-between">
                <span>Harga per hari:</span>
                <span className="font-medium">Rp {property.price?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-purple-900 border-t pt-2">
                <span>Total:</span>
                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
              {canBookOnline && (
                <div className="flex justify-between text-sm text-orange-700">
                  <span>Deposit (30%):</span>
                  <span className="font-medium">Rp {depositAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Method */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Metode Kontak</Label>
          <Select value={contactMethod} onValueChange={(value: any) => setContactMethod(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="platform">Melalui Platform ASTRA Villa</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="phone">Telepon</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agent/Owner Contact Info */}
        {agentInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Kontak {agentInfo.company_name ? 'Agent' : 'Pemilik'}</h4>
            <div className="flex items-start space-x-3">
              {agentInfo.avatar_url && (
                <img 
                  src={agentInfo.avatar_url} 
                  alt={agentInfo.full_name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{agentInfo.full_name}</p>
                {agentInfo.company_name && (
                  <p className="text-sm text-gray-600">{agentInfo.company_name}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {agentInfo.whatsapp_number && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleWhatsAppContact}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                  {agentInfo.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${agentInfo.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Telepon
                    </Button>
                  )}
                  {agentInfo.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${agentInfo.email}`)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Requests */}
        <div>
          <Label className="text-sm font-semibold mb-2 block">Permintaan Khusus (Opsional)</Label>
          <Textarea
            placeholder="Contoh: Saya akan tiba larut malam, mohon diatur check-in yang fleksibel..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
          />
        </div>

        {/* Terms Acceptance */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            Saya setuju dengan syarat dan ketentuan sewa, kebijakan pembatalan, dan 
            aturan properti yang berlaku.
          </Label>
        </div>

        {/* Booking Actions */}
        <div className="space-y-3">
          {canBookOnline ? (
            <Button
              onClick={handleBookingSubmit}
              disabled={isSubmitting || !checkInDate || !checkOutDate || !termsAccepted}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Memproses...' : 'Book Sekarang'}
            </Button>
          ) : (
            <Button
              onClick={handleBookingSubmit}
              disabled={isSubmitting || !checkInDate || !checkOutDate || !termsAccepted}
              variant="outline"
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Memproses...' : 'Ajukan Booking ke Pemilik'}
            </Button>
          )}

          {/* WhatsApp Quick Contact */}
          {agentInfo?.whatsapp_number && (
            <Button
              onClick={handleWhatsAppContact}
              variant="outline"
              className="w-full text-green-600 border-green-200 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat WhatsApp Langsung
            </Button>
          )}
        </div>

        {/* Booking Notice */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Catatan Penting:</p>
              <ul className="space-y-1 text-sm">
                <li>• Minimum sewa: {property.minimum_rental_days} hari</li>
                <li>• Booking harus dilakukan {property.advance_booking_days} hari sebelumnya</li>
                {canBookOnline && (
                  <li>• Deposit 30% diperlukan untuk mengkonfirmasi booking</li>
                )}
                <li>• Pembatalan dan pengembalian sesuai kebijakan pemilik</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyBooking;