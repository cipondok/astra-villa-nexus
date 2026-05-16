import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyVisit } from '@/hooks/usePropertyVisits';
import { isToday, isTomorrow, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import { Bell, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface VisitRemindersProps {
  visits: PropertyVisit[];
}

export default function VisitReminders({ visits }: VisitRemindersProps) {
  const reminders = useMemo(() => {
    const now = new Date();
    return visits
      .filter(v => ['pending', 'confirmed'].includes(v.status))
      .filter(v => {
        const date = parseISO(v.visit_date);
        return isToday(date) || isTomorrow(date);
      })
      .map(v => {
        const date = parseISO(v.visit_date);
        const [h, m] = v.start_time.split(':').map(Number);
        const visitDateTime = new Date(date);
        visitDateTime.setHours(h, m, 0, 0);

        const hoursAway = differenceInHours(visitDateTime, now);
        const minutesAway = differenceInMinutes(visitDateTime, now);
        const isVisitToday = isToday(date);

        let countdown: string;
        if (minutesAway < 0) {
          countdown = 'In progress';
        } else if (minutesAway < 60) {
          countdown = `In ${minutesAway} min`;
        } else if (hoursAway < 24) {
          countdown = `In ${hoursAway}h`;
        } else {
          countdown = `Tomorrow at ${v.start_time.slice(0, 5)}`;
        }

        return { visit: v, countdown, isVisitToday, minutesAway };
      })
      .sort((a, b) => a.minutesAway - b.minutesAway);
  }, [visits]);

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {reminders.map(({ visit, countdown, isVisitToday }, i) => (
        <motion.div
          key={visit.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card
            className={`border-border/30 backdrop-blur-xl transition-all ${
              isVisitToday 
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 shadow-sm shadow-amber-500/5' 
                : 'bg-card/60'
            }`}
          >
            <CardContent className="p-2.5 flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isVisitToday 
                  ? 'bg-gradient-to-br from-amber-500/20 to-yellow-400/10 border border-amber-500/20' 
                  : 'bg-muted'
              }`}>
                {isVisitToday ? <Bell className="h-3.5 w-3.5 text-amber-500" /> : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-foreground truncate">
                  Visit at {visit.start_time.slice(0, 5)}
                </p>
                <p className="text-[10px] text-muted-foreground">{countdown}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isVisitToday
                  ? 'bg-gradient-to-r from-amber-500/15 to-yellow-400/10 text-amber-600 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isVisitToday ? '⚡ Today' : 'Tomorrow'}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
