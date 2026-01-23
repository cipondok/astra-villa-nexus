import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, ClipboardCheck, MapPin } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SurveyBookingDialogProps {
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  trigger?: React.ReactNode;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

export function SurveyBookingDialog({ propertyId, propertyTitle, propertyLocation, trigger }: SurveyBookingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('property_survey_bookings')
        .insert({
          property_id: propertyId,
          property_title: propertyTitle,
          property_location: propertyLocation || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
          preferred_date: format(selectedDate, 'yyyy-MM-dd'),
          preferred_time: selectedTime,
          message: notes || null,
          status: 'pending',
          survey_type: 'property_inspection',
        });

      if (error) throw error;

      toast({
        title: "Survey Booked!",
        description: "Your property survey has been scheduled. We'll contact you to confirm.",
      });

      setOpen(false);
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
    } catch (error: any) {
      console.error('Survey booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book survey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Book Survey
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Book Property Survey
          </DialogTitle>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground line-clamp-1">{propertyTitle}</p>
            {propertyLocation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {propertyLocation}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name *</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email *</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+62..."
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preferred Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select survey date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preferred Time *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="h-10">
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

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Special Requirements (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific areas to inspect, questions, or requirements..."
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          {/* Info Note */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p>📋 A professional surveyor will inspect the property and provide a detailed report.</p>
            <p className="mt-1">📞 We'll contact you within 24 hours to confirm your appointment.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || !customerName || !customerEmail || isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Booking...' : 'Book Survey'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
