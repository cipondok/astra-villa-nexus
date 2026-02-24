import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgentVisits, type PropertyVisit } from '@/hooks/usePropertyVisits';
import { format, parseISO, isPast } from 'date-fns';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, UserCheck, UserX } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: <AlertCircle className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  no_show: { label: 'No Show', color: 'bg-muted text-muted-foreground border-border', icon: <XCircle className="h-3 w-3" /> },
};

export default function AgentVisitRequests() {
  const { data: visits = [], isLoading, updateStatus } = useAgentVisits();

  const pending = visits.filter(v => v.status === 'pending' && !isPast(parseISO(v.visit_date)));
  const upcoming = visits.filter(v => v.status === 'confirmed' && !isPast(parseISO(v.visit_date)));
  const past = visits.filter(v => isPast(parseISO(v.visit_date)) || ['cancelled', 'completed', 'no_show'].includes(v.status));

  const formatTime = (t: string) => t.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const VisitRow = ({ visit, showActions }: { visit: PropertyVisit; showActions?: boolean }) => {
    const config = statusConfig[visit.status] || statusConfig.pending;
    const canComplete = visit.status === 'confirmed' && isPast(parseISO(visit.visit_date));
    const canMarkNoShow = visit.status === 'confirmed' && isPast(parseISO(visit.visit_date));

    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardContent className="p-2.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">
                  {format(parseISO(visit.visit_date), 'EEE, MMM d')}
                </p>
                <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatTime(visit.start_time)} – {formatTime(visit.end_time)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${config.color} flex items-center gap-0.5`}>
              {config.icon} {config.label}
            </Badge>
          </div>

          {/* Visitor info */}
          <div className="text-[9px] text-muted-foreground bg-muted/30 rounded p-1.5">
            {visit.visitor_name && <span className="font-medium text-foreground">{visit.visitor_name}</span>}
            {visit.visitor_email && <span className="ml-1">· {visit.visitor_email}</span>}
            {visit.visitor_phone && <span className="ml-1">· {visit.visitor_phone}</span>}
          </div>

          {visit.notes && (
            <p className="text-[9px] text-muted-foreground italic line-clamp-1">"{visit.notes}"</p>
          )}

          {showActions && visit.status === 'pending' && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="h-6 text-[9px] gap-0.5 flex-1"
                onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'confirmed' })}
                disabled={updateStatus.isPending}
              >
                <UserCheck className="h-3 w-3" /> Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[9px] gap-0.5 flex-1 text-destructive hover:text-destructive"
                onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'cancelled' })}
                disabled={updateStatus.isPending}
              >
                <UserX className="h-3 w-3" /> Decline
              </Button>
            </div>
          )}

          {(canComplete || canMarkNoShow) && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="h-6 text-[9px] gap-0.5 flex-1"
                onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'completed' })}
                disabled={updateStatus.isPending}
              >
                <CheckCircle2 className="h-3 w-3" /> Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[9px] gap-0.5 flex-1"
                onClick={() => updateStatus.mutate({ visitId: visit.id, status: 'no_show' })}
                disabled={updateStatus.isPending}
              >
                <XCircle className="h-3 w-3" /> No Show
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {/* Pending Requests */}
      <div>
        <h3 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          Pending Requests
          {pending.length > 0 && (
            <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-amber-500/10 text-amber-600">{pending.length}</Badge>
          )}
        </h3>
        {pending.length === 0 ? (
          <p className="text-[10px] text-muted-foreground py-2">No pending requests</p>
        ) : (
          <div className="space-y-1.5">{pending.map(v => <VisitRow key={v.id} visit={v} showActions />)}</div>
        )}
      </div>

      {/* Upcoming Confirmed */}
      <div>
        <h3 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" />
          Upcoming Confirmed ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-[10px] text-muted-foreground py-2">No upcoming visits</p>
        ) : (
          <div className="space-y-1.5">{upcoming.map(v => <VisitRow key={v.id} visit={v} />)}</div>
        )}
      </div>

      {/* Past Visits */}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">
            Past Visits ({past.length})
          </h3>
          <div className="space-y-1.5">{past.slice(0, 10).map(v => <VisitRow key={v.id} visit={v} />)}</div>
          {past.length > 10 && (
            <p className="text-[9px] text-muted-foreground text-center mt-1">
              +{past.length - 10} more past visits
            </p>
          )}
        </div>
      )}
    </div>
  );
}
