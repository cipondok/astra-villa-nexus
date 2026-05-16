import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Bookmark, ArrowLeft, TrendingUp, TrendingDown, Minus, Bell, BellOff, Star,
  Home, MapPin, ChevronRight, Plus, Sparkles, Filter, ArrowUpDown, Lock,
  Bed, Bath, Square, Eye, Trash2, FolderPlus, Loader2, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import {
  useWatchlistItems, useWatchlistCategories, useCreateWatchlistCategory,
  useDeleteWatchlistCategory, useToggleWatchlist, useClearWatchlistAlerts,
  AI_REC_CONFIG, WatchlistItem, WatchlistFilter, WatchlistSort,
} from '@/hooks/useInvestorWatchlist';
import { SEOHead } from '@/components/SEOHead';

const ScoreArrow = ({ change }: { change: number }) => {
  if (change > 0) return <TrendingUp className="h-3 w-3 text-chart-2" />;
  if (change < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const PriceChange = ({ pct }: { pct: number }) => {
  if (Math.abs(pct) < 0.5) return <span className="text-[10px] text-muted-foreground">—</span>;
  const isDown = pct < 0;
  return (
    <span className={cn('text-[10px] font-medium', isDown ? 'text-chart-2' : 'text-destructive')}>
      {isDown ? '▼' : '▲'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
};

const InvestorWatchlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const formatPrice = getCurrencyFormatterShort();

  const [filter, setFilter] = useState<WatchlistFilter>('all');
  const [sort, setSort] = useState<WatchlistSort>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [catDialogOpen, setCatDialogOpen] = useState(false);

  const { data: items = [], isLoading } = useWatchlistItems(filter, sort, selectedCategory);
  const { data: categories = [] } = useWatchlistCategories();
  const createCategory = useCreateWatchlistCategory();
  const deleteCategory = useDeleteWatchlistCategory();
  const toggleWatchlist = useToggleWatchlist();
  const clearAlerts = useClearWatchlistAlerts();

  const alertCount = items.filter(i => i.has_new_alert).length;
  const eliteCount = items.filter(i => (i.property?.opportunity_score || 0) >= 85).length;
  const strongBuyCount = items.filter(i => i.ai_recommendation === 'strong_buy').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="rounded-2xl max-w-sm w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-lg font-bold">Login Diperlukan</h2>
            <p className="text-sm text-muted-foreground">Masuk untuk mengakses investor watchlist Anda</p>
            <Button onClick={() => navigate('/auth')} className="rounded-xl w-full">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    createCategory.mutate({ name: newCatName.trim(), color: newCatColor });
    setNewCatName('');
    setCatDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Investor Watchlist" description="Track investment opportunities with AI-powered alerts and score monitoring." noIndex />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Investor Watchlist
            </h1>
            <p className="text-[10px] text-muted-foreground">Track & monitor investment opportunities</p>
          </div>
          {alertCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-xl" onClick={() => clearAlerts.mutate()}>
              <BellOff className="h-3 w-3" /> Clear {alertCount}
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl space-y-4">
        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: items.length, color: 'text-foreground' },
            { label: 'Elite', value: eliteCount, color: 'text-amber-400' },
            { label: 'Strong Buy', value: strongBuyCount, color: 'text-chart-2' },
            { label: 'Alerts', value: alertCount, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label} className="rounded-2xl border-border/30">
              <CardContent className="p-2.5 text-center">
                <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categories + Create */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-[10px] rounded-full shrink-0"
            onClick={() => setSelectedCategory(undefined)}
          >
            Semua
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-[10px] rounded-full shrink-0 gap-1"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </Button>
          ))}
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full shrink-0 gap-1">
                <Plus className="h-3 w-3" /> Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-primary" /> Buat Kategori
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nama</Label>
                  <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g., Bali Villas" className="h-9 rounded-xl" maxLength={50} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Warna</Label>
                  <div className="flex gap-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                      <button key={c} onClick={() => setNewCatColor(c)}
                        className={cn('h-7 w-7 rounded-full border-2 transition-transform', newCatColor === c ? 'border-foreground scale-110' : 'border-transparent')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateCategory} disabled={!newCatName.trim() || createCategory.isPending} className="w-full h-9 rounded-xl">
                  {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buat'}
                </Button>
              </div>
              {/* Category management */}
              {categories.length > 0 && (
                <div className="border-t pt-3 mt-2 space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium">Kelola Kategori</p>
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteCategory.mutate(cat.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Sort */}
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as WatchlistFilter)}>
            <SelectTrigger className="h-8 text-[10px] rounded-xl flex-1">
              <Filter className="h-3 w-3 mr-1" /> <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="elite">Elite (85+)</SelectItem>
              <SelectItem value="undervalued">Undervalued</SelectItem>
              <SelectItem value="strong_buy">Strong Buy</SelectItem>
              <SelectItem value="has_alerts">Punya Alert</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as WatchlistSort)}>
            <SelectTrigger className="h-8 text-[10px] rounded-xl flex-1">
              <ArrowUpDown className="h-3 w-3 mr-1" /> <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="score_desc">Score Tertinggi</SelectItem>
              <SelectItem value="price_change">Price Drop</SelectItem>
              <SelectItem value="forecast">Forecast Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-10 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">Watchlist Kosong</h3>
              <p className="text-[11px] text-muted-foreground mb-4">
                Tambahkan properti ke watchlist dari halaman detail properti
              </p>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate('/properties')}>
                Jelajahi Properti
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea style={{ maxHeight: '600px' }}>
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const p = item.property;
                  if (!p) return null;
                  const isElite = (p.opportunity_score || 0) >= 85;
                  const rec = item.ai_recommendation ? AI_REC_CONFIG[item.ai_recommendation] : null;
                  const img = p.image_urls?.[0] || p.images?.[0] || '';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card
                        className={cn(
                          'rounded-2xl border-border/30 hover:border-primary/20 transition-all cursor-pointer active:scale-[0.98]',
                          isElite && 'ring-1 ring-amber-400/30 shadow-[0_0_12px_-4px] shadow-amber-400/20',
                          item.has_new_alert && 'border-primary/40'
                        )}
                        onClick={() => navigate(`/properties/${p.id}`)}
                      >
                        <CardContent className="p-3 flex gap-3">
                          {/* Image */}
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {img ? (
                              <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Home className="h-6 w-6 text-muted-foreground/40" />
                              </div>
                            )}
                            {isElite && (
                              <div className="absolute top-1 left-1 bg-amber-400/90 text-background text-[8px] px-1.5 py-0.5 rounded-md font-bold">
                                ELITE
                              </div>
                            )}
                            {item.has_new_alert && (
                              <div className="absolute top-1 right-1 h-2.5 w-2.5 bg-primary rounded-full animate-pulse" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Top badges */}
                            <div className="flex items-center gap-1 flex-wrap mb-0.5">
                              {rec && (
                                <Badge variant="outline" className={cn('text-[8px] px-1.5 py-0 gap-0.5', rec.bg, rec.color)}>
                                  {rec.emoji} {rec.label}
                                </Badge>
                              )}
                              {item.alert_count > 0 && (
                                <Badge variant="outline" className="text-[8px] px-1.5 py-0 gap-0.5 bg-primary/10 text-primary border-primary/20">
                                  <Bell className="h-2 w-2" /> {item.alert_count}
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                              <MapPin className="h-2.5 w-2.5 flex-shrink-0" /> {p.city || p.location || '—'}
                            </p>

                            {/* Metrics */}
                            <div className="flex items-center gap-3 mt-1.5">
                              {/* Price */}
                              <div>
                                <p className="text-xs font-bold text-primary">{formatPrice(p.price)}</p>
                                <PriceChange pct={item.price_change_pct} />
                              </div>

                              {/* Score */}
                              <div className="text-center">
                                <div className="flex items-center gap-0.5">
                                  <span className={cn(
                                    'text-xs font-bold',
                                    (p.opportunity_score || 0) >= 85 ? 'text-amber-400' :
                                    (p.opportunity_score || 0) >= 65 ? 'text-chart-2' : 'text-muted-foreground'
                                  )}>
                                    {p.opportunity_score || '—'}
                                  </span>
                                  <ScoreArrow change={item.score_change} />
                                </div>
                                <p className="text-[8px] text-muted-foreground">Score</p>
                              </div>

                              {/* Yield */}
                              {p.rental_yield_percentage && p.rental_yield_percentage > 0 && (
                                <div className="text-center">
                                  <p className="text-xs font-bold text-chart-2">{p.rental_yield_percentage}%</p>
                                  <p className="text-[8px] text-muted-foreground">Yield</p>
                                </div>
                              )}

                              {/* Specs */}
                              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground ml-auto">
                                {p.bedrooms && <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{p.bedrooms}</span>}
                                {p.bathrooms && <span className="flex items-center gap-0.5"><Bath className="h-2.5 w-2.5" />{p.bathrooms}</span>}
                                {p.area_sqm && <span className="flex items-center gap-0.5"><Square className="h-2.5 w-2.5" />{p.area_sqm}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-center justify-between flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); toggleWatchlist.mutate({ propertyId: p.id }); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default InvestorWatchlist;
