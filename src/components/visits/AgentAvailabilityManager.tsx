import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAgentAvailability, useSaveAvailability, useAgentVisits } from '@/hooks/usePropertyVisits';
import { Calendar, Clock, Save, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = Array.from({ length: 24 }, (_, h) =>
  [`${String(h).padStart(2, '0')}:00`, `${String(h).padStart(2, '0')}:30`]
).flat();

interface DayConfig {
  enabled: boolean;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

const defaultDay: DayConfig = { enabled: false, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 60 };

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: <AlertCircle className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  no_show: { label: 'No Show', color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="h-3 w-3" /> },
};

export default function AgentAvailabilityManager() {
  const { data: availability = [] } = useAgentAvailability();
  const saveAvailability = useSaveAvailability();
  const { data: visits = [], updateStatus } = useAgentVisits();

  const [days, setDays] = useState<DayConfig[]>(DAYS.map(() => ({ ...defaultDay })));

  useEffect(() => {
    if (availability.length > 0) {
      const newDays = DAYS.map(() => ({ ...defaultDay }));
      availability.forEach(a => {
        newDays[a.day_of_week] = {
          enabled: a.is_available,
          start_time: a.start_time.slice(0, 5),
          end_time: a.end_time.slice(0, 5),
          slot_duration_minutes: a.slot_duration_minutes,
        };
      });
      setDays(newDays);
    }
  }, [availability]);

  const handleSave = () => {
    const slots = days
      .map((d, i) => d.enabled ? {
        day_of_week: i,
        start_time: d.start_time + ':00',
        end_time: d.end_time + ':00',
        is_available: true,
        slot_duration_minutes: d.slot_duration_minutes,
      } : null)
      .filter(Boolean) as any[];
    saveAvailability.mutate(slots);
  };

  const updateDay = (idx: number, updates: Partial<DayConfig>) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, ...updates } : d));
  };

  const upcomingVisits = visits.filter(v => !isPast(parseISO(v.visit_date)) && !['cancelled', 'completed', 'no_show'].includes(v.status));

  return (
    <div className="space-y-4">
      {/* Availability Settings */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {DAYS.map((day, i) => (
            <div key={day} className="flex items-center gap-2 py-1.5 border-b border-border/20 last:border-0">
              <Switch checked={days[i].enabled} onCheckedChange={(v) => updateDay(i, { enabled: v })} className="scale-75" />
              <span className="text-xs font-medium w-16 text-foreground">{day.slice(0, 3)}</span>
              {days[i].enabled ? (
                <div className="flex items-center gap-1 flex-1">
                  <Select value={days[i].start_time} onValueChange={v => updateDay(i, { start_time: v })}>
                    <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground">to</span>
                  <Select value={days[i].end_time} onValueChange={v => updateDay(i, { end_time: v })}>
                    <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={String(days[i].slot_duration_minutes)} onValueChange={v => updateDay(i, { slot_duration_minutes: Number(v) })}>
                    <SelectTrigger className="h-7 text-xs w-16"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30" className="text-xs">30m</SelectItem>
                      <SelectItem value="60" className="text-xs">60m</SelectItem>
                      <SelectItem value="90" className="text-xs">90m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground">Unavailable</span>
              )}
            </div>
          ))}
          <Button onClick={handleSave} className="w-full h-8 text-xs mt-2" disabled={saveAvailability.isPending}>
            {saveAvailability.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
            Save Availability
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Visit Requests */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Visit Requests ({upcomingVisits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {upcomingVisits.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No pending visit requests</p>
          ) : (
            upcomingVisits.map(visit => {
              const config = statusConfig[visit.status] || statusConfig.pending;
              return (
                <div key={visit.id} className="p-2 rounded-lg border border-border/30 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-foreground">
                      {format(parseISO(visit.visit_date), 'EEE, MMM d')} • {visit.start_time.slice(0, 5)}
                    </div>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${config.color} flex items-center gap-0.5`}>
                      {config.icon} {config.label}
                    </Badge>
                  </div>
                  {visit.visitor_name && (
                    <p className="text-[10px] text-muted-foreground">
                      👤 {visit.visitor_name} {visit.visitor_phone && `• ${visit.visitor_phone}`}
                    </p>
                  )}
                  {visit.notes && <p className="text-[10px] text-muted-foreground bg-muted/50 rounded p-1">{visit.notes}</p>}
                  {visit.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-6 text-[10px] flex-1" onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'confirmed' })}>
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] text-destructive flex-1" onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'cancelled' })}>
                        <XCircle className="h-3 w-3 mr-0.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
