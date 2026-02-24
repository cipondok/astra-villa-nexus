import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentAvailability, useAgentBlockedDates, useBookVisit, generateTimeSlots, type TimeSlot } from '@/hooks/usePropertyVisits';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, Clock, User, Phone, Mail, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ScheduleVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  agentId: string;
  propertyTitle?: string;
  existingVisitId?: string;
  existingDate?: string;
  existingTime?: string;
}

export default function ScheduleVisitDialog({ open, onOpenChange, propertyId, agentId, propertyTitle, existingVisitId, existingDate, existingTime }: ScheduleVisitDialogProps) {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [visitorName, setVisitorName] = useState(profile?.full_name || '');
  const [visitorPhone, setVisitorPhone] = useState(profile?.phone || '');
  const [visitorEmail, setVisitorEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'date' | 'details' | 'success'>('date');

  const { data: availability = [] } = useAgentAvailability(agentId);
  const { data: blockedDatesData = [] } = useAgentBlockedDates(agentId);
  const bookVisit = useBookVisit();

  const blockedDates = useMemo(() => blockedDatesData.map(d => d.blocked_date), [blockedDatesData]);

  // Fetch existing visits for the agent on selected date
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: existingVisits = [] } = useQuery({
    queryKey: ['agent-date-visits', agentId, dateStr],
    queryFn: async () => {
      if (!dateStr) return [];
      const { data } = await supabase
        .from('property_visits')
        .select('*')
        .eq('agent_id', agentId)
        .eq('visit_date', dateStr)
        .in('status', ['pending', 'confirmed']);
      return data || [];
    },
    enabled: !!dateStr,
  });

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(availability, selectedDate, existingVisits as any, blockedDates);
  }, [selectedDate, availability, existingVisits, blockedDates]);

  const availableDays = useMemo(() => {
    return availability.map(a => a.day_of_week);
  }, [availability]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return;

    // If rescheduling, cancel the old visit first
    if (existingVisitId) {
      const { error: cancelError } = await supabase
        .from('property_visits')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: 'Rescheduled', updated_at: new Date().toISOString() })
        .eq('id', existingVisitId);
      if (cancelError) {
        toast.error('Failed to cancel previous visit');
        return;
      }
    }

    await bookVisit.mutateAsync({
      property_id: propertyId,
      agent_id: agentId,
      visit_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      visitor_name: visitorName || undefined,
      visitor_phone: visitorPhone || undefined,
      visitor_email: visitorEmail || undefined,
      notes: notes || undefined,
    });
    setStep('success');
  };

  const handleClose = () => {
    setStep('date');
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setNotes('');
    onOpenChange(false);
  };

  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4 text-primary" />
            {existingVisitId ? 'Reschedule Visit' : 'Schedule Property Visit'}
          </DialogTitle>
          {propertyTitle && (
            <DialogDescription className="text-xs truncate">{propertyTitle}</DialogDescription>
          )}
          {existingVisitId && existingDate && (
            <div className="bg-muted/50 rounded-md p-2 text-[10px] text-muted-foreground">
              Original: {existingDate} at {existingTime?.slice(0, 5)}
            </div>
          )}
        </DialogHeader>

        {step === 'success' ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-chart-2 mx-auto" />
            <h3 className="font-semibold text-foreground">Visit Booked!</h3>
            <p className="text-sm text-muted-foreground">
              Your visit on <strong>{selectedDate && format(selectedDate, 'PPP')}</strong> at{' '}
              <strong>{selectedSlot && formatTime(selectedSlot.start_time)}</strong> is pending confirmation.
            </p>
            <Button onClick={handleClose} className="mt-4">Done</Button>
          </div>
        ) : step === 'date' ? (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Select a Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  isBefore(date, startOfDay(new Date())) ||
                  !availableDays.includes(date.getDay()) ||
                  blockedDates.includes(format(date, 'yyyy-MM-dd')) ||
                  isBefore(addDays(new Date(), 60), date)
                }
                className={cn("p-3 pointer-events-auto rounded-md border")}
              />
            </div>

            {selectedDate && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Available Time Slots
                </Label>
                {timeSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No available slots for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.start_time}
                        variant={selectedSlot?.start_time === slot.start_time ? 'default' : 'outline'}
                        size="sm"
                        disabled={!slot.available}
                        className={cn(
                          "text-xs h-8",
                          !slot.available && "opacity-40 line-through",
                          selectedSlot?.start_time === slot.start_time && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {formatTime(slot.start_time)}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep('details')}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-foreground">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                <span className="text-muted-foreground ml-1">at {selectedSlot && formatTime(selectedSlot.start_time)}</span>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto text-xs h-7" onClick={() => setStep('date')}>
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor="name" className="text-xs flex items-center gap-1"><User className="h-3 w-3" /> Name</Label>
                <Input id="name" value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="Your name" className="h-8 text-sm" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                <Input id="phone" value={visitorPhone} onChange={e => setVisitorPhone(e.target.value)} placeholder="Phone number" className="h-8 text-sm" />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                <Input id="email" value={visitorEmail} onChange={e => setVisitorEmail(e.target.value)} placeholder="Email address" className="h-8 text-sm" />
              </div>
              <div>
                <Label htmlFor="notes" className="text-xs flex items-center gap-1"><FileText className="h-3 w-3" /> Notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests..." className="text-sm min-h-[60px]" />
              </div>
            </div>

            <Button className="w-full" onClick={handleBook} disabled={bookVisit.isPending}>
              {bookVisit.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Booking
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
