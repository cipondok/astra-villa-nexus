import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Shield, Search, CheckCircle2, XCircle, AlertTriangle, Clock,
  Image as ImageIcon, DollarSign, MapPin, Eye, ArrowLeft,
  TrendingUp, TrendingDown, BarChart3, Filter, SortAsc,
  ChevronDown, FileText, Sparkles, RefreshCw,
} from 'lucide-react';

/* ─── Types ─── */
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
type SortField = 'created_at' | 'price' | 'opportunity_score' | 'views_count';
type ActionType = 'approve' | 'reject' | 'revision';

interface ListingRow {
  id: string;
  title: string;
  price: number | null;
  location: string;
  city: string | null;
  state: string | null;
  property_type: string;
  listing_type: string;
  images: string[] | null;
  image_urls: string[] | null;
  thumbnail_url: string | null;
  approval_status: string | null;
  status: string | null;
  created_at: string | null;
  opportunity_score: number | null;
  ai_estimated_price: number | null;
  views_count: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  description: string | null;
  owner_type: string | null;
}

/* ─── Helpers ─── */
function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function getImageCount(p: ListingRow) {
  return (p.images?.length ?? 0) + (p.image_urls?.length ?? 0);
}

function getImageQualityScore(p: ListingRow): { score: number; label: string; color: string } {
  const count = getImageCount(p);
  if (count >= 8) return { score: 95, label: 'Excellent', color: 'text-chart-2' };
  if (count >= 5) return { score: 75, label: 'Good', color: 'text-primary' };
  if (count >= 3) return { score: 50, label: 'Fair', color: 'text-chart-4' };
  if (count >= 1) return { score: 25, label: 'Poor', color: 'text-destructive' };
  return { score: 0, label: 'Missing', color: 'text-destructive' };
}

function getPricingRealism(p: ListingRow): { realistic: boolean; label: string; color: string; diff: number | null } {
  if (!p.price || !p.ai_estimated_price || p.ai_estimated_price <= 0) return { realistic: true, label: 'No AI estimate', color: 'text-muted-foreground', diff: null };
  const diff = Math.round(((p.price - p.ai_estimated_price) / p.ai_estimated_price) * 100);
  if (Math.abs(diff) <= 15) return { realistic: true, label: 'Realistic', color: 'text-chart-2', diff };
  if (diff > 15) return { realistic: false, label: 'Overpriced', color: 'text-destructive', diff };
  return { realistic: false, label: 'Underpriced', color: 'text-chart-4', diff };
}

function getThumb(p: ListingRow) {
  return p.thumbnail_url || p.images?.[0] || p.image_urls?.[0] || '/placeholder.svg';
}

const statusFilters: { key: ApprovalStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'revision_requested', label: 'Revision', icon: AlertTriangle },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
];

/* ═══════════════════════════════════════════════════════ */
export default function AdminListingReview() {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingRow | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: ActionType; listing: ListingRow } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  /* ── Fetch listings ── */
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-listings-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, location, city, state, property_type, listing_type, images, image_urls, thumbnail_url, approval_status, status, created_at, opportunity_score, ai_estimated_price, views_count, bedrooms, bathrooms, area_sqm, description, owner_type')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as ListingRow[];
    },
    enabled: !!user && isAdmin,
    staleTime: 15000,
  });

  /* ── Mutation ── */
  const updateMutation = useMutation({
    mutationFn: async ({ id, approval_status, status }: { id: string; approval_status: string; status?: string }) => {
      const update: Record<string, string> = { approval_status };
      if (status) update.status = status;
      const { error } = await supabase.from('properties').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings-review'] });
      toast({ title: 'Listing updated', description: 'The listing status has been updated successfully.' });
      setActionDialog(null);
      setAdminNotes('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update listing.', variant: 'destructive' });
    },
  });

  const handleAction = (type: ActionType) => {
    if (!actionDialog) return;
    const { listing } = actionDialog;
    switch (type) {
      case 'approve':
        updateMutation.mutate({ id: listing.id, approval_status: 'approved', status: 'active' });
        break;
      case 'reject':
        updateMutation.mutate({ id: listing.id, approval_status: 'rejected', status: 'inactive' });
        break;
      case 'revision':
        updateMutation.mutate({ id: listing.id, approval_status: 'revision_requested' });
        break;
    }
  };

  /* ── Filtered & sorted ── */
  const filtered = useMemo(() => {
    let result = [...listings];
    if (filterStatus !== 'all') {
      result = result.filter(l => (l.approval_status || 'pending') === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = (a as any)[sortField] ?? 0;
      const bv = (b as any)[sortField] ?? 0;
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? av - bv : bv - av;
    });
    return result;
  }, [listings, filterStatus, searchQuery, sortField, sortAsc]);

  /* ── Insight metrics ── */
  const metrics = useMemo(() => {
    const total = listings.length;
    const pending = listings.filter(l => (l.approval_status || 'pending') === 'pending').length;
    const approved = listings.filter(l => l.approval_status === 'approved').length;
    const rejected = listings.filter(l => l.approval_status === 'rejected').length;
    const revision = listings.filter(l => l.approval_status === 'revision_requested').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const avgScore = listings.reduce((s, l) => s + (l.opportunity_score ?? 0), 0) / (total || 1);
    return { total, pending, approved, rejected, revision, approvalRate, avgScore: Math.round(avgScore) };
  }, [listings]);

  if (adminLoading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const statusBadge = (status: string | null) => {
    const s = status || 'pending';
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-chart-4/15 text-chart-4 border-chart-4/25' },
      approved: { label: 'Approved', className: 'bg-chart-2/15 text-chart-2 border-chart-2/25' },
      rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/25' },
      revision_requested: { label: 'Revision', className: 'bg-primary/15 text-primary border-primary/25' },
    };
    const cfg = map[s] || map.pending;
    return <Badge variant="outline" className={cn('text-[9px] font-semibold px-1.5 py-0', cfg.className)}>{cfg.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Listing Review — Admin" description="Review and approve property listings." noIndex />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Listing Quality Review</h1>
          </div>
          <p className="text-xs text-muted-foreground">Curate marketplace inventory — review, approve, or request revisions on property listings</p>
        </motion.div>

        {/* ── Insight Metrics Strip ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {[
            { label: 'Total Listings', value: metrics.total, icon: FileText, color: 'text-foreground' },
            { label: 'Pending Review', value: metrics.pending, icon: Clock, color: 'text-chart-4' },
            { label: 'Approved', value: metrics.approved, icon: CheckCircle2, color: 'text-chart-2' },
            { label: 'Rejected', value: metrics.rejected, icon: XCircle, color: 'text-destructive' },
            { label: 'Needs Revision', value: metrics.revision, icon: AlertTriangle, color: 'text-primary' },
            { label: 'Approval Rate', value: `${metrics.approvalRate}%`, icon: TrendingUp, color: 'text-chart-2' },
            { label: 'Avg AI Score', value: metrics.avgScore, icon: Sparkles, color: 'text-primary' },
          ].map((m) => (
            <Card key={m.label} className="bg-card/80 border-border/60">
              <CardContent className="p-2.5 flex items-center gap-2">
                <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60', m.color)}>
                  <m.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={cn('text-sm sm:text-base font-bold tabular-nums', m.color)}>{m.value}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* ── Filter + Search Bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
          {/* Status filters */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-shrink-0">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors flex-shrink-0',
                  filterStatus === f.key
                    ? 'bg-primary/15 text-primary border border-primary/25'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent',
                )}
              >
                <f.icon className="h-3 w-3" />
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search title, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="h-8 px-2 text-xs bg-muted/50 border border-border/60 rounded-lg text-foreground"
            >
              <option value="created_at">Date</option>
              <option value="price">Price</option>
              <option value="opportunity_score">AI Score</option>
              <option value="views_count">Views</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted/50 border border-border/60 hover:bg-muted transition-colors"
            >
              <SortAsc className={cn('h-3.5 w-3.5 transition-transform', !sortAsc && 'rotate-180')} />
            </button>
          </div>
        </motion.div>

        {/* ── Results count ── */}
        <p className="text-[10px] text-muted-foreground mb-2">{filtered.length} listings found</p>

        {/* ── Listing Table ── */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-chart-2/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No listings match your filters</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting the status filter or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {filtered.map((listing, i) => {
                const imgQ = getImageQualityScore(listing);
                const priceR = getPricingRealism(listing);
                const imgCount = getImageCount(listing);

                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <Card
                      className={cn(
                        'bg-card/80 border-border/60 overflow-hidden group cursor-pointer',
                        'hover:border-primary/20 hover:shadow-sm transition-all duration-200',
                        listing.approval_status === 'pending' && 'border-l-2 border-l-chart-4',
                        listing.approval_status === 'revision_requested' && 'border-l-2 border-l-primary',
                      )}
                      onClick={() => setSelectedListing(listing)}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center gap-3 p-2 sm:p-3">
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={getThumb(listing)} alt="" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[8px] px-1 rounded font-mono">
                              {imgCount} img
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">{listing.title}</h3>
                              {statusBadge(listing.approval_status)}
                            </div>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                              {listing.city || listing.state || listing.location}
                              <span className="mx-1">·</span>
                              {listing.property_type} · {listing.listing_type}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {listing.price && (
                                <span className="text-xs font-bold text-foreground">{formatPrice(listing.price)}</span>
                              )}
                              {listing.opportunity_score && listing.opportunity_score > 0 && (
                                <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
                                  <Sparkles className="h-2.5 w-2.5" /> {listing.opportunity_score}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quality indicators */}
                          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                            {/* Image quality */}
                            <div className="text-center">
                              <div className={cn('flex items-center gap-1 text-[10px] font-semibold', imgQ.color)}>
                                <ImageIcon className="h-3 w-3" />
                                {imgQ.label}
                              </div>
                              <p className="text-[8px] text-muted-foreground">{imgCount} photos</p>
                            </div>

                            {/* Pricing realism */}
                            <div className="text-center">
                              <div className={cn('flex items-center gap-1 text-[10px] font-semibold', priceR.color)}>
                                <DollarSign className="h-3 w-3" />
                                {priceR.label}
                              </div>
                              {priceR.diff !== null && (
                                <p className="text-[8px] text-muted-foreground">
                                  {priceR.diff > 0 ? '+' : ''}{priceR.diff}% vs AI
                                </p>
                              )}
                            </div>

                            {/* Views */}
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {listing.views_count ?? 0}
                              </div>
                              <p className="text-[8px] text-muted-foreground">views</p>
                            </div>
                          </div>

                          {/* Quick actions */}
                          <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              className="h-6 text-[9px] px-2 bg-chart-2/15 text-chart-2 hover:bg-chart-2/25 border-0"
                              variant="outline"
                              onClick={() => { setActionDialog({ type: 'approve', listing }); setAdminNotes(''); }}
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              className="h-6 text-[9px] px-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                              variant="outline"
                              onClick={() => { setActionDialog({ type: 'revision', listing }); setAdminNotes(''); }}
                            >
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Revise
                            </Button>
                            <Button
                              size="sm"
                              className="h-6 text-[9px] px-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
                              variant="outline"
                              onClick={() => { setActionDialog({ type: 'reject', listing }); setAdminNotes(''); }}
                            >
                              <XCircle className="h-2.5 w-2.5 mr-0.5" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Detail Preview Dialog ── */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 bg-background border-border">
          {selectedListing && (() => {
            const p = selectedListing;
            const imgQ = getImageQualityScore(p);
            const priceR = getPricingRealism(p);
            return (
              <div className="space-y-0">
                {/* Image preview */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img src={getThumb(p)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">{statusBadge(p.approval_status)}</div>
                  {p.opportunity_score && p.opportunity_score > 0 && (
                    <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {p.opportunity_score}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground">{p.title}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {p.city || p.state || p.location}
                      <span className="mx-0.5">·</span> {p.property_type} · {p.listing_type}
                    </p>
                  </div>

                  {/* Quality grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <ImageIcon className={cn('h-4 w-4 mx-auto mb-1', imgQ.color)} />
                      <p className={cn('text-xs font-semibold', imgQ.color)}>{imgQ.label}</p>
                      <p className="text-[9px] text-muted-foreground">{getImageCount(p)} photos · Score {imgQ.score}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <DollarSign className={cn('h-4 w-4 mx-auto mb-1', priceR.color)} />
                      <p className={cn('text-xs font-semibold', priceR.color)}>{priceR.label}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {priceR.diff !== null ? `${priceR.diff > 0 ? '+' : ''}${priceR.diff}% vs AI` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-center">
                      <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-semibold text-foreground">{p.views_count ?? 0}</p>
                      <p className="text-[9px] text-muted-foreground">Total views</p>
                    </div>
                  </div>

                  {/* Price */}
                  {p.price && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-foreground">{formatPrice(p.price)}</span>
                      {p.ai_estimated_price && p.ai_estimated_price > 0 && (
                        <span className="text-xs text-muted-foreground">AI est. {formatPrice(p.ai_estimated_price)}</span>
                      )}
                    </div>
                  )}

                  {/* Description preview */}
                  {p.description && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Description Preview</p>
                      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4">{p.description}</p>
                    </div>
                  )}

                  {/* Admin actions */}
                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <Button
                      className="flex-1 h-9 text-xs gap-1.5 bg-chart-2/15 text-chart-2 hover:bg-chart-2/25 border border-chart-2/25"
                      variant="outline"
                      onClick={() => { setSelectedListing(null); setActionDialog({ type: 'approve', listing: p }); setAdminNotes(''); }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      className="flex-1 h-9 text-xs gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25"
                      variant="outline"
                      onClick={() => { setSelectedListing(null); setActionDialog({ type: 'revision', listing: p }); setAdminNotes(''); }}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Revise
                    </Button>
                    <Button
                      className="flex-1 h-9 text-xs gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/25"
                      variant="outline"
                      onClick={() => { setSelectedListing(null); setActionDialog({ type: 'reject', listing: p }); setAdminNotes(''); }}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Action Confirmation Dialog ── */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="max-w-sm bg-background border-border">
          {actionDialog && (() => {
            const { type, listing } = actionDialog;
            const config: Record<ActionType, { title: string; desc: string; btnLabel: string; btnClass: string; icon: typeof CheckCircle2 }> = {
              approve: {
                title: 'Approve Listing',
                desc: `"${listing.title}" will be published to the marketplace.`,
                btnLabel: 'Approve & Publish',
                btnClass: 'bg-chart-2 text-white hover:bg-chart-2/90',
                icon: CheckCircle2,
              },
              revision: {
                title: 'Request Revision',
                desc: `The listing owner will be notified to update "${listing.title}".`,
                btnLabel: 'Send Revision Request',
                btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
                icon: AlertTriangle,
              },
              reject: {
                title: 'Reject Listing',
                desc: `"${listing.title}" will be removed from the pending queue.`,
                btnLabel: 'Confirm Rejection',
                btnClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                icon: XCircle,
              },
            };
            const cfg = config[type];
            return (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <cfg.icon className="h-5 w-5" />
                    {cfg.title}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                <div>
                  <label className="text-xs font-medium text-foreground">Admin Notes {type !== 'approve' ? '*' : '(optional)'}</label>
                  <Textarea
                    rows={3}
                    placeholder={type === 'revision' ? 'Describe what needs to be improved...' : type === 'reject' ? 'Reason for rejection...' : 'Optional notes...'}
                    value={adminNotes}
                    maxLength={500}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground/60 text-right mt-0.5">{adminNotes.length}/500</p>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
                  <Button
                    className={cfg.btnClass}
                    disabled={updateMutation.isPending || (type !== 'approve' && !adminNotes.trim())}
                    onClick={() => handleAction(type)}
                  >
                    {updateMutation.isPending ? 'Processing…' : cfg.btnLabel}
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
