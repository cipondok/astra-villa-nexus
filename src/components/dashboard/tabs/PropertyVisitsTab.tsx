import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMyVisits } from '@/hooks/usePropertyVisits';
import { format, parseISO, isPast } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: <AlertCircle className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  no_show: { label: 'No Show', color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="h-3 w-3" /> },
};

export default function PropertyVisitsTab() {
  const { data: visits = [], isLoading } = useMyVisits();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatTime = (t: string) => t.slice(0, 5);

  const VisitCard = ({ visit }: { visit: typeof visits[0] }) => {
    const config = statusConfig[visit.status] || statusConfig.pending;
    const canCancel = ['pending', 'confirmed'].includes(visit.status) && !isPast(parseISO(visit.visit_date));

    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {format(parseISO(visit.visit_date), 'EEE, MMM d, yyyy')}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {formatTime(visit.start_time)} – {formatTime(visit.end_time)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${config.color} flex items-center gap-0.5`}>
              {config.icon} {config.label}
            </Badge>
          </div>
          {visit.notes && (
            <p className="text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5 line-clamp-2">{visit.notes}</p>
          )}
          {canCancel && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive hover:text-destructive" onClick={() => handleCancel(visit.id)}>
              Cancel Visit
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {/* Upcoming */}
      <div>
        <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" /> Upcoming Visits ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <Card className="bg-card/60 border-border/30">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No upcoming visits scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {upcoming.map(v => <VisitCard key={v.id} visit={v} />)}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Past Visits ({past.length})</h3>
          <div className="space-y-1.5">
            {past.map(v => <VisitCard key={v.id} visit={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}
