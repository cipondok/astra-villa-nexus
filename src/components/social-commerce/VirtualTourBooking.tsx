import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Calendar, Clock, MapPin, User, Mail, Phone,
  CheckCircle2, ArrowRight, Loader2, Building2,
  MonitorPlay, Users, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface VirtualTourBookingProps {
  propertyId: string;
  propertyTitle?: string;
  propertyAddress?: string;
  sourcePlatform?: string;
  onComplete?: (bookingId: string) => void;
}

type BookingType = 'virtual' | 'in_person' | 'hybrid';
type MeetingProvider = 'google_meet' | 'zoom' | 'whatsapp_video';

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

const VirtualTourBooking: React.FC<VirtualTourBookingProps> = ({
  propertyId,
  propertyTitle = 'Property',
  propertyAddress,
  sourcePlatform = 'direct',
  onComplete
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'type' | 'date' | 'details' | 'confirm' | 'success'>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bookingType: 'virtual' as BookingType,
    meetingProvider: 'google_meet' as MeetingProvider,
    selectedDate: '',
    selectedTime: '',
    guestName: profile?.full_name || '',
    guestEmail: user?.email || '',
    guestPhone: profile?.phone || ''
  });

  // Generate available dates (next 14 days, excluding Sundays)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d'),
      dayOfWeek: date.getDay(),
      isAvailable: date.getDay() !== 0 // Exclude Sundays
    };
  }).filter(d => d.isAvailable);

  // Generate time slots
  const timeSlots: TimeSlot[] = [
    { time: '09:00', label: '9:00 AM', available: true },
    { time: '10:00', label: '10:00 AM', available: true },
    { time: '11:00', label: '11:00 AM', available: true },
    { time: '13:00', label: '1:00 PM', available: true },
    { time: '14:00', label: '2:00 PM', available: true },
    { time: '15:00', label: '3:00 PM', available: true },
    { time: '16:00', label: '4:00 PM', available: true },
    { time: '17:00', label: '5:00 PM', available: false }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('virtual_tour_bookings')
        .insert({
          property_id: propertyId,
          user_id: user?.id,
          source_platform: sourcePlatform,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          booking_type: formData.bookingType,
          scheduled_date: formData.selectedDate,
          scheduled_time: formData.selectedTime,
          meeting_provider: formData.meetingProvider,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setBookingId(data.id);
      setStep('success');
      onComplete?.(data.id);

      toast({
        title: "Tour Booked! 🎉",
        description: "You'll receive a confirmation email shortly"
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bookingTypeOptions = [
    {
      value: 'virtual',
      icon: MonitorPlay,
      label: 'Virtual Tour',
      description: 'Video call walkthrough from anywhere'
    },
    {
      value: 'in_person',
      icon: MapPin,
      label: 'In-Person Visit',
      description: 'Visit the property physically'
    },
    {
      value: 'hybrid',
      icon: Users,
      label: 'Hybrid Experience',
      description: 'Virtual preview + in-person visit'
    }
  ];

  const providerOptions = [
    { value: 'google_meet', label: 'Google Meet' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'whatsapp_video', label: 'WhatsApp Video' }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Book a Tour</CardTitle>
              <p className="text-sm text-white/80 mt-1">
                {propertyTitle}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Free
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Booking Type */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-medium">Choose Tour Type</h3>
              
              <RadioGroup
                value={formData.bookingType}
                onValueChange={(v) => setFormData({ ...formData, bookingType: v as BookingType })}
                className="space-y-3"
              >
                {bookingTypeOptions.map((option) => (
                  <Label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.bookingType === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <div className="p-2 rounded-lg bg-muted">
                      <option.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>

              {formData.bookingType !== 'in_person' && (
                <div className="space-y-2">
                  <Label>Preferred Platform</Label>
                  <Select
                    value={formData.meetingProvider}
                    onValueChange={(v) => setFormData({ ...formData, meetingProvider: v as MeetingProvider })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                className="w-full gap-2"
                onClick={() => setStep('date')}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'date' && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date & Time
              </h3>

              {/* Date Selection */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.slice(0, 7).map((date) => (
                  <button
                    key={date.date}
                    onClick={() => setFormData({ ...formData, selectedDate: date.date })}
                    className={cn(
                      "flex-shrink-0 p-3 rounded-xl text-center min-w-[80px] transition-all",
                      formData.selectedDate === date.date
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <div className="text-xs opacity-70">
                      {date.label.split(',')[0]}
                    </div>
                    <div className="font-semibold">
                      {date.label.split(' ')[1]} {date.label.split(' ')[2]}
                    </div>
                  </button>
                ))}
              </div>

              {/* Time Selection */}
              {formData.selectedDate && (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setFormData({ ...formData, selectedTime: slot.time })}
                      className={cn(
                        "p-2 rounded-lg text-sm transition-all",
                        !slot.available && "opacity-50 cursor-not-allowed",
                        formData.selectedTime === slot.time
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('type')}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => setStep('details')}
                  disabled={!formData.selectedDate || !formData.selectedTime}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Details
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input
                    type="tel"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    placeholder="+62 812 3456 7890"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('date')}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => setStep('confirm')}
                  disabled={!formData.guestName || !formData.guestEmail}
                >
                  Review Booking
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-medium">Confirm Your Booking</h3>

              <div className="space-y-3 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{propertyTitle}</div>
                    {propertyAddress && (
                      <div className="text-xs text-muted-foreground">{propertyAddress}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    {format(new Date(formData.selectedDate), 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    {timeSlots.find(s => s.time === formData.selectedTime)?.label} (WIB)
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div className="capitalize">
                    {formData.bookingType.replace('_', ' ')} Tour
                    {formData.bookingType !== 'in_person' && (
                      <span className="text-xs text-muted-foreground ml-1">
                        via {providerOptions.find(p => p.value === formData.meetingProvider)?.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-1/10 text-chart-1 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-chart-1">Tour Booked!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A confirmation email has been sent to {formData.guestEmail}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 text-left">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {format(new Date(formData.selectedDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">
                      {timeSlots.find(s => s.time === formData.selectedTime)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-mono text-xs">{bookingId?.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Add to Calendar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default VirtualTourBooking;
