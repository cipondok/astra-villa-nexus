import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  Clock, 
  Video, 
  Shield, 
  CheckCircle,
  Crown,
  Gem,
  Star,
  ExternalLink
} from 'lucide-react';
import { format, addDays, setHours, setMinutes, isBefore, isAfter, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useVideoVerification } from '@/hooks/useVideoVerification';
import { toast } from 'sonner';

interface ScheduleVerificationProps {
  onScheduled?: (sessionId: string) => void;
  calendlyUrl?: string;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

const BENEFITS = [
  { icon: Crown, label: 'Platinum Badge', description: 'Highest trust tier' },
  { icon: Shield, label: 'Premium Trust', description: 'Video verified member' },
  { icon: Star, label: 'Priority Listing', description: 'Properties shown first' },
  { icon: CheckCircle, label: 'Verified Status', description: 'Visible on all listings' },
];

const ScheduleVerification: React.FC<ScheduleVerificationProps> = ({
  onScheduled,
  calendlyUrl,
}) => {
  const { scheduleSession, loading } = useVideoVerification();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [useCalendly, setUseCalendly] = useState(!!calendlyUrl);

  const minDate = addDays(new Date(), 1);
  const maxDate = addDays(new Date(), 30);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

    if (isBefore(scheduledAt, new Date())) {
      toast.error('Please select a future date and time');
      return;
    }

    const session = await scheduleSession(scheduledAt, 'level_4');
    if (session) {
      onScheduled?.(session.id);
    }
  };

  const handleCalendlyClick = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, '_blank');
    }
  };

  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    // Disable weekends
    if (day === 0 || day === 6) return true;
    // Disable past dates and dates too far in future
    if (isBefore(date, startOfDay(minDate))) return true;
    if (isAfter(date, maxDate)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Video className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">Level 4 Video Verification</h2>
              <p className="text-muted-foreground mt-2">
                Complete a live video call with our verification team to unlock premium features 
                and earn the highest trust badge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-4 text-center">
                <Icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <h4 className="font-medium text-sm">{benefit.label}</h4>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scheduling Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Manual Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Schedule Manually
            </CardTitle>
            <CardDescription>
              Choose your preferred date and time slot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSchedule} 
              className="w-full"
              disabled={!selectedDate || !selectedTime || loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Verification'}
            </Button>
          </CardContent>
        </Card>

        {/* Calendly Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Use Calendly
            </CardTitle>
            <CardDescription>
              Schedule through our integrated booking system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Use Calendly for automatic timezone handling and email reminders.
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleCalendlyClick}
              disabled={!calendlyUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Calendly
            </Button>

            {!calendlyUrl && (
              <p className="text-xs text-muted-foreground text-center">
                Calendly integration not configured
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>What You'll Need</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-chart-1 mt-0.5" />
              <div>
                <h4 className="font-medium">Government ID</h4>
                <p className="text-sm text-muted-foreground">
                  Passport, National ID, or Driver's License
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-chart-1 mt-0.5" />
              <div>
                <h4 className="font-medium">Property Documents</h4>
                <p className="text-sm text-muted-foreground">
                  Proof of ownership or agency license
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-chart-1 mt-0.5" />
              <div>
                <h4 className="font-medium">Camera & Microphone</h4>
                <p className="text-sm text-muted-foreground">
                  Working webcam and audio device
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleVerification;
