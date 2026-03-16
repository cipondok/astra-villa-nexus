
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Paintbrush, Layout, Image, Search, Smartphone, MousePointerClick,
  Eye, Type, Palette, Layers, Grid3x3, ArrowUpRight, Sparkles,
  Star, CheckCircle, MapPin, SlidersHorizontal, MessageSquare,
  Shield, Zap, Target, TrendingUp, Monitor, Hand
} from 'lucide-react';

interface DesignItem {
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  impact: 'Critical' | 'High' | 'Medium';
  specs?: string[];
}

interface DesignSection {
  key: string;
  label: string;
  icon: typeof Layout;
  color: string;
  items: DesignItem[];
}

const priCls: Record<string, string> = {
  P0: 'border-destructive/50 text-destructive bg-destructive/10',
  P1: 'border-amber-500/50 text-amber-500 bg-amber-500/10',
  P2: 'border-blue-500/50 text-blue-500 bg-blue-500/10',
  P3: 'border-muted-foreground/30 text-muted-foreground bg-muted/30',
};

const impactCls: Record<string, string> = {
  Critical: 'text-destructive',
  High: 'text-amber-500',
  Medium: 'text-blue-500',
};

const sections: DesignSection[] = [
  {
    key: 'homepage', label: 'Homepage Redesign', icon: Layout, color: 'text-blue-500',
    items: [
      {
        title: 'Hero Section — Search-Dominant Layout',
        description: 'Full-viewport hero with cinematic property background, oversized search bar as the visual anchor, and value proposition in 8 words or fewer.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Search bar: min-height 56px, rounded-2xl, backdrop-blur-xl bg-background/80, shadow-2xl',
          'Hero text: font-display 48-64px, font-bold, max-width 640px, text-foreground',
          'Subtext: text-muted-foreground 16-18px, max 120 characters',
          'Background: lazy-loaded WebP, object-cover with gradient overlay from-background/90 via-background/40 to-transparent',
          'CTA cluster: primary search + secondary "Browse AI Deals" ghost button',
          'Mobile: stack vertically, search bar full-width, hero text 32px',
        ],
      },
      {
        title: 'Trust Indicator Strip',
        description: 'Horizontal strip below hero showing key social proof metrics — listing count, agent count, city coverage, AI accuracy.',
        priority: 'P0', impact: 'High',
        specs: [
          'Layout: flex justify-evenly, py-4, border-y border-border/30, bg-muted/20',
          'Each stat: large number (text-2xl font-bold) + label (text-xs text-muted-foreground)',
          'Animate numbers on scroll-into-view using countUp pattern',
          'Icons: 16x16 text-primary prefix on each stat',
          'Mobile: 2x2 grid with reduced padding',
        ],
      },
      {
        title: 'Featured Listings Carousel',
        description: 'Premium property showcase with large cards, AI deal score badges, and smooth horizontal scroll.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Card width: 380px desktop, 300px mobile, aspect-ratio 4/3 image',
          'AI Deal Score: absolute top-right badge, rounded-full, bg-primary text-primary-foreground',
          'Price: text-xl font-bold, positioned over image gradient overlay',
          'Location: text-sm text-muted-foreground with MapPin icon',
          'Hover: scale-[1.02] transition-transform, shadow-xl elevation',
          'Auto-scroll with pause-on-hover, dot indicators below',
        ],
      },
      {
        title: 'AI Intelligence Highlight Section',
        description: 'Dedicated section showcasing AI valuation, deal signals, and investment intelligence as a key differentiator.',
        priority: 'P1', impact: 'High',
        specs: [
          'Layout: asymmetric 2-column — left: feature text stack, right: animated dashboard mockup',
          'Background: subtle gradient from-muted/10, glassmorphic cards',
          'Feature list: icon + title + 1-line description, 4 features stacked',
          'Visual: floating card animations with staggered entry (framer-motion)',
          'CTA: "Explore AI Insights" button, variant="outline" with arrow icon',
        ],
      },
    ],
  },
  {
    key: 'cards', label: 'Listing Card Design', icon: Grid3x3, color: 'text-green-500',
    items: [
      {
        title: 'Card Image Presentation',
        description: 'Modern image treatment with consistent aspect ratio, lazy loading, skeleton placeholders, and subtle hover zoom.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Aspect ratio: 16/10 for grid cards, 4/3 for featured cards',
          'Border-radius: rounded-xl on card, rounded-t-xl on image',
          'Skeleton: animate-pulse bg-muted/50 matching image dimensions',
          'Hover: image scale-[1.05] transition-transform duration-500 overflow-hidden',
          'Photo count badge: absolute bottom-left, bg-background/80 backdrop-blur-sm, rounded-md px-2',
          'Lazy loading: loading="lazy" with IntersectionObserver trigger',
        ],
      },
      {
        title: 'Price & Deal Score Hierarchy',
        description: 'Price as the strongest visual element on each card, with AI deal score as a complementary trust badge.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Price: text-lg font-bold text-foreground, formatted with locale currency',
          'Price period (per month/year): text-xs text-muted-foreground inline suffix',
          'Deal Score badge: absolute top-right, w-10 h-10 rounded-full flex items-center justify-center',
          'Score colors: ≥80 bg-green-500, 60-79 bg-amber-500, <60 bg-muted, all text-white',
          'Score tooltip on hover: "AI Valuation Score — indicates deal strength"',
          'If no score: hide badge entirely, never show 0 or N/A',
        ],
      },
      {
        title: 'Card Information Density',
        description: 'Balanced info display — title, location, key specs (beds/baths/area), and subtle metadata without clutter.',
        priority: 'P1', impact: 'High',
        specs: [
          'Title: text-sm font-semibold line-clamp-1, text-foreground',
          'Location: text-xs text-muted-foreground, MapPin icon h-3 w-3 inline',
          'Specs row: flex gap-3, each spec with icon (Bed, Bath, Maximize) h-3.5 w-3.5 text-muted-foreground',
          'Spec text: text-xs text-foreground, values only (no labels on mobile)',
          'Card padding: p-3 bottom section, gap-1 between elements',
          'Max card content height: 120px to maintain grid alignment',
        ],
      },
      {
        title: 'Interactive Hover States',
        description: 'Refined hover experience with elevation change, save button reveal, and quick-view preview trigger.',
        priority: 'P2', impact: 'Medium',
        specs: [
          'Default: shadow-sm border-border/50',
          'Hover: shadow-lg -translate-y-1 transition-all duration-300',
          'Save button: absolute top-left, opacity-0 group-hover:opacity-100 transition-opacity',
          'Save icon: Heart, h-5 w-5, stroke-2, filled state for saved',
          'Quick-view: optional overlay button on image hover "Quick View"',
          'Focus state: ring-2 ring-primary/50 for keyboard accessibility',
        ],
      },
    ],
  },
  {
    key: 'detail', label: 'Property Detail Page', icon: Eye, color: 'text-purple-500',
    items: [
      {
        title: 'Image Gallery Experience',
        description: 'Premium gallery with main hero image, thumbnail strip, lightbox modal, and swipe support on mobile.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Hero image: aspect-ratio 16/9, rounded-xl, max-height 500px',
          'Thumbnail strip: flex gap-2 below hero, 4-5 visible, overflow-x-auto snap-x',
          'Thumbnail: w-20 h-14 rounded-lg object-cover, ring-2 ring-primary for active',
          'Lightbox: full-screen modal, bg-background/95 backdrop-blur-xl, arrow navigation',
          'Mobile: single image with swipe (touch-action: pan-x), dot indicators',
          '"View all photos" button if >5 images, text-xs underline',
        ],
      },
      {
        title: 'Investment Insight Panel',
        description: 'Dedicated right-sidebar panel showing AI valuation, yield estimate, market trend, and deal signal summary.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Layout: sticky top-20, w-[380px] on desktop, full-width below content on mobile',
          'Container: rounded-xl border border-border/50, bg-card shadow-lg',
          'AI Score: large circular gauge (80px), score number centered, color-coded ring',
          'Metrics grid: 2x2 grid — estimated yield, price/sqm, market trend, demand score',
          'Each metric: label text-[10px] text-muted-foreground, value text-sm font-bold',
          'Signal summary: 3-4 bullet points with green/amber/red dot indicators',
        ],
      },
      {
        title: 'CTA Button Hierarchy',
        description: 'Clear primary-secondary-tertiary action hierarchy — Inquiry > Schedule Visit > Save > Share.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Primary CTA: "Send Inquiry" — full-width, h-12, bg-primary text-primary-foreground, font-semibold',
          'Secondary: "Schedule Visit" — full-width, h-11, variant="outline", border-primary',
          'Tertiary row: flex gap-2 — "Save" (Heart) + "Share" (Share2), both variant="ghost" h-10',
          'Trust microcopy: "Agent typically responds within 2 hours" text-[10px] text-muted-foreground below CTA',
          'Social proof: "12 people viewed this week" with Eye icon, text-xs',
          'Mobile: sticky bottom bar with "Inquiry" + "Call" buttons, h-14 safe-area-inset-bottom',
        ],
      },
      {
        title: 'Sticky Action Bar',
        description: 'Fixed bottom bar on scroll showing price, key info summary, and primary CTA for instant action.',
        priority: 'P1', impact: 'High',
        specs: [
          'Trigger: appears after scrolling past the main CTA section (~400px)',
          'Layout: fixed bottom-0 w-full, bg-background/95 backdrop-blur-xl border-t border-border/50',
          'Content: flex items-center justify-between px-4 py-3',
          'Left: property price (font-bold) + location (text-xs text-muted-foreground)',
          'Right: "Send Inquiry" button, h-10, bg-primary rounded-lg',
          'Animation: translate-y-full to translate-y-0 transition-transform duration-300',
        ],
      },
    ],
  },
  {
    key: 'search', label: 'Search & Results', icon: Search, color: 'text-amber-500',
    items: [
      {
        title: 'Filter Panel Redesign',
        description: 'Collapsible sidebar filters with clear visual grouping, active filter pills, and one-tap reset.',
        priority: 'P0', impact: 'High',
        specs: [
          'Desktop: w-[280px] sticky sidebar, collapsible accordion sections',
          'Mobile: full-screen bottom sheet with "Apply Filters" sticky footer',
          'Filter groups: Property Type, Price Range, Bedrooms, Location, AI Score',
          'Active filters: pill badges above results — flex flex-wrap gap-1.5, each with X close',
          'Range slider: dual-thumb for price, styled with bg-primary track',
          'Reset: "Clear all" link text-xs text-destructive, top-right of filter panel',
          'Filter count: badge on mobile trigger button showing active count',
        ],
      },
      {
        title: 'Results Grid Density',
        description: 'Optimized grid layout with view toggle (grid/list), responsive column counts, and consistent card heights.',
        priority: 'P1', impact: 'High',
        specs: [
          'Desktop grid: 3 columns (with sidebar) or 4 columns (full-width), gap-4',
          'Tablet: 2 columns, gap-3',
          'Mobile: 1 column full-width or 2 columns compact, gap-2',
          'List view: horizontal card — image left (w-48), info right, full-width row',
          'View toggle: icon buttons top-right of results, Grid3x3 / List icons',
          'Sort dropdown: "Relevance / Price ↑ / Price ↓ / Newest / AI Score" options',
          'Results count: "Showing 1-24 of 1,847 properties" text-sm text-muted-foreground',
        ],
      },
      {
        title: 'Map Integration Concept',
        description: 'Split-view option with interactive map showing property pins, cluster groups, and price labels.',
        priority: 'P2', impact: 'Medium',
        specs: [
          'Layout: 50/50 split — left: scrollable results list, right: sticky map',
          'Map pins: custom markers with price labels (rounded-full bg-primary px-2 py-0.5)',
          'Cluster: circle with count number when zoomed out',
          'Pin hover: popup card preview with image + price + title',
          'Mobile: toggle between "List" and "Map" views, not split',
          'Map provider: consider Mapbox GL for performance, or Google Maps for familiarity',
        ],
      },
      {
        title: 'Infinite Scroll with Skeleton Loading',
        description: 'Prefer infinite scroll over pagination for engagement, with skeleton card placeholders during load.',
        priority: 'P1', impact: 'Medium',
        specs: [
          'Trigger: IntersectionObserver on sentinel div 200px before bottom',
          'Loading state: 3 skeleton cards matching real card dimensions',
          'Skeleton: rounded-xl bg-muted/50 animate-pulse, image + 3 text lines',
          'Page size: 24 items per batch for optimal perceived speed',
          'Back-navigation: restore scroll position with sessionStorage cache',
          'Fallback: "Load more" button if IntersectionObserver unsupported',
        ],
      },
    ],
  },
  {
    key: 'brand', label: 'Brand Visual Identity', icon: Palette, color: 'text-pink-500',
    items: [
      {
        title: 'Color System — Emotional Positioning',
        description: 'Refined palette balancing luxury gold accents with clean neutrals — trust, premium, intelligence.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Primary: gold (HSL 45 100% 50%) — luxury, premium, warmth',
          'Primary foreground: deep charcoal (HSL 0 0% 10%) — contrast on gold',
          'Background: near-white (HSL 40 20% 98%) light / deep navy (HSL 222 25% 8%) dark',
          'Card: warm white (HSL 40 15% 97%) light / charcoal (HSL 222 20% 12%) dark',
          'Accent: soft blue (HSL 210 80% 55%) — trust, intelligence, AI association',
          'Destructive: coral red (HSL 0 72% 51%) — urgency, alerts',
          'Muted: warm gray (HSL 40 10% 46%) — secondary text, borders',
          'Success: emerald (HSL 152 60% 42%) — deal scores, positive signals',
        ],
      },
      {
        title: 'Typography Hierarchy System',
        description: 'Distinctive type pairing — display serif for headlines, refined sans-serif for body — creating editorial premium feel.',
        priority: 'P0', impact: 'High',
        specs: [
          'Display font: Playfair Display or DM Serif Display — hero headings, section titles',
          'Body font: Inter or DM Sans — body text, UI labels, form inputs',
          'Scale: 48/36/28/24/20/16/14/12/10px — 8 levels with 1.2-1.5 line-height',
          'Hero heading: display font, 48px desktop / 32px mobile, font-bold, tracking-tight',
          'Section heading: display font, 28px, font-semibold',
          'Body: body font, 16px/14px, font-normal, text-foreground',
          'Caption: body font, 12px/10px, text-muted-foreground',
          'Letter-spacing: -0.02em on large headings, normal on body',
        ],
      },
      {
        title: 'Spacing Rhythm & Layout Grid',
        description: '8px base grid with consistent spacing tokens creating visual rhythm across all components.',
        priority: 'P1', impact: 'High',
        specs: [
          'Base unit: 8px (0.5rem)',
          'Spacing scale: 4/8/12/16/24/32/48/64/96px',
          'Section padding: py-16 (desktop) / py-10 (mobile)',
          'Card padding: p-4 (16px) standard, p-3 (12px) compact',
          'Container max-width: 1280px with px-4 gutter',
          'Component gap: gap-4 standard, gap-6 for major sections',
          'Vertical rhythm: consistent mb-8 between major sections',
        ],
      },
      {
        title: 'Premium Surface Treatment',
        description: 'Glassmorphic cards with soft shadows, subtle borders, and layered depth for luxury perception.',
        priority: 'P1', impact: 'High',
        specs: [
          'Card surface: bg-card/60 backdrop-blur-sm border border-border/50',
          'Elevated card: shadow-lg shadow-primary/5 for featured items',
          'Glass effect: backdrop-blur-xl bg-background/80 for overlays and sticky bars',
          'Border treatment: border-border/30 default, border-primary/20 for highlighted',
          'Hover elevation: shadow-xl -translate-y-0.5 transition-all duration-300',
          'Dark mode: increase border opacity to /40, add subtle inner glow with ring-1 ring-white/5',
          'Gradient overlays: linear-gradient with HSL from design tokens only',
        ],
      },
    ],
  },
  {
    key: 'conversion', label: 'Conversion UX', icon: MousePointerClick, color: 'text-emerald-500',
    items: [
      {
        title: 'Lead Capture Flow Optimization',
        description: 'Streamlined inquiry form — minimal fields, progressive disclosure, instant confirmation feedback.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Initial form: only Name + Phone + Message (3 fields max)',
          'Progressive: expand to email + budget + move-in date on second interaction',
          'Input styling: h-11, rounded-lg, border-border focus:ring-2 focus:ring-primary/50',
          'Submit button: full-width, h-12, bg-primary, "Send Inquiry" with arrow icon',
          'Success state: checkmark animation + "Agent will respond within 2 hours" message',
          'Error state: inline red text below field, shake animation on submit',
          'Auto-fill: detect returning users, pre-populate from localStorage (with consent)',
        ],
      },
      {
        title: 'Inquiry Button Visibility Rules',
        description: 'CTA buttons must be visible at all times during property browsing — never more than one scroll away.',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Listing card: subtle "Inquire" text link bottom-right, becomes button on hover',
          'Detail page: primary CTA in sidebar (always visible on desktop)',
          'Mobile detail: floating bottom bar with "Inquire" + "Call Agent" always visible',
          'Search results: each card has inquiry icon button, revealed on hover/tap',
          'Contrast: CTA must pass WCAG AAA contrast ratio against any background',
          'Size: minimum 44x44px touch target on all interactive CTAs',
        ],
      },
      {
        title: 'Trust & Urgency Microcopy',
        description: 'Strategic microcopy near CTAs to build confidence and create gentle urgency without being pushy.',
        priority: 'P1', impact: 'High',
        specs: [
          'Trust: "Verified Agent" badge next to agent name, shield icon',
          'Trust: "Free, no obligation inquiry" below inquiry CTA',
          'Trust: "Your data is secure and never shared" with lock icon, text-[10px]',
          'Urgency: "X people viewing now" (if >3 concurrent), Eye icon pulse animation',
          'Scarcity: "Only X units remaining" for developer projects, amber text',
          'Social proof: "Last inquiry 2 hours ago" timestamp, relative format',
          'AI trust: "AI-verified pricing" badge on listings with valuation data',
        ],
      },
      {
        title: 'Post-Inquiry Engagement Loop',
        description: 'After inquiry submission, guide users to related properties, save favorites, and create account.',
        priority: 'P2', impact: 'Medium',
        specs: [
          'Step 1: Success confirmation modal with agent photo + response time estimate',
          'Step 2: "While you wait" — show 3 similar properties carousel',
          'Step 3: "Save your search" prompt with email input for alerts',
          'Step 4: Soft account creation — "Create account to track your inquiries"',
          'Email follow-up: automated "Your inquiry was received" email within 60 seconds',
          'Return visit: show "You inquired about this property" badge on revisit',
        ],
      },
    ],
  },
  {
    key: 'mobile', label: 'Mobile-First UX', icon: Smartphone, color: 'text-cyan-500',
    items: [
      {
        title: 'Thumb-Zone CTA Placement',
        description: 'All primary actions positioned in the natural thumb reach zone (bottom 40% of screen).',
        priority: 'P0', impact: 'Critical',
        specs: [
          'Bottom nav: fixed bottom-0, h-16, 4-5 items, safe-area-inset-bottom padding',
          'Inquiry CTA: always in bottom sticky bar, never above the fold only',
          'Search bar: top position BUT with "Search" button in bottom nav for re-access',
          'Filters: bottom sheet (not top dropdown) triggered from bottom action area',
          'Swipe actions: swipe-left on cards to save, swipe-right to inquire (optional)',
          'FAB (Floating Action Button): bottom-right, 56px, for quick inquiry on listings',
        ],
      },
      {
        title: 'Card Stacking & Feed Logic',
        description: 'Vertical card feed optimized for one-thumb scrolling with clear visual separation.',
        priority: 'P0', impact: 'High',
        specs: [
          'Card width: 100% - 32px (16px padding each side)',
          'Card gap: 12px (gap-3) for clear separation',
          'Image height: 200px fixed or aspect-ratio 16/10',
          'Info section: max 3 lines — title, location, specs row',
          'Price: always visible, text-base font-bold, top-right of info section',
          'Scroll behavior: smooth scroll-snap-type: y proximity for card alignment',
          'Pull-to-refresh: native-feel refresh animation at top',
        ],
      },
      {
        title: 'Quick Inquiry Floating Button',
        description: 'Persistent floating button on property pages that expands into a mini inquiry form.',
        priority: 'P1', impact: 'High',
        specs: [
          'Default state: 56px circle, bg-primary, MessageSquare icon, bottom-right',
          'Position: bottom-20 right-4 (above bottom nav)',
          'Tap: expand to mini form (name + phone + send) with spring animation',
          'Form: rounded-2xl shadow-2xl bg-card, 280px wide, absolute bottom-right',
          'Close: tap outside or X button, collapse animation back to circle',
          'Badge: unread count dot if agent has responded to previous inquiry',
          'Haptic: light vibration feedback on tap (navigator.vibrate)',
        ],
      },
      {
        title: 'Mobile Performance Standards',
        description: 'Core Web Vitals targets and performance optimizations for mobile-first experience.',
        priority: 'P1', impact: 'High',
        specs: [
          'LCP (Largest Contentful Paint): < 2.5 seconds',
          'FID (First Input Delay): < 100ms',
          'CLS (Cumulative Layout Shift): < 0.1',
          'Image optimization: WebP format, srcset with 2x/3x, loading="lazy"',
          'Font loading: font-display: swap, preload critical fonts',
          'Bundle: code-split routes, lazy-load below-fold sections',
          'Offline: service worker for cached property data on revisit',
        ],
      },
    ],
  },
];

const UIUXRedesignBlueprint = () => {
  const [activeTab, setActiveTab] = useState('homepage');

  const section = sections.find(s => s.key === activeTab)!;
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const p0Count = sections.reduce((acc, s) => acc + s.items.filter(i => i.priority === 'P0').length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">UI/UX Redesign Blueprint</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete design system upgrade — {totalItems} specifications across {sections.length} areas · {p0Count} critical priorities
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {sections.map(s => {
          const p0 = s.items.filter(i => i.priority === 'P0').length;
          return (
            <button key={s.key} onClick={() => setActiveTab(s.key)}
              className={`rounded-xl p-3 text-left transition-all border ${
                activeTab === s.key ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/40 hover:bg-muted/50'
              }`}>
              <s.icon className={`h-4 w-4 ${s.color} mb-1`} />
              <p className="text-[10px] font-semibold text-foreground line-clamp-1">{s.label}</p>
              <p className="text-[9px] text-muted-foreground">{s.items.length} specs · {p0} P0</p>
            </button>
          );
        })}
      </div>

      {/* Active Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <section.icon className={`h-6 w-6 ${section.color}`} />
          <div>
            <h2 className="text-lg font-bold text-foreground">{section.label}</h2>
            <p className="text-[11px] text-muted-foreground">{section.items.length} design specifications</p>
          </div>
        </div>

        {section.items.map((item, idx) => (
          <Card key={idx} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm text-foreground">{item.title}</CardTitle>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${priCls[item.priority]}`}>{item.priority}</Badge>
                  <span className={`text-[9px] font-medium ${impactCls[item.impact]}`}>{item.impact}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{item.description}</p>
            </CardHeader>
            {item.specs && (
              <CardContent className="pt-0">
                <div className="bg-muted/20 rounded-lg p-3 space-y-1.5">
                  {item.specs.map((spec, si) => (
                    <div key={si} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground font-mono leading-relaxed">{spec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Implementation Priority Matrix */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Implementation Priority Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(['P0', 'P1', 'P2', 'P3'] as const).map(pri => {
              const items = sections.flatMap(s => s.items.filter(i => i.priority === pri));
              const labels: Record<string, string> = { P0: 'Ship This Week', P1: 'Ship This Sprint', P2: 'Next Sprint', P3: 'Backlog' };
              return (
                <div key={pri} className="border border-border/40 rounded-lg p-3 bg-card/40">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={`text-[9px] ${priCls[pri]}`}>{pri} — {labels[pri]}</Badge>
                    <span className="text-[10px] font-bold text-foreground">{items.length}</span>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-1 mb-1">
                      <span className="text-[8px] text-muted-foreground mt-0.5">•</span>
                      <span className="text-[9px] text-muted-foreground line-clamp-1">{item.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Design Principles */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Core Design Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, title: 'Trust First', desc: 'Every element builds confidence — verified badges, agent photos, real data, transparent pricing' },
              { icon: Zap, title: 'Speed Obsessed', desc: 'Sub-2s loads, instant interactions, skeleton loading, optimistic UI updates' },
              { icon: TrendingUp, title: 'Conversion Driven', desc: 'CTAs always reachable, minimal form friction, progressive disclosure, urgency signals' },
              { icon: Smartphone, title: 'Mobile Native', desc: 'Thumb-zone actions, bottom sheets, swipe gestures, 44px touch targets, offline-first' },
            ].map((p, i) => (
              <div key={i} className="border border-border/40 rounded-lg p-3 bg-card/40">
                <p.icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-[11px] font-semibold text-foreground mb-1">{p.title}</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIUXRedesignBlueprint;
