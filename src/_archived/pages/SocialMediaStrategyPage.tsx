import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, ChevronDown, Instagram, Linkedin, Video,
  TrendingUp, Building2, Sparkles, Target, Calendar,
  Clock, Hash, Eye, Heart, MessageSquare, Share2,
  ArrowRight, Flame, Star, BarChart3, Zap, MapPin,
  Home, Camera, Megaphone, Users, CheckCircle2, Play
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ContentTheme = 'ai-deals' | 'market-intel' | 'lifestyle';
type Platform = 'instagram' | 'tiktok' | 'linkedin';
type ContentFormat = 'reel' | 'carousel' | 'story' | 'post' | 'article';

interface ContentIdea {
  title: string;
  hook: string;
  format: ContentFormat;
  platform: Platform[];
  cta: string;
  caption: string;
  hashtags: string[];
  visualDesc: string;
  frequency: string;
}

interface ThemeSection {
  id: ContentTheme;
  title: string;
  subtitle: string;
  icon: typeof Sparkles;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  purpose: string;
  ideas: ContentIdea[];
}

const PLATFORM_ICON: Record<Platform, typeof Instagram> = {
  instagram: Instagram,
  tiktok: Video,
  linkedin: Linkedin,
};

const FORMAT_CLS: Record<ContentFormat, string> = {
  reel: 'text-rose-400 border-rose-400/30',
  carousel: 'text-sky-400 border-sky-400/30',
  story: 'text-amber-400 border-amber-400/30',
  post: 'text-emerald-400 border-emerald-400/30',
  article: 'text-violet-400 border-violet-400/30',
};

const THEMES: ThemeSection[] = [
  {
    id: 'ai-deals', title: 'AI Deal Discovery', subtitle: 'Showcase AI intelligence finding hidden investment opportunities',
    icon: Sparkles, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    purpose: 'Build curiosity about AI capabilities. Make investors think: "I need this tool." Every post should feel like insider intelligence being shared.',
    ideas: [
      {
        title: 'AI Found This Deal — Score 92/100',
        hook: '"AI kami menemukan properti ini undervalued 18% dari market. Ini alasannya..."',
        format: 'reel', platform: ['instagram', 'tiktok'], frequency: '3x / week',
        cta: 'Lihat deal AI lainnya → link in bio',
        caption: 'AI opportunity score: 92/100 🔥 Properti di [area] ini dinilai undervalued 18% berdasarkan analisis 12 faktor market. Rental yield 8.2%, demand naik 34% YoY. #AIInvestasi',
        hashtags: ['AIPropertyInvestment', 'InvestasiProperti', 'SmartInvesting', 'ASTRAVilla', 'AIRealEstate'],
        visualDesc: 'Screen recording: Open property card → zoom on opportunity score ring animation → show AI insight panel breakdown → end with "Discover more at ASTRA Villa"',
      },
      {
        title: 'Before vs After: AI Prediction Accuracy',
        hook: '"6 bulan lalu AI kami prediksi area ini naik 15%. Hasilnya?"',
        format: 'carousel', platform: ['instagram', 'linkedin'], frequency: '1x / week',
        cta: 'Mau lihat prediksi area Anda? → astra-villa.com',
        caption: 'Slide 1: AI prediction 6 bulan lalu\nSlide 2: Actual market data today\nSlide 3: Accuracy score\nSlide 4: CTA — "Your area next?"',
        hashtags: ['AIPrediction', 'PropertyData', 'MarketIntelligence', 'InvestasiCerdas'],
        visualDesc: 'Slide 1: Screenshot of AI prediction with date stamp. Slide 2: Current market price data. Slide 3: Big "94% Accurate" with green checkmark. Slide 4: Platform CTA with phone mockup.',
      },
      {
        title: 'How AI Scores Your Next Investment',
        hook: '"Pernah bingung pilih properti? AI kami analisis 12 faktor dalam 3 detik."',
        format: 'reel', platform: ['instagram', 'tiktok'], frequency: '2x / week',
        cta: 'Coba gratis → link in bio',
        caption: 'ROI potential ✓ Rental demand ✓ Price gap ✓ Infrastructure growth ✓ — semua dijadikan satu skor 0-100 yang actionable. Ini cara kerja Opportunity Score di ASTRA Villa.',
        hashtags: ['OpportunityScore', 'AIAnalysis', 'PropertyTech', 'InvestasiAI'],
        visualDesc: 'Fast-paced editing: Show each scoring factor appearing one by one with icons → score ring filling up → final score reveal with glow effect. Use platform screenshot.',
      },
      {
        title: 'Top 3 AI-Detected Deals This Week',
        hook: '"3 properti yang AI kami flagged minggu ini. Nomor 2 bikin kaget."',
        format: 'carousel', platform: ['instagram', 'tiktok'], frequency: '1x / week',
        cta: 'Follow untuk update deal mingguan',
        caption: 'Weekly AI Deal Drop 🎯 Setiap minggu AI kami scan ribuan listing dan ranking berdasarkan investment potential. Ini 3 teratas minggu ini:',
        hashtags: ['WeeklyDeals', 'AIDeals', 'PropertyIndonesia', 'TopInvestasi'],
        visualDesc: 'Each slide: Property photo + overlay with score badge, location, key metric (yield/price gap). Final slide: "Want daily alerts? Join ASTRA Villa."',
      },
    ],
  },
  {
    id: 'market-intel', title: 'Market Intelligence', subtitle: 'Educate with data-driven insights and trend analysis',
    icon: BarChart3, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    purpose: 'Position ASTRA Villa as the trusted source of property market data. Build authority. Make followers depend on our insights for investment decisions.',
    ideas: [
      {
        title: 'City Investment Trend: [City] Edition',
        hook: '"Jakarta Selatan naik 12% dalam 6 bulan. Tapi ada area yang naik 23%..."',
        format: 'reel', platform: ['instagram', 'tiktok'], frequency: '2x / week',
        cta: 'Lihat data lengkap di Investment Map Explorer',
        caption: 'Market update: [City] Q1 2026 📊 Average price per sqm naik [X]%, tapi distribusi tidak merata. Area [X] outperform significantly. Data dari ASTRA Villa Intelligence.',
        hashtags: ['MarketUpdate', 'PropertyTrends', 'JakartaProperty', 'DataDriven'],
        visualDesc: 'Start with city aerial shot → transition to animated chart showing price trend → highlight top-performing area with map zoom → end with data dashboard screenshot.',
      },
      {
        title: 'Rental Yield Comparison: 5 Kota',
        hook: '"Kota mana yang kasih passive income terbaik di 2026?"',
        format: 'carousel', platform: ['instagram', 'linkedin'], frequency: '1x / week',
        cta: 'Analisis lengkap → astra-villa.com/market-intelligence-feed',
        caption: 'Perbandingan rental yield 5 kota utama Indonesia 🏘️ Hasilnya mungkin mengejutkan. Swipe untuk lihat →',
        hashtags: ['RentalYield', 'PassiveIncome', 'PropertyComparison', 'InvestasiProperti'],
        visualDesc: 'Each slide: City name + yield percentage + bar chart. Final slide: ranking table with ASTRA Villa branding. Clean, data-focused design with dark background.',
      },
      {
        title: 'Emerging Growth Zone Alert 🚨',
        hook: '"Area ini belum di radar kebanyakan investor. Demand naik 45% dalam 3 bulan."',
        format: 'reel', platform: ['instagram', 'tiktok'], frequency: '1x / week',
        cta: 'Set alert untuk area ini → link in bio',
        caption: '🚨 Growth Zone Alert: [Area] menunjukkan sinyal kuat — inquiry volume +45%, infrastructure development confirmed, price masih di bawah market average. Early movers advantage.',
        hashtags: ['GrowthZone', 'EarlyMover', 'EmergingMarket', 'InvestmentAlert'],
        visualDesc: 'Map animation: zoom into zone → heat layer activating (red glow) → stat overlays appearing one by one → alert notification mockup → "Get alerts first on ASTRA Villa".',
      },
      {
        title: 'Monthly Market Intelligence Report',
        hook: '"Laporan market properti Indonesia bulan ini — dalam 60 detik."',
        format: 'reel', platform: ['instagram', 'tiktok', 'linkedin'], frequency: '1x / month',
        cta: 'Full report → astra-villa.com',
        caption: 'Monthly Intelligence Brief 📋 Key takeaways: 1) [trend] 2) [trend] 3) [trend]. Detailed analysis available on our platform.',
        hashtags: ['MonthlyReport', 'MarketIntelligence', 'PropertyIndonesia', 'AIInsights'],
        visualDesc: 'Fast-paced montage: key stat → chart → map → prediction → CTA. Professional voiceover with data overlays. 60-second format.',
      },
    ],
  },
  {
    id: 'lifestyle', title: 'Lifestyle & Luxury', subtitle: 'Aspirational content that drives emotional connection with property investment',
    icon: Home, accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    purpose: 'Attract broader audience beyond data-focused investors. Create desire. Show the OUTCOME of smart investment — beautiful properties, lifestyle upgrade, wealth building.',
    ideas: [
      {
        title: 'Modern Villa Tour: [Location]',
        hook: '"Villa ini scored 88/100 di AI kami. Tour dalam 30 detik."',
        format: 'reel', platform: ['instagram', 'tiktok'], frequency: '2x / week',
        cta: 'Lihat AI score dan detail → link in bio',
        caption: '🏡 Villa Tour: [Location] — [X] kamar, infinity pool, mountain view. AI Opportunity Score: 88/100. Rental yield estimate: 9.4%. Bukan cuma indah — ini investasi cerdas.',
        hashtags: ['VillaTour', 'LuxuryProperty', 'BaliVilla', 'SmartInvestment', 'PropertyTour'],
        visualDesc: 'Cinematic walk-through: entrance → living area → pool area → view reveal. Overlay AI score badge in corner. End card with platform CTA.',
      },
      {
        title: 'Renovation Transformation: Before → After',
        hook: '"Properti ini dibeli Rp 800jt. Setelah renovasi Rp 150jt, sekarang valued Rp 1.4M."',
        format: 'reel', platform: ['instagram', 'tiktok'], frequency: '1x / week',
        cta: 'Temukan properti undervalued → ASTRA Villa',
        caption: 'Before → After transformation 🔨 Investment: Rp 800M + Rp 150M reno = Rp 950M. Current value: Rp 1.4B. ROI: 47% 📈 Ini power of buying undervalued + smart renovation.',
        hashtags: ['Renovation', 'BeforeAfter', 'PropertyFlip', 'ROI', 'SmartRenovation'],
        visualDesc: 'Split screen or transition: dark/rundown before → bright/modern after. Each room. End with ROI calculation overlay + ASTRA Villa branding.',
      },
      {
        title: 'Smart Home Feature Showcase',
        hook: '"Properti masa depan sudah di sini. Ini fitur smart home yang naikkan rental premium 25%."',
        format: 'carousel', platform: ['instagram'], frequency: '1x / 2 weeks',
        cta: 'Explore smart-enabled properties → ASTRA Villa',
        caption: 'Smart home = higher rental premium 💡 Data kami menunjukkan properti dengan fitur smart home mendapat 25% premium di rental market. Swipe untuk lihat fitur paling impactful →',
        hashtags: ['SmartHome', 'PropTech', 'FutureProperty', 'RentalPremium'],
        visualDesc: 'Each slide: one smart feature (lighting, security, climate, entertainment) with photo + stat on rental impact. Clean minimal design.',
      },
      {
        title: 'Investment Lifestyle: "Why I Invest in Property"',
        hook: '"Passive income dari 2 unit apartment = Rp 25jt/bulan. Ini journey saya."',
        format: 'reel', platform: ['instagram', 'tiktok', 'linkedin'], frequency: '1x / 2 weeks',
        cta: 'Start your investment journey → ASTRA Villa',
        caption: 'Real investor story 🎯 Dari 0 ke 2 unit dalam 18 bulan. Monthly passive income: Rp 25M. Tools yang dipakai? AI-powered analysis dari ASTRA Villa.',
        hashtags: ['InvestorStory', 'PassiveIncome', 'PropertyJourney', 'FinancialFreedom'],
        visualDesc: 'Talking head or voiceover with lifestyle B-roll. Show real numbers. Brief platform demo clip. Authentic, not overly polished.',
      },
    ],
  },
];

const WEEKLY_CALENDAR = [
  { day: 'Mon', posts: [{ theme: 'ai-deals', format: 'Reel', title: 'AI Deal Discovery' }, { theme: 'market-intel', format: 'Story', title: 'Market Quick Stat' }] },
  { day: 'Tue', posts: [{ theme: 'lifestyle', format: 'Reel', title: 'Villa Tour / Reno' }, { theme: 'ai-deals', format: 'Story', title: 'Score of the Day' }] },
  { day: 'Wed', posts: [{ theme: 'market-intel', format: 'Reel', title: 'City Trend Video' }, { theme: 'ai-deals', format: 'Carousel', title: 'Before vs After Prediction' }] },
  { day: 'Thu', posts: [{ theme: 'ai-deals', format: 'Reel', title: 'How AI Scores Work' }, { theme: 'market-intel', format: 'Story', title: 'Growth Zone Alert' }] },
  { day: 'Fri', posts: [{ theme: 'ai-deals', format: 'Carousel', title: 'Top 3 Deals This Week' }, { theme: 'lifestyle', format: 'Reel', title: 'Smart Home Feature' }] },
  { day: 'Sat', posts: [{ theme: 'market-intel', format: 'Carousel', title: 'Yield Comparison' }] },
  { day: 'Sun', posts: [{ theme: 'lifestyle', format: 'Reel', title: 'Investor Lifestyle Story' }] },
];

const THEME_DOT: Record<ContentTheme, string> = {
  'ai-deals': 'bg-amber-400',
  'market-intel': 'bg-sky-400',
  'lifestyle': 'bg-rose-400',
};

function ContentIdeaCard({ idea }: { idea: ContentIdea }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Play className="h-3 w-3 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{idea.title}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${FORMAT_CLS[idea.format]}`}>{idea.format}</Badge>
            {idea.platform.map(p => {
              const PIcon = PLATFORM_ICON[p];
              return <PIcon key={p} className="h-3 w-3 text-muted-foreground" />;
            })}
            <Badge variant="outline" className="text-[8px] h-4">{idea.frequency}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 italic line-clamp-1">{idea.hook}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              <Separator className="opacity-10" />

              {/* Hook */}
              <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Opening Hook</span>
                <p className="text-[11px] text-foreground font-medium italic mt-0.5">{idea.hook}</p>
              </div>

              {/* Visual description */}
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider font-bold">Visual Direction</span>
                <p className="text-foreground leading-relaxed mt-0.5">{idea.visualDesc}</p>
              </div>

              {/* Caption */}
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider font-bold">Caption Template</span>
                <p className="text-foreground leading-relaxed mt-0.5 whitespace-pre-line">{idea.caption}</p>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {idea.hashtags.map(h => (
                  <Badge key={h} variant="outline" className="text-[8px] h-4 text-muted-foreground">
                    <Hash className="h-2 w-2 mr-0.5" />{h}
                  </Badge>
                ))}
              </div>

              {/* CTA */}
              <div className="rounded-lg bg-emerald-400/5 border border-emerald-400/15 px-3 py-2">
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Call to Action</span>
                <p className="text-[10px] text-foreground font-medium mt-0.5">{idea.cta}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeCard({ theme }: { theme: ThemeSection }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = theme.icon;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${theme.borderClass} ${theme.bgClass}/10 shrink-0`}>
          <Icon className={`h-5 w-5 ${theme.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{theme.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{theme.ideas.length} content ideas</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{theme.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              <Separator className="opacity-15" />
              <div className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold">Theme Purpose</span>
                <p className="text-[10px] text-foreground leading-relaxed mt-0.5">{theme.purpose}</p>
              </div>
              {theme.ideas.map((idea, i) => <ContentIdeaCard key={i} idea={idea} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SocialMediaStrategyPage() {
  const totalIdeas = THEMES.reduce((s, t) => s + t.ideas.length, 0);
  const weeklyPosts = WEEKLY_CALENDAR.reduce((s, d) => s + d.posts.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Social Media Content Strategy</h1>
              <p className="text-xs text-muted-foreground">Brand positioning through AI deal discovery, market intelligence, and lifestyle content</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Content Themes', value: THEMES.length, icon: Palette },
              { label: 'Content Ideas', value: totalIdeas, icon: Sparkles },
              { label: 'Weekly Posts', value: weeklyPosts, icon: Calendar },
              { label: 'Platforms', value: '3', icon: Share2 },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Brand voice */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Brand Voice & Positioning</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                <span className="text-foreground font-bold block mb-0.5">Tone</span>
                <p className="text-muted-foreground">Confident data expert, not salesy. Share insights like an insider. Educational but exclusive.</p>
              </div>
              <div className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                <span className="text-foreground font-bold block mb-0.5">Language</span>
                <p className="text-muted-foreground">Mix Bahasa Indonesia + English terms. Use "AI", "score", "yield", "ROI" naturally. Avoid jargon overload.</p>
              </div>
              <div className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                <span className="text-foreground font-bold block mb-0.5">Universal CTA</span>
                <p className="text-foreground font-medium italic">"Discover AI-ranked investment opportunities →"</p>
              </div>
            </div>
          </div>

          {/* Weekly calendar */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Weekly Content Calendar</span>
              <Badge variant="outline" className="text-[9px] h-5">{weeklyPosts} posts / week</Badge>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKLY_CALENDAR.map(d => (
                <div key={d.day} className="rounded-lg border border-border/15 bg-muted/5 p-2 min-h-[80px]">
                  <span className="text-[10px] font-bold text-foreground block mb-1.5">{d.day}</span>
                  <div className="space-y-1">
                    {d.posts.map((p, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${THEME_DOT[p.theme as ContentTheme]}`} />
                        <div>
                          <span className="text-[8px] text-foreground block leading-tight">{p.title}</span>
                          <span className="text-[7px] text-muted-foreground/50">{p.format}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[9px]">
              {THEMES.map(t => (
                <div key={t.id} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${THEME_DOT[t.id]}`} />
                  <span className="text-muted-foreground">{t.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content mix */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-bold text-foreground">Content Mix Distribution</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { theme: 'AI Deal Discovery', pct: '50%', rationale: 'Core differentiator. Highest engagement potential. Directly drives platform signups.' },
                { theme: 'Market Intelligence', pct: '30%', rationale: 'Builds authority and trust. SEO value from LinkedIn articles. Attracts serious investors.' },
                { theme: 'Lifestyle & Luxury', pct: '20%', rationale: 'Broadens audience. Emotional hook. Higher shareability for organic reach expansion.' },
              ].map(m => (
                <div key={m.theme} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-foreground">{m.theme}</span>
                    <span className="text-sm font-bold text-foreground">{m.pct}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{m.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* KPI targets */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground">Monthly Growth Targets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Followers Growth', target: '+500/mo' },
                { label: 'Avg Reel Views', target: '5K+' },
                { label: 'Link Clicks', target: '200+/mo' },
                { label: 'Engagement Rate', target: '>4%' },
                { label: 'Platform Signups from Social', target: '50+/mo' },
              ].map(k => (
                <div key={k.label} className="rounded-lg border border-emerald-400/10 bg-emerald-400/5 p-2.5 text-center">
                  <span className="text-base font-bold text-foreground">{k.target}</span>
                  <span className="block text-[8px] text-muted-foreground uppercase mt-0.5">{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme sections */}
      <div className="container mx-auto px-4 py-6 space-y-3">
        {THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
      </div>
    </div>
  );
}
