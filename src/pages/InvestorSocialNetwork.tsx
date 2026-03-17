import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, Award, MessageCircle, Heart, Bookmark, Share2,
  MapPin, Shield, Crown, Star, Filter, Search, Send, ChevronUp,
  Eye, Flame, ArrowUpRight, BadgeCheck, Sparkles, Globe, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

// ─── Types ───────────────────────────────────────────────────────────
interface InvestorUser {
  id: string;
  name: string;
  initials: string;
  verified: boolean;
  tier: 'elite' | 'pro' | 'member';
  interests: string[];
  cities: string[];
  strategy: string;
  deals_shared: number;
  reputation: number;
  joined: string;
}

interface DealPost {
  id: string;
  author: InvestorUser;
  type: 'opportunity' | 'insight' | 'discussion' | 'watchlist';
  title: string;
  content: string;
  property?: { title: string; location: string; price: string; roi: string; type: string };
  tags: string[];
  likes: number;
  comments: number;
  saves: number;
  views: number;
  is_elite: boolean;
  created_at: string;
  user_liked: boolean;
  user_saved: boolean;
}

interface TrendingZone {
  zone: string;
  city: string;
  threads: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  heat: number;
  top_comment: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────
const INVESTORS: InvestorUser[] = [
  { id: '1', name: 'Andi Wijaya', initials: 'AW', verified: true, tier: 'elite', interests: ['Villa', 'Land Banking', 'Luxury'], cities: ['Bali', 'Jakarta'], strategy: 'High-yield luxury villa accumulation in premium tourist corridors', deals_shared: 47, reputation: 96, joined: '2023-06' },
  { id: '2', name: 'Sarah Chen', initials: 'SC', verified: true, tier: 'pro', interests: ['Apartment', 'Rental Income', 'Commercial'], cities: ['Jakarta', 'BSD City'], strategy: 'Cash-flow optimized residential portfolio in growth corridors', deals_shared: 32, reputation: 88, joined: '2024-01' },
  { id: '3', name: 'Budi Hartono', initials: 'BH', verified: true, tier: 'elite', interests: ['Development', 'Land', 'Infrastructure'], cities: ['Surabaya', 'Makassar'], strategy: 'Infrastructure-adjacent land plays in Tier 2 cities', deals_shared: 55, reputation: 94, joined: '2023-03' },
  { id: '4', name: 'Maya Lestari', initials: 'ML', verified: false, tier: 'member', interests: ['Residential', 'First-time'], cities: ['Bandung'], strategy: 'Building first residential portfolio', deals_shared: 8, reputation: 62, joined: '2024-09' },
  { id: '5', name: 'Reza Pratama', initials: 'RP', verified: true, tier: 'pro', interests: ['Villa', 'Short-term Rental'], cities: ['Bali', 'Yogyakarta'], strategy: 'Airbnb-optimized villa portfolio in cultural tourism hubs', deals_shared: 28, reputation: 82, joined: '2024-03' },
];

const DEAL_POSTS: DealPost[] = [
  {
    id: 'p1', author: INVESTORS[0], type: 'opportunity', title: 'Hidden gem in Canggu — 800m² freehold below market',
    content: 'Just came across this plot on the north side of Canggu. Owner relocating and priced 15% below comparable lots. Infrastructure development nearby (new bypass road Q2 2026) will likely push appreciation 25-30% within 18 months. Due diligence complete — clean title, IMB ready.',
    property: { title: 'Canggu North Freehold Land', location: 'Canggu, Bali', price: 'Rp 4.2B', roi: '25-30%', type: 'Land' },
    tags: ['Freehold', 'Below Market', 'Infrastructure Play'], likes: 142, comments: 38, saves: 67, views: 1240, is_elite: true, created_at: '2h ago', user_liked: false, user_saved: false,
  },
  {
    id: 'p2', author: INVESTORS[2], type: 'insight', title: 'Surabaya East corridor — the next BSD City?',
    content: 'Tracking developer activity in Surabaya East for 6 months now. 3 major developers have quietly acquired 200+ hectares. Toll road connection completing Dec 2025. Price per m² still 40% below Jakarta satellite cities. This is a 3-5 year infrastructure thesis with significant upside.',
    tags: ['Surabaya', 'Infrastructure', 'Long-term'], likes: 89, comments: 24, saves: 45, views: 890, is_elite: true, created_at: '5h ago', user_liked: true, user_saved: false,
  },
  {
    id: 'p3', author: INVESTORS[1], type: 'opportunity', title: 'Off-market apartment unit in SCBD — 8.2% gross yield',
    content: 'Corporate tenant leaving in March. Owner wants quick sale. Current rent Rp 180M/year on Rp 2.2B asking price = 8.2% gross yield. Similar units trading at Rp 2.5-2.8B. Furnished, high floor, city view.',
    property: { title: 'SCBD Luxury Apartment', location: 'SCBD, Jakarta', price: 'Rp 2.2B', roi: '8.2%', type: 'Apartment' },
    tags: ['Off-Market', 'High Yield', 'SCBD'], likes: 76, comments: 19, saves: 34, views: 650, is_elite: false, created_at: '8h ago', user_liked: false, user_saved: true,
  },
  {
    id: 'p4', author: INVESTORS[4], type: 'discussion', title: 'Bali villa market — peak or more room to run?',
    content: 'Seeing mixed signals. Occupancy still strong at 78% avg but new supply accelerating. Curious what others think — are we approaching oversupply in Seminyak/Canggu or does post-COVID tourism demand sustain another 2 years of growth?',
    tags: ['Bali', 'Villa', 'Market Cycle'], likes: 134, comments: 56, saves: 23, views: 1560, is_elite: false, created_at: '1d ago', user_liked: false, user_saved: false,
  },
  {
    id: 'p5', author: INVESTORS[3], type: 'watchlist', title: 'Bandung student housing — shared watchlist idea',
    content: 'Creating a watchlist around Bandung university district properties. ITB expansion + new LRT line should drive rental demand. Looking for 2BR apartments under Rp 800M within 1km of campus. Anyone want to collaborate on due diligence?',
    tags: ['Bandung', 'Student Housing', 'Collaborative'], likes: 45, comments: 12, saves: 18, views: 320, is_elite: false, created_at: '1d ago', user_liked: false, user_saved: false,
  },
];

const TRENDING_ZONES: TrendingZone[] = [
  { zone: 'Canggu North', city: 'Bali', threads: 24, sentiment: 'bullish', heat: 92, top_comment: 'Bypass road construction confirmed for Q2 2026 — land prices moving fast' },
  { zone: 'Surabaya East', city: 'Surabaya', threads: 18, sentiment: 'bullish', heat: 85, top_comment: 'Three major developers acquiring land — infrastructure thesis playing out' },
  { zone: 'PIK 2', city: 'Jakarta', threads: 31, sentiment: 'neutral', heat: 78, top_comment: 'Reclamation concerns vs strong developer marketing. Wait for clarity.' },
  { zone: 'Nusa Penida', city: 'Bali', threads: 12, sentiment: 'bullish', heat: 71, top_comment: 'New bridge plan would be a game-changer for land values' },
  { zone: 'BSD City Green', city: 'Tangerang', threads: 22, sentiment: 'neutral', heat: 68, top_comment: 'Pricing starting to plateau — selective opportunities only' },
];

// ─── Tier Badge ──────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: InvestorUser['tier'] }) {
  const cfg = {
    elite: { label: 'Elite', icon: Crown, className: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
    pro: { label: 'Pro', icon: Star, className: 'bg-primary/10 text-primary border-primary/30' },
    member: { label: 'Member', icon: Users, className: 'bg-muted text-muted-foreground border-border/30' },
  }[tier];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`text-[9px] h-5 gap-0.5 ${cfg.className}`}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </Badge>
  );
}

// ─── Post Type Badge ─────────────────────────────────────────────────
function PostTypeBadge({ type }: { type: DealPost['type'] }) {
  const cfg = {
    opportunity: { label: 'Opportunity', className: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30', icon: Target },
    insight: { label: 'Insight', className: 'bg-sky-400/10 text-sky-400 border-sky-400/30', icon: TrendingUp },
    discussion: { label: 'Discussion', className: 'bg-violet-400/10 text-violet-400 border-violet-400/30', icon: MessageCircle },
    watchlist: { label: 'Watchlist', className: 'bg-amber-400/10 text-amber-400 border-amber-400/30', icon: Eye },
  }[type];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`text-[9px] h-5 gap-0.5 ${cfg.className}`}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </Badge>
  );
}

// ─── Deal Post Card ──────────────────────────────────────────────────
function DealPostCard({ post }: { post: DealPost }) {
  const [liked, setLiked] = useState(post.user_liked);
  const [saved, setSaved] = useState(post.user_saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`bg-card/50 border-border/30 ${post.is_elite ? 'ring-1 ring-amber-400/20' : ''}`}>
        {post.is_elite && (
          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-400/5 to-transparent border-b border-amber-400/10 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-medium text-amber-400">Elite Opportunity</span>
          </div>
        )}
        <CardContent className="p-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 border border-border/30">
              <AvatarFallback className="text-xs bg-muted">{post.author.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">{post.author.name}</span>
                {post.author.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                <TierBadge tier={post.author.tier} />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{post.created_at}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {post.views}</span>
              </div>
            </div>
            <PostTypeBadge type={post.type} />
          </div>

          {/* Title & Content */}
          <h3 className="text-sm font-bold text-foreground mb-2">{post.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{post.content}</p>

          {/* Property Card */}
          {post.property && (
            <div className="rounded-lg border border-border/20 bg-muted/5 p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{post.property.title}</span>
                <Badge variant="outline" className="text-[9px] h-4">{post.property.type}</Badge>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                <MapPin className="h-2.5 w-2.5" /> {post.property.location}
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Price</span>
                  <p className="text-xs font-bold text-foreground">{post.property.price}</p>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Est. ROI</span>
                  <p className="text-xs font-bold text-emerald-400">{post.property.roi}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[9px] h-5 bg-muted/30">{t}</Badge>
            ))}
          </div>

          <Separator className="opacity-20 mb-3" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="sm"
              className={`h-8 text-xs gap-1.5 ${liked ? 'text-rose-400' : 'text-muted-foreground'}`}
              onClick={() => { setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1); }}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-rose-400' : ''}`} /> {likeCount}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
            </Button>
            <Button
              variant="ghost" size="sm"
              className={`h-8 text-xs gap-1.5 ${saved ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-primary' : ''}`} /> {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground ml-auto">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────
function LeaderboardRow({ inv, rank }: { inv: InvestorUser; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/10 last:border-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rank <= 3 ? 'bg-amber-400/10 text-amber-400' : 'bg-muted text-muted-foreground'}`}>
        {rank}
      </div>
      <Avatar className="h-8 w-8 border border-border/20">
        <AvatarFallback className="text-[10px] bg-muted">{inv.initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground truncate">{inv.name}</span>
          {inv.verified && <BadgeCheck className="h-3 w-3 text-primary shrink-0" />}
          <TierBadge tier={inv.tier} />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{inv.deals_shared} deals shared</span>
          <span>·</span>
          <span>{inv.cities.join(', ')}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-foreground">{inv.reputation}</div>
        <div className="text-[9px] text-muted-foreground">reputation</div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function InvestorSocialNetwork() {
  const [filter, setFilter] = useState<'all' | DealPost['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    let posts = DEAL_POSTS;
    if (filter !== 'all') posts = posts.filter(p => p.type === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    return posts;
  }, [filter, searchQuery]);

  const leaderboard = useMemo(() => [...INVESTORS].sort((a, b) => b.reputation - a.reputation), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Investor Network</h1>
                <p className="text-xs text-muted-foreground">Share insights · Discover deals · Build your reputation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                <Users className="h-3 w-3 mr-1" /> {INVESTORS.length.toLocaleString()} investors
              </Badge>
              <Button size="sm" onClick={() => setComposeOpen(!composeOpen)}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Share Deal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Main Feed (8 cols) ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* Compose */}
            <AnimatePresence>
              {composeOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <Card className="bg-card/50 border-border/30">
                    <CardContent className="p-4 space-y-3">
                      <Input placeholder="Deal title — what did you find?" className="text-sm bg-muted/10 border-border/20" />
                      <Textarea placeholder="Share your investment insight, opportunity, or discussion topic..." className="text-xs bg-muted/10 border-border/20 min-h-[80px]" />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {['Opportunity', 'Insight', 'Discussion', 'Watchlist'].map((t) => (
                            <Badge key={t} variant="outline" className="text-[9px] cursor-pointer hover:bg-primary/10 transition-colors">{t}</Badge>
                          ))}
                        </div>
                        <Button size="sm"><Send className="h-3.5 w-3.5 mr-1.5" /> Post</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search deals, investors, zones..." className="pl-8 h-9 text-xs bg-card/40 border-border/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-1">
                {([['all', 'All'], ['opportunity', 'Opportunities'], ['insight', 'Insights'], ['discussion', 'Discussions'], ['watchlist', 'Watchlists']] as const).map(([val, label]) => (
                  <Button key={val} variant={filter === val ? 'secondary' : 'ghost'} size="sm" className="h-8 text-[10px]" onClick={() => setFilter(val)}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => <DealPostCard key={post.id} post={post} />)}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No posts match your filters</div>
              )}
            </div>
          </div>

          {/* ── Right Sidebar (4 cols) ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Trending Zones */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-primary" /> Trending Investment Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0">
                {TRENDING_ZONES.map((z, i) => (
                  <div key={i} className="py-2.5 border-b border-border/10 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{z.zone}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 ${z.sentiment === 'bullish' ? 'text-emerald-400 border-emerald-400/30' : z.sentiment === 'bearish' ? 'text-rose-400 border-rose-400/30' : 'text-muted-foreground border-border/30'}`}>
                          {z.sentiment}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Progress value={z.heat} className="h-1 w-10" />
                        <span className="text-[9px] font-mono text-muted-foreground">{z.heat}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                      <MapPin className="h-2.5 w-2.5" /> {z.city} · {z.threads} threads
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 italic">"{z.top_comment}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" /> Top Investor Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {leaderboard.map((inv, i) => <LeaderboardRow key={inv.id} inv={inv} rank={i + 1} />)}
              </CardContent>
            </Card>

            {/* Trust & Verification */}
            <Card className="bg-card/60 border-primary/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Trust & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="rounded-lg bg-muted/10 border border-border/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Verified Investor Badge</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Complete KYC verification and prove active investment history to earn your verified badge. Verified investors get priority visibility in the feed.</p>
                  <Button variant="outline" size="sm" className="mt-2 text-[10px] h-7">Apply for Verification</Button>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Community Guidelines', desc: 'All posts moderated for accuracy and respect' },
                    { label: 'Deal Validation', desc: 'Elite opportunity posts reviewed by admin team' },
                    { label: 'Privacy Controls', desc: 'Control who sees your portfolio strategy' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-medium text-foreground">{item.label}</span>
                        <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
