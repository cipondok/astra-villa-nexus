import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAgentAvailability, useSaveAvailability, useAgentVisits } from '@/hooks/usePropertyVisits';
import { Calendar, Clock, Save, Loader2, CheckCircle2, XCircle, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: <AlertCircle className="h-3 w-3" /> },
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

  const enabledCount = days.filter(d => d.enabled).length;
  const upcomingVisits = visits.filter(v => !isPast(parseISO(v.visit_date)) && !['cancelled', 'completed', 'no_show'].includes(v.status));
  const pendingCount = upcomingVisits.filter(v => v.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Availability Settings */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
          {/* Gold accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                Weekly Availability
              </span>
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                {enabledCount} days active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1">
            {DAYS.map((day, i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-2 py-2 px-2 rounded-lg border transition-all duration-200 ${
                  days[i].enabled 
                    ? 'border-amber-500/20 bg-gradient-to-r from-amber-500/[0.04] to-transparent' 
                    : 'border-transparent hover:bg-muted/30'
                }`}
              >
                <Switch
                  checked={days[i].enabled}
                  onCheckedChange={(v) => updateDay(i, { enabled: v })}
                  className="scale-75 data-[state=checked]:bg-amber-500"
                />
                <span className={`text-xs font-medium w-12 ${days[i].enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {day.slice(0, 3)}
                </span>
                <AnimatePresence mode="wait">
                  {days[i].enabled ? (
                    <motion.div
                      key="enabled"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Select value={days[i].start_time} onValueChange={v => updateDay(i, { start_time: v })}>
                        <SelectTrigger className="h-7 text-xs w-20 border-amber-500/20"><SelectValue /></SelectTrigger>
                        <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="text-[10px] text-muted-foreground">→</span>
                      <Select value={days[i].end_time} onValueChange={v => updateDay(i, { end_time: v })}>
                        <SelectTrigger className="h-7 text-xs w-20 border-amber-500/20"><SelectValue /></SelectTrigger>
                        <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={String(days[i].slot_duration_minutes)} onValueChange={v => updateDay(i, { slot_duration_minutes: Number(v) })}>
                        <SelectTrigger className="h-7 text-xs w-16 border-amber-500/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30" className="text-xs">30m</SelectItem>
                          <SelectItem value="60" className="text-xs">60m</SelectItem>
                          <SelectItem value="90" className="text-xs">90m</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="disabled"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-muted-foreground/60 italic"
                    >
                      Not available
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            <Button
              onClick={handleSave}
              className="w-full h-9 text-xs mt-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white shadow-md shadow-amber-500/20 border-0"
              disabled={saveAvailability.isPending}
            >
              {saveAvailability.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Availability
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Visit Requests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Card className="bg-card/60 backdrop-blur-xl border-border/30 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-400/20 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                Visit Requests
              </span>
              <div className="flex items-center gap-1.5">
                {pendingCount > 0 && (
                  <Badge className="text-[9px] px-1.5 py-0 bg-amber-500 text-white border-0 animate-pulse">
                    {pendingCount} pending
                  </Badge>
                )}
                <Badge variant="outline" className="text-[9px] bg-muted/50 border-border/50">
                  {upcomingVisits.length} total
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {upcomingVisits.length === 0 ? (
              <div className="text-center py-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-400/10 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-5 w-5 text-amber-500/40" />
                </div>
                <p className="text-xs text-muted-foreground">No pending visit requests</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">New requests will appear here</p>
              </div>
            ) : (
              <AnimatePresence>
                {upcomingVisits.map((visit, idx) => {
                  const config = statusConfig[visit.status] || statusConfig.pending;
                  return (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-2.5 rounded-xl border space-y-2 transition-all ${
                        visit.status === 'pending'
                          ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent shadow-sm shadow-amber-500/5'
                          : 'border-border/30 bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            {format(parseISO(visit.visit_date), 'EEE, MMM d')} • {visit.start_time.slice(0, 5)}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${config.color} flex items-center gap-0.5`}>
                          {config.icon} {config.label}
                        </Badge>
                      </div>
                      {visit.visitor_name && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          {visit.visitor_name} {visit.visitor_phone && `• ${visit.visitor_phone}`}
                        </p>
                      )}
                      {visit.notes && (
                        <p className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg p-1.5 border border-border/20">{visit.notes}</p>
                      )}
                      {visit.status === 'pending' && (
                        <div className="flex gap-1.5 pt-0.5">
                          <Button
                            size="sm"
                            className="h-7 text-[10px] flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white border-0 shadow-sm shadow-amber-500/20"
                            onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'confirmed' })}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10 flex-1"
                            onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'cancelled' })}
                          >
                            <XCircle className="h-3 w-3 mr-0.5" /> Decline
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
