import React, { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { PropertyVisit } from '@/hooks/usePropertyVisits';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import VisitDayDetail from './VisitDayDetail';

interface VisitCalendarProps {
  visits: PropertyVisit[];
  onCancelVisit: (visitId: string) => void;
  onRescheduleVisit?: (visit: PropertyVisit) => void;
}

export default function VisitCalendar({ visits, onCancelVisit, onRescheduleVisit }: VisitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { confirmedDates, pendingDates, cancelledDates } = useMemo(() => {
    const confirmed: Date[] = [];
    const pending: Date[] = [];
    const cancelled: Date[] = [];

    visits.forEach(v => {
      const date = parseISO(v.visit_date);
      if (v.status === 'confirmed') confirmed.push(date);
      else if (v.status === 'pending') pending.push(date);
      else if (v.status === 'cancelled') cancelled.push(date);
    });

    return { confirmedDates: confirmed, pendingDates: pending, cancelledDates: cancelled };
  }, [visits]);

  const selectedDayVisits = useMemo(() => {
    if (!selectedDate) return [];
    return visits.filter(v => isSameDay(parseISO(v.visit_date), selectedDate));
  }, [visits, selectedDate]);

  const modifiers = {
    confirmed: confirmedDates,
    pending: pendingDates,
    cancelled: cancelledDates,
  };

  const modifiersStyles = {
    confirmed: {
      position: 'relative' as const,
    },
    pending: {
      position: 'relative' as const,
    },
    cancelled: {
      position: 'relative' as const,
    },
  };

  // Custom day content to show colored dots
  const DayContent = ({ date, ...props }: { date: Date; displayMonth: Date }) => {
    const dayVisits = visits.filter(v => isSameDay(parseISO(v.visit_date), date));
    const hasConfirmed = dayVisits.some(v => v.status === 'confirmed');
    const hasPending = dayVisits.some(v => v.status === 'pending');
    const hasCancelled = dayVisits.some(v => v.status === 'cancelled' || v.status === 'completed');

    return (
      <div className="relative flex flex-col items-center">
        <span>{date.getDate()}</span>
        {dayVisits.length > 0 && (
          <div className="flex gap-0.5 absolute -bottom-1">
            {hasConfirmed && <span className="h-1 w-1 rounded-full bg-chart-2" />}
            {hasPending && <span className="h-1 w-1 rounded-full bg-amber-500" />}
            {hasCancelled && <span className="h-1 w-1 rounded-full bg-destructive" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        components={{
          DayContent: DayContent as any,
        }}
        className={cn("p-3 pointer-events-auto rounded-md border border-border/30 bg-card/60 backdrop-blur-xl")}
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-chart-2" /> Confirmed</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Cancelled</span>
      </div>

      {selectedDate && (
        <VisitDayDetail
          date={selectedDate}
          visits={selectedDayVisits}
          onCancel={onCancelVisit}
          onReschedule={onRescheduleVisit}
        />
      )}
    </div>
  );
}
