import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgentAvailability, useSaveAvailability, type AgentAvailability } from '@/hooks/usePropertyVisits';
import { Clock, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const HALF_HOURS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const DURATIONS = [15, 30, 45, 60, 90, 120];

interface SlotDraft {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration_minutes: number;
}

export default function AgentAvailabilityManager() {
  const { data: existing = [], isLoading } = useAgentAvailability();
  const saveAvailability = useSaveAvailability();

  const [slots, setSlots] = useState<SlotDraft[]>(() => {
    if (existing.length > 0) {
      return existing.map(e => ({
        day_of_week: e.day_of_week,
        start_time: e.start_time,
        end_time: e.end_time,
        is_available: e.is_available,
        slot_duration_minutes: e.slot_duration_minutes,
      }));
    }
    // Default: Mon-Fri 9-17
    return [1, 2, 3, 4, 5].map(d => ({
      day_of_week: d,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
      slot_duration_minutes: 30,
    }));
  });

  // Sync from server when data loads
  React.useEffect(() => {
    if (existing.length > 0) {
      setSlots(existing.map(e => ({
        day_of_week: e.day_of_week,
        start_time: e.start_time,
        end_time: e.end_time,
        is_available: e.is_available,
        slot_duration_minutes: e.slot_duration_minutes,
      })));
    }
  }, [existing]);

  const addSlot = () => {
    setSlots(prev => [...prev, {
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
      slot_duration_minutes: 30,
    }]);
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof SlotDraft, value: any) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    const activeSlots = slots.filter(s => s.is_available);
    saveAvailability.mutate(activeSlots, {
      onSuccess: () => toast.success('Availability saved successfully'),
    });
  };

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Weekly Availability
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={addSlot}>
              <Plus className="h-3 w-3" /> Add Slot
            </Button>
            <Button size="sm" className="h-6 text-[10px] gap-1" onClick={handleSave} disabled={saveAvailability.isPending}>
              {saveAvailability.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {slots.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No availability slots. Click "Add Slot" to start.</p>
        ) : (
          slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-1.5 p-2 bg-muted/30 rounded-md">
              <Switch
                checked={slot.is_available}
                onCheckedChange={(v) => updateSlot(i, 'is_available', v)}
                className="scale-75"
              />
              <Select value={String(slot.day_of_week)} onValueChange={(v) => updateSlot(i, 'day_of_week', Number(v))}>
                <SelectTrigger className="h-7 text-[10px] w-16 px-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, di) => (
                    <SelectItem key={di} value={String(di)} className="text-xs">{SHORT_DAYS[di]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={slot.start_time} onValueChange={(v) => updateSlot(i, 'start_time', v)}>
                <SelectTrigger className="h-7 text-[10px] w-[68px] px-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HALF_HOURS.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground">–</span>
              <Select value={slot.end_time} onValueChange={(v) => updateSlot(i, 'end_time', v)}>
                <SelectTrigger className="h-7 text-[10px] w-[68px] px-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HALF_HOURS.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(slot.slot_duration_minutes)} onValueChange={(v) => updateSlot(i, 'slot_duration_minutes', Number(v))}>
                <SelectTrigger className="h-7 text-[10px] w-[56px] px-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map(d => (
                    <SelectItem key={d} value={String(d)} className="text-xs">{d}m</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => removeSlot(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
