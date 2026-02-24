import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyVisit } from '@/hooks/usePropertyVisits';
import { format } from 'date-fns';
import { isPast, parseISO } from 'date-fns';
import { Clock, Calendar, Download, RefreshCw, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: <AlertCircle className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  no_show: { label: 'No Show', color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="h-3 w-3" /> },
};

function generateICS(visit: PropertyVisit): void {
  const dateStr = visit.visit_date.replace(/-/g, '');
  const startTime = visit.start_time.replace(/:/g, '').slice(0, 4) + '00';
  const endTime = visit.end_time.replace(/:/g, '').slice(0, 4) + '00';
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PropertyVisit//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}T${startTime}`,
    `DTEND:${dateStr}T${endTime}`,
    `SUMMARY:Property Visit`,
    visit.notes ? `DESCRIPTION:${visit.notes}` : '',
    `STATUS:${visit.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `visit-${visit.visit_date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

interface VisitDayDetailProps {
  date: Date;
  visits: PropertyVisit[];
  onCancel: (visitId: string) => void;
  onReschedule?: (visit: PropertyVisit) => void;
}

export default function VisitDayDetail({ date, visits, onCancel, onReschedule }: VisitDayDetailProps) {
  const formatTime = (t: string) => t.slice(0, 5);

  if (visits.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardContent className="p-4 text-center">
          <Calendar className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">No visits on {format(date, 'MMM d, yyyy')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-foreground px-0.5">
        {format(date, 'EEEE, MMM d, yyyy')} — {visits.length} visit{visits.length > 1 ? 's' : ''}
      </h4>
      {visits.map(visit => {
        const config = statusConfig[visit.status] || statusConfig.pending;
        const canCancel = ['pending', 'confirmed'].includes(visit.status) && !isPast(parseISO(visit.visit_date));
        const canReschedule = ['pending', 'confirmed'].includes(visit.status) && !isPast(parseISO(visit.visit_date));

        return (
          <Card key={visit.id} className="bg-card/60 backdrop-blur-xl border-border/30">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {formatTime(visit.start_time)} – {formatTime(visit.end_time)}
                  </span>
                </div>
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${config.color} flex items-center gap-0.5`}>
                  {config.icon} {config.label}
                </Badge>
              </div>

              {visit.notes && (
                <p className="text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5 line-clamp-2">{visit.notes}</p>
              )}

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                  onClick={() => generateICS(visit)}
                >
                  <Download className="h-3 w-3" /> Add to Calendar
                </Button>
                {canReschedule && onReschedule && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => onReschedule(visit)}
                  >
                    <RefreshCw className="h-3 w-3" /> Reschedule
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-destructive hover:text-destructive gap-1"
                    onClick={() => onCancel(visit.id)}
                  >
                    <XCircle className="h-3 w-3" /> Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
