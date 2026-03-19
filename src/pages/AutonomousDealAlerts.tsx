import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Bell, MapPin, TrendingUp, Eye, BookmarkPlus, ArrowRight,
  Filter, SlidersHorizontal, Radio, Shield, Droplets, Target,
  ChevronDown, Clock, BarChart3, MessageSquare, Bookmark, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type AlertType = 'undervalued' | 'price_drop' | 'demand_surge' | 'liquidity' | 'yield' | 'new_listing';

interface DealAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  score: number;
  confidence: number;
  timestamp: string;
  location: string;
  isNew: boolean;
}

const alertMeta: Record<AlertType, { icon: typeof Zap; accent: string; bg: string; border: string }> = {
  undervalued: { icon: Target, accent: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-l-red-500' },
  price_drop: { icon: TrendingUp, accent: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-l-amber-500' },
  demand_surge: { icon: Activity, accent: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-l-blue-500' },
  liquidity: { icon: Droplets, accent: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-l-emerald-500' },
  yield: { icon: BarChart3, accent: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-l-violet-500' },
  new_listing: { icon: Zap, accent: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-500/10', border: 'border-l-teal-500' },
};

const initialAlerts: DealAlert[] = [
  { id: '1', type: 'undervalued', title: 'New undervalued villa detected in Canggu', description: '18% below comparable market transactions. Seller urgency signals detected — high probability of negotiation success.', score: 92, confidence: 87, timestamp: '2 min ago', location: 'Canggu, Bali', isNew: true },
  { id: '2', type: 'price_drop', title: 'Price drop signal triggered for watchlisted asset', description: 'Menteng Townhouse reduced by IDR 400M. Now within target acquisition range for your portfolio profile.', score: 85, confidence: 91, timestamp: '8 min ago', location: 'South Jakarta', isNew: true },
  { id: '3', type: 'demand_surge', title: 'Rental demand surge in North Bandung', description: 'Inquiry volume up 34% week-over-week. Student housing segment showing strongest absorption rate.', score: 78, confidence: 82, timestamp: '15 min ago', location: 'Bandung', isNew: true },
  { id: '4', type: 'liquidity', title: 'High liquidity resale probability alert', description: 'Ubud villa cluster showing 12-day average time-to-sell. Exit confidence at 94% within 3-month window.', score: 88, confidence: 94, timestamp: '22 min ago', location: 'Ubud, Bali', isNew: false },
  { id: '5', type: 'yield', title: 'Above-market yield opportunity identified', description: 'Serviced apartment in Seminyak generating 9.4% net yield — 2.1% above district average.', score: 81, confidence: 79, timestamp: '35 min ago', location: 'Seminyak, Bali', isNew: false },
  { id: '6', type: 'new_listing', title: 'Off-market premium listing surfaced', description: 'Exclusive 4BR villa with ocean view entering pre-market phase. Early-mover advantage window: 72 hours.', score: 95, confidence: 88, timestamp: '41 min ago', location: 'Uluwatu, Bali', isNew: false },
  { id: '7', type: 'undervalued', title: 'Mispriced land parcel in Lombok', description: 'Adjacent plots traded at 2.3x this asking price in Q4. Infrastructure development catalyst within 1km.', score: 89, confidence: 85, timestamp: '1 hr ago', location: 'Kuta Lombok', isNew: false },
  { id: '8', type: 'demand_surge', title: 'Co-living demand spike detected in Surabaya', description: 'Young professional segment driving 28% inquiry growth. Supply constrained with only 4 active listings.', score: 74, confidence: 76, timestamp: '1.5 hr ago', location: 'Surabaya', isNew: false },
];

const locations = ['All Locations', 'Canggu, Bali', 'Ubud, Bali', 'Seminyak, Bali', 'South Jakarta', 'Bandung', 'Surabaya', 'Kuta Lombok'];

const stats = [
  { label: 'Deals Viewed from Alerts', value: '147', delta: '+23 this week', icon: Eye },
  { label: 'Watchlist Conversions', value: '38', delta: '25.8% rate', icon: Bookmark },
  { label: 'Negotiations Initiated', value: '12', delta: '+4 this month', icon: MessageSquare },
];

const AutonomousDealAlerts = () => {
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [scoreThreshold, setScoreThreshold] = useState([70]);
  const [yieldFocus, setYieldFocus] = useState(false);
  const [liquidityFocus, setLiquidityFocus] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulseActive(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = initialAlerts.filter(a => {
    if (selectedLocation !== 'All Locations' && a.location !== selectedLocation) return false;
    if (a.score < scoreThreshold[0]) return false;
    if (yieldFocus && a.type !== 'yield') return false;
    if (liquidityFocus && a.type !== 'liquidity') return false;
    return true;
  });

  const scoreColor = (s: number) => s >= 85 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : s >= 70 ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' : 'text-slate-600 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Radio className="w-5 h-5 text-primary" />
                  </div>
                  <motion.div
                    animate={{ scale: pulseActive ? [1, 1.8, 1] : 1, opacity: pulseActive ? [0.6, 0, 0.6] : 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-lg bg-primary/20"
                  />
                </div>
                <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-[10px] gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE SCANNING
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Deal Signal Alerts</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Real-time opportunity intelligence scanning the property market</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Smart Mode Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{aggressiveMode ? 'Alpha Mode' : 'Passive Mode'}</p>
                  <p className="text-[10px] text-muted-foreground">{aggressiveMode ? 'High frequency signals' : 'Standard alerts'}</p>
                </div>
                <Switch checked={aggressiveMode} onCheckedChange={v => { setAggressiveMode(v); toast.success(v ? 'Aggressive Alpha Mode activated' : 'Switched to Passive Alerts'); }} />
                {aggressiveMode && <Zap className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-5 sticky top-6 space-y-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Alert Filters</h3>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Score Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Min Opportunity Score</label>
                  <span className="text-xs font-bold text-foreground">{scoreThreshold[0]}</span>
                </div>
                <Slider value={scoreThreshold} onValueChange={setScoreThreshold} min={50} max={95} step={5} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">50</span>
                  <span className="text-[10px] text-muted-foreground">95</span>
                </div>
              </div>

              {/* Focus Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">Yield Focus</span>
                  </div>
                  <Switch checked={yieldFocus} onCheckedChange={v => { setYieldFocus(v); if (v) setLiquidityFocus(false); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">Liquidity Focus</span>
                  </div>
                  <Switch checked={liquidityFocus} onCheckedChange={v => { setLiquidityFocus(v); if (v) setYieldFocus(false); }} />
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground">Showing {filtered.length} of {initialAlerts.length} signals</p>
              </div>

              {/* Performance Panel */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Alert Performance</h4>
                <div className="space-y-3">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <stat.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{stat.delta}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Alert Feed */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Signal Feed</h2>
              <Badge variant="outline" className="text-[10px] gap-1.5">
                <Clock className="w-3 h-3" /> Updated just now
              </Badge>
            </div>

            <AnimatePresence>
              {filtered.map((alert, i) => {
                const meta = alertMeta[alert.type];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow border-l-4 ${meta.border} ${
                      alert.isNew ? 'ring-1 ring-primary/10' : ''
                    }`}
                  >
                    {alert.isNew && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] animate-pulse">NEW</Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl ${meta.bg} flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${meta.accent}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground pr-16">{alert.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>

                        <div className="flex items-center gap-4 mt-3">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${scoreColor(alert.score)}`}>
                            <Target className="w-3 h-3" /> {alert.score}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            <span>{alert.confidence}% confidence</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {alert.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                            <Clock className="w-3 h-3" /> {alert.timestamp}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => toast.success('Opening deal analysis...')}>
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Analysis
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success('Deal saved to watchlist')}>
                            <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" /> Save Deal
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success('Entering Deal Room...')}>
                            <ArrowRight className="w-3.5 h-3.5 mr-1.5" /> Deal Room
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-4 w-full h-1 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${alert.confidence}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="p-12 rounded-2xl border border-dashed border-border text-center">
                <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No signals match your current filters. Try adjusting the score threshold or location.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousDealAlerts;
