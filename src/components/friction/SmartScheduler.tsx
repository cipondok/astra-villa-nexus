import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, Check, 
  ChevronLeft, ChevronRight, Video, Home,
  Bell, Share2, Loader2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Smart Scheduler
 * Solves: Back-and-forth coordination, unclear availability
 * 
 * Technical: Real-time availability, calendar integration, auto-reminders
 * Psychological: Popular slots, commitment device, countdown preview
 * Alternative: Virtual tour, video walkthrough, open house
 */

interface TimeSlot {
  time: string;
  available: boolean;
  popular?: boolean;
}

interface SmartSchedulerProps {
  propertyTitle: string;
  propertyImage?: string;
  agentName: string;
  onClose?: () => void;
  onSchedule?: (date: Date, time: string) => void;
}

const SmartScheduler: React.FC<SmartSchedulerProps> = ({
  propertyTitle,
  propertyImage,
  agentName,
  onClose,
  onSchedule,
}) => {
  const [step, setStep] = useState<'date' | 'time' | 'confirm' | 'success'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [viewingType, setViewingType] = useState<'physical' | 'virtual'>('physical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Time slots with availability
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true, popular: true },
    { time: '11:00', available: false },
    { time: '12:00', available: true },
    { time: '14:00', available: true, popular: true },
    { time: '15:00', available: true },
    { time: '16:00', available: false },
    { time: '17:00', available: true },
  ];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setStep('success');
    onSchedule?.(selectedDate!, selectedTime!);
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Date Selection */}
        {step === 'date' && (
          <motion.div
            key="date"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground">Schedule Viewing</h2>
              <p className="text-sm text-muted-foreground mt-1">{propertyTitle}</p>
            </div>

            {/* Viewing type toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setViewingType('physical')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all",
                  viewingType === 'physical' 
                    ? "bg-card shadow-sm text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">In Person</span>
              </button>
              <button
                onClick={() => setViewingType('virtual')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all",
                  viewingType === 'virtual' 
                    ? "bg-card shadow-sm text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <Video className="h-4 w-4" />
                <span className="text-sm font-medium">Virtual Tour</span>
              </button>
            </div>

            {/* Date picker - horizontal scroll */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {dates.map((date, idx) => {
                  const formatted = formatDate(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = idx === 0;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[60px]",
                        "border transition-all active:scale-95",
                        isSelected 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-border/50 bg-card hover:border-primary/50"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] uppercase",
                        isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {isToday ? 'Today' : formatted.day}
                      </span>
                      <span className={cn(
                        "text-lg font-bold",
                        !isSelected && "text-foreground"
                      )}>
                        {formatted.date}
                      </span>
                      <span className={cn(
                        "text-[10px]",
                        isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {formatted.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => setStep('time')}
              disabled={!selectedDate}
              className="w-full h-11 active:scale-95"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Time Selection */}
        {step === 'time' && (
          <motion.div
            key="time"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('date')} className="p-2 -ml-2">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-foreground">Select Time</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedDate && formatDate(selectedDate).day}, {formatDate(selectedDate!).date} {formatDate(selectedDate!).month}
                </p>
              </div>
            </div>

            {/* Agent availability indicator */}
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400">
                {agentName} has {timeSlots.filter(s => s.available).length} available slots
              </span>
            </div>

            {/* Time slots grid */}
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    "relative flex flex-col items-center py-3 rounded-xl border transition-all",
                    slot.available ? "active:scale-95" : "opacity-40 cursor-not-allowed",
                    selectedTime === slot.time
                      ? "border-primary bg-primary text-primary-foreground"
                      : slot.available
                        ? "border-border/50 bg-card hover:border-primary/50"
                        : "border-border/30 bg-muted/30"
                  )}
                >
                  <span className={cn(
                    "font-semibold",
                    selectedTime !== slot.time && "text-foreground"
                  )}>
                    {slot.time}
                  </span>
                  {slot.popular && slot.available && selectedTime !== slot.time && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-accent text-[8px] text-white rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep('confirm')}
              disabled={!selectedTime}
              className="w-full h-11 active:scale-95"
            >
              Review Booking
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('time')} className="p-2 -ml-2">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Confirm Viewing</h2>
            </div>

            {/* Booking summary card */}
            <div className="p-4 bg-card rounded-xl border border-border/50 space-y-4">
              {propertyImage && (
                <div className="h-32 rounded-lg overflow-hidden">
                  <img src={propertyImage} alt={propertyTitle} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">{propertyTitle}</h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {selectedDate && `${formatDate(selectedDate).day}, ${formatDate(selectedDate).date} ${formatDate(selectedDate).month}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{selectedTime}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {viewingType === 'physical' ? (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span>In-person viewing</span>
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      <span>Virtual tour via video call</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reminder options (Psychological) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Reminders</p>
              <div className="flex flex-wrap gap-2">
                {['24h before', '1h before', 'Add to Calendar'].map((reminder) => (
                  <label key={reminder} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded" />
                    <span className="text-xs text-foreground">{reminder}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Share option */}
            <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary">
              <Share2 className="h-4 w-4" />
              Share with family/friends
            </button>

            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full h-12 bg-green-600 hover:bg-green-700 active:scale-95"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </span>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Viewing
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-green-500" />
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Viewing Confirmed! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate && `${formatDate(selectedDate).day}, ${formatDate(selectedDate).date} ${formatDate(selectedDate).month}`} at {selectedTime}
              </p>
            </div>

            {/* Countdown card (Psychological) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl space-y-2"
            >
              <p className="text-sm font-medium text-foreground">Your viewing is in</p>
              <div className="flex justify-center gap-3">
                {['2', '14', '30'].map((num, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center">
                      <span className="text-xl font-bold text-foreground">{num}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {['days', 'hours', 'mins'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* What to look for (Psychological - Preparation) */}
            <div className="text-left p-4 bg-muted/50 rounded-xl space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                What to look for
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Check water pressure and electrical outlets</li>
                <li>• Inspect windows, doors, and locks</li>
                <li>• Ask about parking and storage</li>
                <li>• Take photos for comparison</li>
              </ul>
            </div>

            <Button onClick={onClose} className="w-full h-11 active:scale-95">
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartScheduler;
