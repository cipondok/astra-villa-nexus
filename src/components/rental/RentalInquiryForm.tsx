import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  CalendarIcon, Home, User, Phone, Mail, MessageSquare, Clock, Users, Loader2, Eye, Key,
} from 'lucide-react';
import { format, addMonths, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';

interface RentalInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  monthlyPrice?: number;
  ownerId?: string;
  agentId?: string;
  inquiryType?: 'viewing' | 'booking';
  children?: React.ReactNode;
}

const RentalInquiryForm: React.FC<RentalInquiryFormProps> = ({
  propertyId, propertyTitle, monthlyPrice, ownerId, agentId, inquiryType = 'booking', children,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [duration, setDuration] = useState('12');
  const [occupants, setOccupants] = useState('1');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [bookingType, setBookingType] = useState<'viewing' | 'booking'>(inquiryType);

  const checkOutDate = moveInDate ? addMonths(moveInDate, parseInt(duration)) : undefined;
  const totalDays = moveInDate && checkOutDate ? differenceInDays(checkOutDate, moveInDate) : 0;
  const totalAmount = monthlyPrice ? monthlyPrice * parseInt(duration) : 0;

  const submitInquiry = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Login diperlukan');
      if (!moveInDate) throw new Error('Tanggal move-in wajib diisi');

      if (bookingType === 'viewing') {
        // Use property_bookings for viewing requests
        const { error } = await supabase.from('property_bookings').insert({
          property_id: propertyId,
          user_id: user.id,
          owner_id: ownerId || null,
          booking_type: 'viewing',
          scheduled_date: format(moveInDate, 'yyyy-MM-dd'),
          scheduled_time: '10:00',
          duration_minutes: 60,
          contact_email: email || null,
          contact_phone: phone || null,
          notes: `Nama: ${fullName}\nJumlah penghuni: ${occupants}\n${message}`,
          status: 'pending',
        });
        if (error) throw error;
      } else {
        // Use rental_bookings for booking requests
        const { error } = await supabase.from('rental_bookings').insert({
          property_id: propertyId,
          customer_id: user.id,
          agent_id: agentId || null,
          booking_type: 'inquiry',
          check_in_date: format(moveInDate, 'yyyy-MM-dd'),
          check_out_date: checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : format(addMonths(moveInDate, 12), 'yyyy-MM-dd'),
          total_days: totalDays || 365,
          base_price: monthlyPrice || 0,
          total_amount: totalAmount || 0,
          deposit_amount: Math.floor((totalAmount || 0) * 0.3),
          contact_method: 'platform',
          contact_details: { full_name: fullName, phone, email, occupants: parseInt(occupants) },
          special_requests: message || null,
          booking_status: 'pending',
          payment_status: 'unpaid',
          terms_accepted: true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rental-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['rental-bookings'] });
      toast.success(bookingType === 'viewing' ? 'Permintaan viewing berhasil dikirim!' : 'Permintaan booking berhasil dikirim!');
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setMoveInDate(undefined);
    setDuration('12');
    setOccupants('1');
    setFullName('');
    setPhone('');
    setEmail('');
    setMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Silakan login terlebih dahulu'); return; }
    if (!moveInDate) { toast.error('Pilih tanggal move-in'); return; }
    if (!fullName.trim()) { toast.error('Nama lengkap wajib diisi'); return; }
    submitInquiry.mutate();
  };

  const isViewing = bookingType === 'viewing';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2 rounded-xl">
            {isViewing ? <Eye className="h-4 w-4" /> : <Key className="h-4 w-4" />}
            {isViewing ? 'Request Viewing' : 'Book Rental'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-primary" />
            {isViewing ? 'Request Viewing' : 'Ajukan Sewa'}
          </DialogTitle>
          <DialogDescription className="text-xs line-clamp-1">{propertyTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setBookingType('viewing')}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
                isViewing ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="h-3.5 w-3.5" /> Request Viewing
            </button>
            <button
              type="button"
              onClick={() => setBookingType('booking')}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
                !isViewing ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Key className="h-3.5 w-3.5" /> Book Rental
            </button>
          </div>

          {/* Move-in / Viewing Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {isViewing ? 'Tanggal Viewing *' : 'Tanggal Move-in *'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left h-10 rounded-xl', !moveInDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {moveInDate ? format(moveInDate, 'dd MMMM yyyy', { locale: idLocale }) : 'Pilih tanggal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={moveInDate}
                  onSelect={setMoveInDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration (only for booking) */}
          {!isViewing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  <Clock className="h-3 w-3 inline mr-1" /> Durasi Sewa
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bulan</SelectItem>
                    <SelectItem value="3">3 Bulan</SelectItem>
                    <SelectItem value="6">6 Bulan</SelectItem>
                    <SelectItem value="12">12 Bulan</SelectItem>
                    <SelectItem value="24">24 Bulan</SelectItem>
                    <SelectItem value="36">36 Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  <Users className="h-3 w-3 inline mr-1" /> Jumlah Penghuni
                </Label>
                <Select value={occupants} onValueChange={setOccupants}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} orang</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Price Summary (only for booking) */}
          {!isViewing && monthlyPrice && monthlyPrice > 0 && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Harga/bulan</span>
                <span className="font-medium">Rp {monthlyPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Durasi</span>
                <span className="font-medium">{duration} bulan</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-primary/10 pt-1 mt-1">
                <span>Estimasi Total</span>
                <span className="text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                <User className="h-3 w-3 inline mr-1" /> Nama Lengkap *
              </Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama lengkap Anda" className="h-10 rounded-xl" required maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  <Phone className="h-3 w-3 inline mr-1" /> No. Telepon
                </Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="h-10 rounded-xl" maxLength={15} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  <Mail className="h-3 w-3 inline mr-1" /> Email
                </Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" className="h-10 rounded-xl" maxLength={100} />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              <MessageSquare className="h-3 w-3 inline mr-1" /> Pesan (Opsional)
            </Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={isViewing ? 'Hal yang ingin Anda tanyakan saat viewing...' : 'Kebutuhan khusus atau pertanyaan...'}
              rows={3}
              className="rounded-xl resize-none"
              maxLength={1000}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-10 rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={submitInquiry.isPending} className="flex-1 h-10 rounded-xl">
              {submitInquiry.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : isViewing ? (
                <Eye className="h-4 w-4 mr-1.5" />
              ) : (
                <Key className="h-4 w-4 mr-1.5" />
              )}
              {isViewing ? 'Kirim Request' : 'Ajukan Sewa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RentalInquiryForm;
