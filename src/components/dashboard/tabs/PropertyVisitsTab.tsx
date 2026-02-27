import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMyVisits } from '@/hooks/usePropertyVisits';
import { format, parseISO, isPast } from 'date-fns';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, CalendarDays, List, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import VisitCalendar from '@/components/visits/VisitCalendar';
import VisitReminders from '@/components/visits/VisitReminders';
import ScheduleVisitDialog from '@/components/visits/ScheduleVisitDialog';
import type { PropertyVisit } from '@/hooks/usePropertyVisits';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: <AlertCircle className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  no_show: { label: 'No Show', color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="h-3 w-3" /> },
};

export default function PropertyVisitsTab() {
  const { data: visits = [], isLoading } = useMyVisits();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [rescheduleVisit, setRescheduleVisit] = useState<PropertyVisit | null>(null);

  const handleCancel = async (visitId: string) => {
    const { error } = await supabase
      .from('property_visits')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', visitId)
      .eq('visitor_id', user!.id);
    if (error) {
      toast.error('Failed to cancel visit');
    } else {
      toast.success('Visit cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-visits'] });
    }
  };

  const upcoming = visits.filter(v => !isPast(parseISO(v.visit_date)) && !['cancelled', 'completed', 'no_show'].includes(v.status));
  const past = visits.filter(v => isPast(parseISO(v.visit_date)) || ['cancelled', 'completed', 'no_show'].includes(v.status));

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const formatTime = (t: string) => t.slice(0, 5);

  const VisitCard = ({ visit, index }: { visit: typeof visits[0]; index: number }) => {
    const config = statusConfig[visit.status] || statusConfig.pending;
    const canCancel = ['pending', 'confirmed'].includes(visit.status) && !isPast(parseISO(visit.visit_date));

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="bg-card/70 backdrop-blur-xl border-border/30 hover:border-amber-500/20 hover:shadow-md hover:shadow-amber-500/5 transition-all">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-400/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {format(parseISO(visit.visit_date), 'EEE, MMM d, yyyy')}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-amber-500/60" />
                    {formatTime(visit.start_time)} – {formatTime(visit.end_time)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${config.color} flex items-center gap-0.5`}>
                {config.icon} {config.label}
              </Badge>
            </div>
            {visit.notes && (
              <p className="text-[10px] text-muted-foreground bg-muted/40 rounded-lg p-2 line-clamp-2">{visit.notes}</p>
            )}
            {canCancel && (
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleCancel(visit.id)}>
                  <XCircle className="h-2.5 w-2.5 mr-0.5" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500/20 to-yellow-400/10 flex items-center justify-center">
            <Calendar className="h-3 w-3 text-amber-500" />
          </div>
          My Visits
          {upcoming.length > 0 && (
            <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              {upcoming.length} upcoming
            </Badge>
          )}
        </h3>
        <div className="flex items-center gap-0.5 bg-muted/40 backdrop-blur-sm rounded-lg p-0.5 border border-border/30">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            className={`h-6 text-[10px] px-2 gap-1 rounded-md ${viewMode === 'calendar' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0 shadow-sm' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays className="h-3 w-3" /> Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={`h-6 text-[10px] px-2 gap-1 rounded-md ${viewMode === 'list' ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-0 shadow-sm' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-3 w-3" /> List
          </Button>
        </div>
      </div>

      {/* Reminders */}
      <VisitReminders visits={visits} />

      {viewMode === 'calendar' ? (
        <VisitCalendar
          visits={visits}
          onCancelVisit={handleCancel}
          onRescheduleVisit={setRescheduleVisit}
        />
      ) : (
        <>
          {/* Upcoming */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" /> Upcoming ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <Card className="bg-card/60 border-border/30 border-dashed">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-400/5 border border-amber-500/15 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-amber-500/40" />
                  </div>
                  <p className="text-xs text-muted-foreground">No upcoming visits scheduled</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Browse properties and schedule a visit</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-1.5">
                {upcoming.map((v, i) => <VisitCard key={v.id} visit={v} index={i} />)}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Past Visits ({past.length})</h3>
              <div className="space-y-1.5">
                {past.map((v, i) => <VisitCard key={v.id} visit={v} index={i} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Reschedule Dialog */}
      {rescheduleVisit && (
        <ScheduleVisitDialog
          open={!!rescheduleVisit}
          onOpenChange={(open) => !open && setRescheduleVisit(null)}
          propertyId={rescheduleVisit.property_id}
          agentId={rescheduleVisit.agent_id}
          existingVisitId={rescheduleVisit.id}
          existingDate={rescheduleVisit.visit_date}
          existingTime={rescheduleVisit.start_time}
        />
      )}
    </div>
  );
}
