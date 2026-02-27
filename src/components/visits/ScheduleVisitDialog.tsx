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
import { CalendarIcon, Clock, User, Phone, Mail, FileText, Loader2, CheckCircle2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Step indicator
  const steps = [
    { key: 'date', label: 'Date & Time', num: 1 },
    { key: 'details', label: 'Your Details', num: 2 },
    { key: 'success', label: 'Confirmed', num: 3 },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/[0.02] p-0">
        {/* Gold top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        <div className="px-6 pt-4 pb-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/10 border border-amber-500/20 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-amber-500" />
              </div>
              <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                {existingVisitId ? 'Reschedule Visit' : 'Schedule Property Visit'}
              </span>
            </DialogTitle>
            {propertyTitle && (
              <DialogDescription className="text-xs truncate ml-10">{propertyTitle}</DialogDescription>
            )}
          </DialogHeader>

          {/* Step Indicator */}
          {step !== 'success' && (
            <div className="flex items-center gap-2 mt-4 mb-2">
              {steps.slice(0, 2).map((s, i) => (
                <React.Fragment key={s.key}>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                      i <= currentStepIdx
                        ? "bg-gradient-to-br from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {s.num}
                    </div>
                    <span className={cn("text-[11px] font-medium", i <= currentStepIdx ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                  </div>
                  {i === 0 && <div className={cn("flex-1 h-0.5 rounded-full", currentStepIdx >= 1 ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-muted")} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {existingVisitId && existingDate && step !== 'success' && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5 text-[10px] text-muted-foreground mt-2 flex items-center gap-2">
              <Clock className="h-3 w-3 text-amber-500 flex-shrink-0" />
              Original: {existingDate} at {existingTime?.slice(0, 5)}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {step === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-400/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">Visit Booked!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your visit on <strong className="text-foreground">{selectedDate && format(selectedDate, 'PPP')}</strong> at{' '}
                    <strong className="text-foreground">{selectedSlot && formatTime(selectedSlot.start_time)}</strong> is pending confirmation.
                  </p>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-amber-500 inline mr-1" />
                  You'll receive a notification once the agent confirms your visit.
                </div>
                <Button onClick={handleClose} className="mt-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20">
                  Done
                </Button>
              </motion.div>
            ) : step === 'date' ? (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3 text-amber-500" />
                    Select a Date
                  </Label>
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
                    className={cn("p-3 pointer-events-auto rounded-xl border border-border/50 bg-card/80")}
                  />
                </div>

                {selectedDate && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" /> Available Time Slots
                    </Label>
                    {timeSlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3 text-center bg-muted/30 rounded-xl">No available slots for this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.start_time}
                            variant={selectedSlot?.start_time === slot.start_time ? 'default' : 'outline'}
                            size="sm"
                            disabled={!slot.available}
                            className={cn(
                              "text-xs h-9 rounded-lg transition-all",
                              !slot.available && "opacity-30 line-through",
                              selectedSlot?.start_time === slot.start_time
                                ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0 shadow-md shadow-amber-500/20"
                                : "border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5"
                            )}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {formatTime(slot.start_time)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 h-11"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep('details')}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Selected date/time summary */}
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-400/5 border border-amber-500/15 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/10 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xs flex-1">
                    <span className="font-semibold text-foreground">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    <span className="text-muted-foreground ml-1">at {selectedSlot && formatTime(selectedSlot.start_time)}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" onClick={() => setStep('date')}>
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs flex items-center gap-1 mb-1"><User className="h-3 w-3 text-amber-500/70" /> Name</Label>
                    <Input id="name" value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="Your name" className="h-9 text-sm border-border/50 focus:border-amber-500/30 focus:ring-amber-500/20" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs flex items-center gap-1 mb-1"><Phone className="h-3 w-3 text-amber-500/70" /> Phone</Label>
                    <Input id="phone" value={visitorPhone} onChange={e => setVisitorPhone(e.target.value)} placeholder="Phone number" className="h-9 text-sm border-border/50 focus:border-amber-500/30 focus:ring-amber-500/20" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs flex items-center gap-1 mb-1"><Mail className="h-3 w-3 text-amber-500/70" /> Email</Label>
                    <Input id="email" value={visitorEmail} onChange={e => setVisitorEmail(e.target.value)} placeholder="Email address" className="h-9 text-sm border-border/50 focus:border-amber-500/30 focus:ring-amber-500/20" />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-xs flex items-center gap-1 mb-1"><FileText className="h-3 w-3 text-amber-500/70" /> Notes (optional)</Label>
                    <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests..." className="text-sm min-h-[60px] border-border/50 focus:border-amber-500/30 focus:ring-amber-500/20" />
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 h-11"
                  onClick={handleBook}
                  disabled={bookVisit.isPending}
                >
                  {bookVisit.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Confirm Booking
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
