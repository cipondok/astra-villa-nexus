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
import { Switch } from '@/components/ui/switch';
import { propertyPath } from '@/lib/propertySeo';
import { getReviewInfo, readReviewMeta, reviewUpdate, type ReviewDecision } from '@/lib/listingReview';
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
  ChevronDown, FileText, Sparkles, RefreshCw, EyeOff, Globe, FlaskConical, Phone, Mail, User,
} from 'lucide-react';

/* ─── Types ─── */
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
type SortField = 'created_at' | 'price' | 'opportunity_score' | 'views_count';
type ActionType = ReviewDecision;

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
  owner_id: string | null;
  is_demo: boolean | null;
  slug: string | null;
  meta: unknown;
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

  const [showDemoInQueue, setShowDemoInQueue] = useState(false);

  /* ── Fetch listings (filtered on the server; samples hidden unless asked) ── */
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-listings-review', filterStatus, showDemoInQueue],
    queryFn: async () => {
      let q = supabase
        .from('properties')
        .select('id, title, slug, price, location, city, state, property_type, listing_type, images, image_urls, thumbnail_url, approval_status, status, created_at, opportunity_score, ai_estimated_price, views_count, bedrooms, bathrooms, area_sqm, description, owner_type, owner_id, is_demo, meta')
        .order('created_at', { ascending: false })
        .limit(300);
      if (!showDemoInQueue) q = q.eq('is_demo', false);
      if (filterStatus === 'pending') q = q.or('approval_status.is.null,approval_status.eq.pending').neq('status', 'draft');
      else if (filterStatus !== 'all') q = q.eq('approval_status', filterStatus);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as ListingRow[];
    },
    enabled: !!user && isAdmin,
    staleTime: 15000,
  });

  /* ── Inventory KPIs (counted in the database, not limited by the list) ── */
  const { data: counts } = useQuery({
    queryKey: ['admin-listing-moderation-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_listing_moderation_counts' as never);
      if (error) throw error;
      return data as unknown as Record<'pending' | 'revision' | 'published' | 'approved_offline' | 'rejected' | 'drafts' | 'demo', number>;
    },
    enabled: !!user && isAdmin,
    staleTime: 15000,
  });

  /* ── Sample-listing visibility switch (system_settings.show_demo_listings) ── */
  const { data: showDemoPublic = false } = useQuery({
    queryKey: ['marketplace-show-demo-listings'],
    queryFn: async () => {
      const { data } = await supabase.from('system_settings').select('value').eq('key', 'show_demo_listings').maybeSingle();
      return data?.value === true;
    },
    enabled: !!user && isAdmin,
  });
  const demoSwitch = useMutation({
    mutationFn: async (next: boolean) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value: next as never, updated_at: new Date().toISOString() })
        .eq('key', 'show_demo_listings')
        .select('key');
      if (error) throw error;
      if (!data?.length) throw new Error('Setting not saved — your account cannot change marketplace settings.');
    },
    onSuccess: (_d, next) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-show-demo-listings'] });
      toast({ title: next ? 'Sample listings visible to visitors' : 'Sample listings hidden from visitors' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  /* ── Submitter contact (admins can read profiles; never shown publicly) ── */
  const { data: submitter } = useQuery({
    queryKey: ['admin-listing-submitter', selectedListing?.owner_id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('full_name, email, phone').eq('id', selectedListing!.owner_id!).maybeSingle();
      return data;
    },
    enabled: !!selectedListing?.owner_id && isAdmin,
  });

  /* ── Mutation ── */
  const updateMutation = useMutation({
    mutationFn: async ({ listing, decision, note }: { listing: ListingRow; decision: ReviewDecision; note: string }) => {
      const update = reviewUpdate(decision, { note, reviewerId: user!.id, currentMeta: listing.meta });
      const { data, error } = await supabase.from('properties').update(update as never).eq('id', listing.id).select('id, approval_status, status');
      if (error) throw error;
      if (!data?.length) throw new Error('Nothing was updated — your account may not have listing admin rights.');
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings-review'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listing-moderation-counts'] });
      toast({ title: 'Listing updated', description: 'The listing status has been updated.' });
      setActionDialog(null);
      setAdminNotes('');
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message || 'Failed to update listing.', variant: 'destructive' });
    },
  });

  const handleAction = (type: ActionType) => {
    if (!actionDialog) return;
    updateMutation.mutate({ listing: actionDialog.listing, decision: type, note: adminNotes });
  };

  /* ── Filtered & sorted ── */
  const filtered = useMemo(() => {
    let result = [...listings];
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-3" aria-label="Inventory counts">
          {[
            { label: 'Pending Review', value: counts?.pending ?? '–', icon: Clock, color: 'text-chart-4' },
            { label: 'Needs Corrections', value: counts?.revision ?? '–', icon: AlertTriangle, color: 'text-primary' },
            { label: 'Published (live)', value: counts?.published ?? '–', icon: Globe, color: 'text-chart-2' },
            { label: 'Approved, offline', value: counts?.approved_offline ?? '–', icon: EyeOff, color: 'text-muted-foreground' },
            { label: 'Rejected', value: counts?.rejected ?? '–', icon: XCircle, color: 'text-destructive' },
            { label: 'Drafts', value: counts?.drafts ?? '–', icon: FileText, color: 'text-foreground' },
            { label: 'Sample (DEMO)', value: counts?.demo ?? '–', icon: FlaskConical, color: 'text-muted-foreground' },
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

        {/* ── Sample listing controls ── */}
        <Card className="bg-card/80 border-border/60 mb-4">
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <label className="flex items-center gap-2 text-xs text-foreground">
              <Switch
                checked={showDemoPublic}
                disabled={demoSwitch.isPending}
                onCheckedChange={(v) => demoSwitch.mutate(v)}
                aria-label="Show sample listings to visitors"
              />
              <span>
                <span className="font-semibold">Show sample listings to visitors</span>
                <span className="block text-[10px] text-muted-foreground">Off = only approved real listings appear in search. Samples are always labelled DEMO, noindex and kept out of the sitemap.</span>
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs text-foreground sm:ml-auto">
              <Switch checked={showDemoInQueue} onCheckedChange={setShowDemoInQueue} aria-label="Include sample listings in this list" />
              <span>Include samples in this list</span>
            </label>
          </CardContent>
        </Card>

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
                            <div className="absolute bottom-0.5 right-0.5 bg-background/85 text-foreground text-[10px] px-1 rounded font-mono">
                              {imgCount}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">{listing.title}</h3>
                              {statusBadge(listing.approval_status)}
                              {listing.is_demo && <Badge variant="outline" className="text-[9px] px-1.5 py-0">DEMO</Badge>}
                              {listing.approval_status === 'approved' && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{getReviewInfo(listing).label.en}</Badge>
                              )}
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
                            {listing.approval_status === 'approved' ? (
                              listing.status === 'active' || listing.status === 'published' ? (
                                <Button size="sm" variant="outline" className="h-8 text-[10px] px-2" onClick={() => { setActionDialog({ type: 'unpublish', listing }); setAdminNotes(''); }}>
                                  <EyeOff className="h-3 w-3 mr-1" /> Unpublish
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-8 text-[10px] px-2 text-chart-2" onClick={() => { setActionDialog({ type: 'publish', listing }); setAdminNotes(''); }}>
                                  <Globe className="h-3 w-3 mr-1" /> Publish
                                </Button>
                              )
                            ) : (
                              <Button size="sm" variant="outline" className="h-8 text-[10px] px-2 bg-chart-2/15 text-chart-2 hover:bg-chart-2/25 border-0" onClick={() => { setActionDialog({ type: 'approve', listing }); setAdminNotes(''); }}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-8 text-[10px] px-2 bg-primary/10 text-primary hover:bg-primary/20 border-0" onClick={() => { setActionDialog({ type: 'revision', listing }); setAdminNotes(''); }}>
                              <AlertTriangle className="h-3 w-3 mr-1" /> Corrections
                            </Button>
                            {listing.approval_status !== 'rejected' && (
                              <Button size="sm" variant="outline" className="h-8 text-[10px] px-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-0" onClick={() => { setActionDialog({ type: 'reject', listing }); setAdminNotes(''); }}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            )}
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

                  {/* Submitter (private — admin only) */}
                  <div className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground">Submitted by (private)</p>
                    <p className="text-xs text-foreground flex items-center gap-1.5"><User className="h-3 w-3" /> {submitter?.full_name || '—'}
                      {(() => { const rel = (p.meta as { submission?: { relationship?: string } } | null)?.submission?.relationship; return rel ? <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1">{rel.replace('_', ' ')}</Badge> : null; })()}
                    </p>
                    {submitter?.phone && <a href={`tel:${submitter.phone}`} className="text-xs text-primary flex items-center gap-1.5 underline-offset-2 hover:underline"><Phone className="h-3 w-3" /> {submitter.phone}</a>}
                    {submitter?.email && <a href={`mailto:${submitter.email}`} className="text-xs text-primary flex items-center gap-1.5 underline-offset-2 hover:underline"><Mail className="h-3 w-3" /> {submitter.email}</a>}
                    {!(p.meta as { submission?: unknown } | null)?.submission && !p.is_demo && (
                      <p className="text-[10px] text-muted-foreground">No owner declaration on file (submitted before the declaration step existed).</p>
                    )}
                    {p.is_demo && <p className="text-[10px] text-muted-foreground">Sample listing (DEMO) — not a real submission.</p>}
                  </div>

                  {readReviewMeta(p.meta)?.note && (
                    <div className="text-xs">
                      <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Last review note</p>
                      <p className="text-foreground/90">{readReviewMeta(p.meta)?.note}</p>
                    </div>
                  )}

                  <a href={propertyPath(p)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Eye className="h-3 w-3" /> Open listing page
                  </a>

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
                      <AlertTriangle className="h-3.5 w-3.5" /> Corrections
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
              publish: {
                title: 'Publish Listing',
                desc: `"${listing.title}" will be visible to visitors again.`,
                btnLabel: 'Publish',
                btnClass: 'bg-chart-2 text-primary-foreground hover:bg-chart-2/90',
                icon: Globe,
              },
              unpublish: {
                title: 'Unpublish Listing',
                desc: `"${listing.title}" stays approved but is hidden from visitors, search and the sitemap.`,
                btnLabel: 'Unpublish',
                btnClass: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
                icon: EyeOff,
              },
              approve: {
                title: 'Approve Listing',
                desc: `"${listing.title}" will be published to the marketplace.`,
                btnLabel: 'Approve & Publish',
                btnClass: 'bg-chart-2 text-primary-foreground hover:bg-chart-2/90',
                icon: CheckCircle2,
              },
              revision: {
                title: 'Request Corrections',
                desc: `"${listing.title}" stays hidden. The owner sees your note on their My Properties page and can resubmit.`,
                btnLabel: 'Send Correction Request',
                btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
                icon: AlertTriangle,
              },
              reject: {
                title: 'Reject Listing',
                desc: `"${listing.title}" will be hidden from visitors. The owner sees your reason.`,
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
                  <label htmlFor="review-note" className="text-xs font-medium text-foreground">{type === 'reject' || type === 'revision' ? 'Note to owner *' : 'Note (optional)'}</label>
                  <Textarea
                    id="review-note"
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
                    disabled={updateMutation.isPending || ((type === 'reject' || type === 'revision') && !adminNotes.trim())}
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
