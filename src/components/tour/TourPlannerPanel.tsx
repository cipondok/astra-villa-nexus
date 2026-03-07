import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTourPlanner, TourStop } from '@/hooks/useTourPlanner';
import {
  MapPin, Clock, Navigation, Building2, Loader2, Route,
  Car, ChevronRight, Lightbulb, CalendarClock, Ruler,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function useUserSavedProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved-properties-for-tour', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_properties')
        .select('property_id, properties(id, title, city, thumbnail_url, price, property_type)')
        .eq('user_id', user!.id)
        .limit(20);
      return (data || []).map((s: any) => s.properties).filter(Boolean);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export default function TourPlannerPanel() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startHour, setStartHour] = useState('9');
  const [visitDuration, setVisitDuration] = useState('30');
  const [manualId, setManualId] = useState('');

  const savedProps = useUserSavedProperties();
  const mutation = useTourPlanner();
  const result = mutation.data;

  const toggleProperty = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 10 ? [...prev, id] : prev
    );
  };

  const addManualId = () => {
    const trimmed = manualId.trim();
    if (trimmed && !selectedIds.includes(trimmed) && selectedIds.length < 10) {
      setSelectedIds(prev => [...prev, trimmed]);
      setManualId('');
    }
  };

  const handlePlan = () => {
    if (selectedIds.length < 2) return;
    mutation.mutate({
      property_ids: selectedIds,
      start_hour: Number(startHour) || 9,
      visit_duration: Number(visitDuration) || 30,
    });
  };

  const saved = (savedProps.data || []) as any[];

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Route className="h-5 w-5 text-primary" />
            Smart Property Tour Planner
          </CardTitle>
          <CardDescription>Pilih properti dan AI akan merencanakan rute kunjungan optimal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saved properties */}
          {saved.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Properti Tersimpan</label>
              <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {saved.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => toggleProperty(p.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-sm ${
                      selectedIds.includes(p.id)
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Building2 className="h-3 w-3 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground">{p.city}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual ID input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tambah Property ID Manual</label>
            <div className="flex gap-2">
              <Input
                placeholder="Property ID"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManualId()}
              />
              <Button variant="outline" size="sm" onClick={addManualId}>Tambah</Button>
            </div>
          </div>

          {/* Selected count */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedIds.map((id, i) => {
                const p = saved.find((s: any) => s.id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => toggleProperty(id)}
                  >
                    {i + 1}. {p?.title?.slice(0, 20) || id.slice(0, 8)} ✕
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Settings */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Jam Mulai</label>
              <div className="flex gap-2">
                {['8', '9', '10', '11'].map(h => (
                  <Button key={h} variant={startHour === h ? 'default' : 'outline'} size="sm" onClick={() => setStartHour(h)}>
                    {h}:00
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Durasi per Kunjungan</label>
              <div className="flex gap-2">
                {['20', '30', '45', '60'].map(d => (
                  <Button key={d} variant={visitDuration === d ? 'default' : 'outline'} size="sm" onClick={() => setVisitDuration(d)}>
                    {d} min
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handlePlan} disabled={mutation.isPending || selectedIds.length < 2} className="w-full" size="lg">
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Planning route...</>
            ) : (
              <><Navigation className="h-4 w-4" /> Plan Tour ({selectedIds.length} properti)</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard icon={Building2} label="Properti" value={`${result.summary.total_properties}`} />
              <SummaryCard icon={Clock} label="Waktu" value={`${result.summary.start_time} - ${result.summary.end_time}`} />
              <SummaryCard icon={Car} label="Perjalanan" value={`${result.summary.total_travel_minutes} min`} />
              <SummaryCard icon={Ruler} label="Jarak Total" value={`${result.summary.total_distance_km} km`} />
            </div>

            {/* Tour Timeline */}
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" /> Jadwal Kunjungan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {result.tour_plan.map((stop, idx) => (
                  <TourStopCard key={stop.property_id} stop={stop} isLast={idx === result.tour_plan.length - 1} />
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            {result.tips.length > 0 && (
              <Card className="border-primary/30 bg-primary/5 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">Tips Kunjungan</p>
                      {result.tips.map((tip, i) => (
                        <p key={i} className="text-sm text-muted-foreground">• {tip}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function TourStopCard({ stop, isLast }: { stop: TourStop; isLast: boolean }) {
  return (
    <div>
      {/* Stop */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: stop.order * 0.08 }}
        className="flex gap-3 py-3"
      >
        {/* Timeline indicator */}
        <div className="flex flex-col items-center shrink-0 w-8">
          <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{stop.order}</span>
          </div>
          {!isLast && <div className="flex-1 w-px bg-border mt-1" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
              {stop.thumbnail_url ? (
                <img src={stop.thumbnail_url} alt={stop.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{stop.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {stop.city}{stop.area ? `, ${stop.area}` : ''}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" /> {stop.visit_time} - {stop.visit_end}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{stop.property_type}</span>
                {stop.price > 0 && <span className="text-[10px] text-muted-foreground">{formatIDR(stop.price)}</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Travel segment */}
      {!isLast && stop.travel_to_next_min > 0 && (
        <div className="flex gap-3 py-1.5 ml-1">
          <div className="w-8 flex justify-center">
            <div className="w-px bg-border" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            <Car className="h-3 w-3" />
            <span>{stop.travel_to_next_min} min</span>
            <ChevronRight className="h-3 w-3" />
            <span>{stop.distance_to_next_km} km</span>
          </div>
        </div>
      )}
    </div>
  );
}
