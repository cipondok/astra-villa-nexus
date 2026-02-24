import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyVisit } from '@/hooks/usePropertyVisits';
import { isToday, isTomorrow, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import { Bell, Clock } from 'lucide-react';

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
      {reminders.map(({ visit, countdown, isVisitToday }) => (
        <Card
          key={visit.id}
          className={`border-border/30 backdrop-blur-xl ${
            isVisitToday 
              ? 'bg-primary/5 border-primary/20' 
              : 'bg-card/60'
          }`}
        >
          <CardContent className="p-2.5 flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isVisitToday ? 'bg-primary/10' : 'bg-muted'
            }`}>
              {isVisitToday ? <Bell className="h-3.5 w-3.5 text-primary" /> : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-foreground truncate">
                Visit at {visit.start_time.slice(0, 5)}
              </p>
              <p className="text-[10px] text-muted-foreground">{countdown}</p>
            </div>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
              isVisitToday
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {isVisitToday ? 'Today' : 'Tomorrow'}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
