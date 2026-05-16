import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useAgentBlockedDates } from '@/hooks/usePropertyVisits';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarOff, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AgentBlockedDatesManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: blockedDates = [], isLoading } = useAgentBlockedDates();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);

  const blockedDateStrings = blockedDates.map(d => d.blocked_date);

  const handleAdd = async () => {
    if (!selectedDate || !user) return;
    setAdding(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    if (blockedDateStrings.includes(dateStr)) {
      toast.error('Date already blocked');
      setAdding(false);
      return;
    }

    const { error } = await supabase
      .from('agent_blocked_dates')
      .insert({ agent_id: user.id, blocked_date: dateStr, reason: reason || null });

    if (error) {
      toast.error('Failed to block date');
    } else {
      toast.success(`Blocked ${format(selectedDate, 'MMM d, yyyy')}`);
      queryClient.invalidateQueries({ queryKey: ['agent-blocked-dates'] });
      setSelectedDate(undefined);
      setReason('');
    }
    setAdding(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase
      .from('agent_blocked_dates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to unblock date');
    } else {
      toast.success('Date unblocked');
      queryClient.invalidateQueries({ queryKey: ['agent-blocked-dates'] });
    }
  };

  const blockedModifiers = blockedDates.map(d => new Date(d.blocked_date + 'T00:00:00'));

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/30">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
          <CalendarOff className="h-3.5 w-3.5 text-destructive" />
          Blocked Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => isBefore(date, startOfDay(new Date()))}
          modifiers={{ blocked: blockedModifiers }}
          modifiersStyles={{
            blocked: { backgroundColor: 'hsl(var(--destructive) / 0.15)', color: 'hsl(var(--destructive))' },
          }}
          className={cn("p-3 pointer-events-auto rounded-md border border-border/30")}
        />

        {selectedDate && !blockedDateStrings.includes(format(selectedDate, 'yyyy-MM-dd')) && (
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Reason (optional)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="h-7 text-xs flex-1"
            />
            <Button size="sm" className="h-7 text-[10px] gap-1" onClick={handleAdd} disabled={adding}>
              {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Block
            </Button>
          </div>
        )}

        {blockedDates.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">Blocked dates:</p>
            {blockedDates
              .sort((a, b) => a.blocked_date.localeCompare(b.blocked_date))
              .map(bd => (
                <div key={bd.id} className="flex items-center justify-between p-1.5 bg-destructive/5 rounded-md">
                  <div>
                    <span className="text-[10px] font-medium text-foreground">
                      {format(new Date(bd.blocked_date + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                    </span>
                    {bd.reason && (
                      <span className="text-[9px] text-muted-foreground ml-1.5">— {bd.reason}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(bd.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
