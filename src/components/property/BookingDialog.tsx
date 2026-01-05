import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Eye, Key, HelpCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyBooking } from '@/hooks/usePropertyBooking';
import { cn } from '@/lib/utils';

interface BookingDialogProps {
  propertyId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export function BookingDialog({ propertyId, propertyTitle, trigger }: BookingDialogProps) {
  const { user } = useAuth();
  const { createBooking, isCreating } = usePropertyBooking();
  const [open, setOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'viewing' | 'rental' | 'purchase_inquiry'>('viewing');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    createBooking({
      property_id: propertyId,
      booking_type: bookingType,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      scheduled_time: selectedTime,
      notes: notes || undefined,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
    }, {
      onSuccess: () => {
        setOpen(false);
        setSelectedDate(undefined);
        setSelectedTime('');
        setNotes('');
      },
    });
  };

  if (!user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || <Button>Schedule Viewing</Button>}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Please log in to schedule a viewing.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Log In
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Schedule Viewing</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Book a Visit</DialogTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">{propertyTitle}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type of Visit</Label>
            <RadioGroup
              value={bookingType}
              onValueChange={(v) => setBookingType(v as typeof bookingType)}
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="viewing"
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors",
                  bookingType === 'viewing' ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}
              >
                <RadioGroupItem value="viewing" id="viewing" className="sr-only" />
                <Eye className="h-4 w-4" />
                <span className="text-xs">Viewing</span>
              </Label>
              <Label
                htmlFor="rental"
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors",
                  bookingType === 'rental' ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}
              >
                <RadioGroupItem value="rental" id="rental" className="sr-only" />
                <Key className="h-4 w-4" />
                <span className="text-xs">Rental</span>
              </Label>
              <Label
                htmlFor="purchase"
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors",
                  bookingType === 'purchase_inquiry' ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}
              >
                <RadioGroupItem value="purchase_inquiry" id="purchase" className="sr-only" />
                <HelpCircle className="h-4 w-4" />
                <span className="text-xs">Inquiry</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot">
                  {selectedTime && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {selectedTime}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Phone (optional)</Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+62..."
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs">Additional Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requests or questions..."
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
