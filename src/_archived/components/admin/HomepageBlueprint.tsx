
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Layout, Search, Image, TrendingUp, Shield, MapPin, Megaphone,
  Sparkles, CheckCircle, Eye, Star, Users, Building, BarChart3,
  ArrowRight, Heart, Cpu, Globe, DollarSign, Lightbulb, Target,
  MousePointerClick, ChevronRight, Layers, Smartphone
} from 'lucide-react';

interface SectionBlock {
  key: string;
  order: number;
  label: string;
  icon: typeof Layout;
  color: string;
  purpose: string;
  layout: string;
  specs: { label: string; detail: string }[];
  styleNotes: string[];
}

const homepage: SectionBlock[] = [
  {
    key: 'hero', order: 1, label: 'Hero Section', icon: Image, color: 'text-amber-500',
    purpose: 'Create immediate premium impression, communicate AI intelligence positioning, and drive search action.',
    layout: 'Full-viewport hero (100vh) with cinematic property image background, centered content overlay, and dominant search bar.',
    specs: [
      { label: 'Background', detail: 'Full-bleed high-res property image (lazy WebP), overlaid with gradient: bg-gradient-to-t from-background via-background/60 to-background/20' },
      { label: 'Headline', detail: '"Discover Intelligent Property Investments" — font-display (serif), 48px desktop / 32px mobile, font-bold, tracking-tight, text-foreground, max-w-2xl mx-auto text-center' },
      { label: 'Subheadline', detail: '"AI-powered deal signals, market intelligence, and verified listings across Indonesia" — text-lg text-muted-foreground, max-w-xl, mt-3' },
      { label: 'Search Bar', detail: 'Centered, max-w-3xl, h-14, rounded-2xl, bg-background/90 backdrop-blur-xl, shadow-2xl, border border-border/30, mt-8' },
      { label: 'Trust Micro-Badge', detail: 'Below search: "🔒 AI-verified listings · Trusted by 500+ agents" — text-xs text-muted-foreground, mt-3, flex items-center gap-2' },
      { label: 'Scroll Indicator', detail: 'Animated chevron-down at bottom, opacity-50, bounce animation, hidden on mobile' },
    ],
    styleNotes: [
      'Hero image: curated luxury property exterior, warm golden-hour lighting',
      'Gradient overlay must preserve text readability on any image',
      'No cluttered navigation overlapping hero — keep clean and breathable',
      'Mobile: reduce image height to 85vh, increase gradient darkness',
    ],
  },
  {
    key: 'search', order: 2, label: 'Quick Search Interaction', icon: Search, color: 'text-blue-500',
    purpose: 'Enable fast property discovery with minimal friction — location + type + budget in one action.',
    layout: 'Integrated into hero section as a multi-segment search bar with expandable filters.',
    specs: [
      { label: 'Location Input', detail: 'Left segment, flex-1, placeholder "Search by city, district, or project…", auto-suggest dropdown with MapPin icons, debounced 300ms API call' },
      { label: 'Property Type', detail: 'Dropdown selector — Apartment, House, Villa, Land, Commercial — icon prefix per type, default "All Types"' },
      { label: 'Price Chips', detail: 'Quick filter row below search bar: "< Rp 500M", "500M–1B", "1B–3B", "3B+" — rounded-full border border-border/50, px-3 py-1, text-xs, active: bg-primary text-primary-foreground' },
      { label: 'Search CTA', detail: 'Right segment, bg-primary text-primary-foreground, h-14, px-8, rounded-r-2xl (or rounded-2xl on mobile), "Search" with Search icon' },
      { label: 'Advanced Toggle', detail: '"More filters" text link below chips, opens slide-down panel with bedrooms, area, AI score range' },
      { label: 'Recent Searches', detail: 'On focus, show 3 recent searches with Clock icon, stored in localStorage' },
    ],
    styleNotes: [
      'Auto-suggest dropdown: bg-card/95 backdrop-blur-xl, rounded-xl, shadow-xl, max-h-64 overflow-y-auto',
      'Each suggestion: flex items-center gap-2, py-2 px-3, hover:bg-muted/50, MapPin icon text-muted-foreground',
      'Mobile: stack vertically — location input full-width, type + price row below, search button full-width',
      'Transition: search bar slightly elevates (shadow-2xl → shadow-3xl) on focus',
    ],
  },
  {
    key: 'featured', order: 3, label: 'Featured Listings Carousel', icon: Star, color: 'text-green-500',
    purpose: 'Showcase premium properties with visual impact, AI deal scores, and hover engagement.',
    layout: 'Horizontal scroll carousel with large cards, section heading, and navigation arrows.',
    specs: [
      { label: 'Section Header', detail: '"Featured Properties" — font-display 28px font-semibold + "Curated with AI Deal Intelligence" subtitle text-sm text-muted-foreground, flex justify-between with "View all →" link' },
      { label: 'Card Size', detail: 'w-[380px] desktop / w-[300px] mobile, rounded-xl overflow-hidden, border border-border/30, bg-card' },
      { label: 'Card Image', detail: 'aspect-ratio 16/10, object-cover, hover: scale-[1.05] transition-transform duration-500' },
      { label: 'Deal Score Badge', detail: 'Absolute top-right (top-3 right-3), w-11 h-11 rounded-full flex items-center justify-center, font-bold text-sm — ≥80: bg-green-500, 60-79: bg-amber-500, <60: bg-muted — text-white, shadow-lg' },
      { label: 'Price Overlay', detail: 'Absolute bottom of image, bg-gradient-to-t from-black/70, text-white font-bold text-lg, px-4 pb-3' },
      { label: 'Card Info', detail: 'p-4 — Title (text-sm font-semibold line-clamp-1), Location (text-xs text-muted-foreground flex gap-1 MapPin icon), Specs row (beds/baths/area text-xs flex gap-3)' },
      { label: 'Hover State', detail: 'Card: shadow-xl -translate-y-1 transition-all 300ms. Save button (Heart): opacity-0 → opacity-100 at top-left of image' },
      { label: 'Carousel Nav', detail: 'Left/right arrow buttons, absolute vertical center, w-10 h-10 rounded-full bg-background/80 shadow-md, hidden on mobile (use swipe)' },
    ],
    styleNotes: [
      'Scroll: overflow-x-auto snap-x snap-mandatory, each card snap-start',
      'Gap: gap-4 between cards, first card ml-4 for edge padding',
      'Dot indicators below carousel on mobile, 6px dots, active: bg-primary',
      'Show minimum 3 cards visible on desktop viewport',
    ],
  },
  {
    key: 'ai-highlight', order: 4, label: 'AI Intelligence Highlight', icon: Cpu, color: 'text-purple-500',
    purpose: 'Communicate unique AI value proposition — deal signals, valuation, market trends, investment ranking.',
    layout: 'Two-column asymmetric section — left: feature text stack, right: floating dashboard visual.',
    specs: [
      { label: 'Section Header', detail: '"AI-Powered Property Intelligence" — font-display 28px, with Sparkles icon, text-foreground' },
      { label: 'Subtitle', detail: '"Make smarter investment decisions with real-time AI analysis" — text-muted-foreground text-sm, max-w-lg' },
      { label: 'Feature 1', detail: 'Icon: TrendingUp — "Deal Score Analysis" — "Every listing scored 0-100 based on price, location, and market data" — text-xs text-muted-foreground' },
      { label: 'Feature 2', detail: 'Icon: BarChart3 — "Investment Yield Forecast" — "Projected rental yields and capital appreciation estimates" — text-xs' },
      { label: 'Feature 3', detail: 'Icon: MapPin — "Market Trend Signals" — "Real-time demand heatmaps and price movement indicators" — text-xs' },
      { label: 'Feature 4', detail: 'Icon: Shield — "AI-Verified Pricing" — "Automated valuation to detect overpriced or undervalued listings" — text-xs' },
      { label: 'Visual Panel', detail: 'Right column: floating glassmorphic cards at staggered angles, showing mock deal scores, mini charts, trend arrows — animate on scroll with framer-motion staggerChildren' },
      { label: 'CTA', detail: '"Explore AI Insights →" button, variant="outline", border-primary, text-primary, mt-4' },
    ],
    styleNotes: [
      'Background: subtle bg-muted/10 or gradient section separator',
      'Feature items: each with 40px icon circle (bg-primary/10, text-primary), title font-semibold, desc text-muted-foreground',
      'Floating visual: 3-4 small cards with backdrop-blur-sm, rotated 2-5deg, shadow-xl, animated float',
      'Mobile: stack vertically, visual below features, reduce animation complexity',
    ],
  },
  {
    key: 'trust', order: 5, label: 'Trust & Credibility Band', icon: Shield, color: 'text-emerald-500',
    purpose: 'Build instant confidence with quantified social proof and platform authority metrics.',
    layout: 'Full-width horizontal strip with 4-6 animated stat counters.',
    specs: [
      { label: 'Layout', detail: 'flex justify-evenly items-center, py-12, max-w-5xl mx-auto' },
      { label: 'Stat 1', detail: 'Building icon — "3,000+" — "Active Listings" — countUp animation on scroll' },
      { label: 'Stat 2', detail: 'Users icon — "500+" — "Verified Agents" — countUp animation' },
      { label: 'Stat 3', detail: 'Globe icon — "15+" — "Cities Covered" — countUp animation' },
      { label: 'Stat 4', detail: 'Eye icon — "50,000+" — "Monthly Visitors" — countUp animation' },
      { label: 'Stat 5', detail: 'TrendingUp icon — "95%" — "AI Accuracy Rate" — countUp animation' },
      { label: 'Styling', detail: 'Number: text-3xl font-bold text-foreground. Label: text-xs text-muted-foreground mt-1. Icon: h-6 w-6 text-primary mb-2' },
    ],
    styleNotes: [
      'Optional: subtle border-y border-border/20 or bg-muted/5 background differentiation',
      'CountUp: use IntersectionObserver to trigger, duration 2s, easing ease-out',
      'Mobile: 2x2 grid or 3-column with smaller numbers (text-2xl)',
      'Icons centered above numbers in flex-col items-center stacks',
    ],
  },
  {
    key: 'hotspots', order: 6, label: 'Investment Discovery Grid', icon: MapPin, color: 'text-orange-500',
    purpose: 'Guide investors to high-opportunity locations and curated deal collections.',
    layout: 'Responsive grid of location cards with property count overlays and trend indicators.',
    specs: [
      { label: 'Section Header', detail: '"Explore Investment Hotspots" — font-display 28px + "Top locations ranked by AI demand signals" subtitle' },
      { label: 'Grid Layout', detail: 'Bento-style: first card 2x2 (col-span-2 row-span-2), rest 1x1 — 6 total cards, gap-3' },
      { label: 'Card Visual', detail: 'City/district photo background, aspect-ratio 4/3, rounded-xl overflow-hidden, relative' },
      { label: 'Card Overlay', detail: 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' },
      { label: 'Card Text', detail: 'absolute bottom-4 left-4 — City name: text-lg font-bold text-white, Property count: "234 listings" text-xs text-white/80' },
      { label: 'Trend Badge', detail: 'absolute top-3 right-3 — "🔥 Trending" or "↑ 12% demand" — rounded-full bg-green-500/90 text-white text-[10px] px-2 py-0.5' },
      { label: 'Hover', detail: 'scale-[1.03] transition-transform, overlay lightens slightly, "Explore →" text appears' },
    ],
    styleNotes: [
      'Featured (large) card: Jakarta or primary city with highest listing count',
      'Images: cityscape or iconic district landmarks, warm color grading',
      'Mobile: single column stack, each card aspect-ratio 16/9',
      'On click: navigate to /properties?city=<city_slug>',
    ],
  },
  {
    key: 'cta', order: 7, label: 'Conversion CTA Strip', icon: Megaphone, color: 'text-pink-500',
    purpose: 'Drive three key conversions: browse listings, access investor tools, or list a property.',
    layout: 'Full-width strip with 3 action cards side by side.',
    specs: [
      { label: 'Layout', detail: 'grid grid-cols-3 gap-4, py-16, max-w-5xl mx-auto — mobile: grid-cols-1' },
      { label: 'Card 1 — Browse', detail: 'Search icon — "Find Your Next Property" — "Browse thousands of AI-scored listings" — CTA: "Explore Listings →" bg-primary' },
      { label: 'Card 2 — Invest', detail: 'TrendingUp icon — "Investor Intelligence" — "Access AI deal signals and market forecasts" — CTA: "View Insights →" variant="outline"' },
      { label: 'Card 3 — List', detail: 'Building icon — "List Your Property" — "Reach thousands of qualified buyers and investors" — CTA: "Get Started →" variant="outline"' },
      { label: 'Card Style', detail: 'rounded-xl p-6, bg-card border border-border/30, shadow-sm, hover:shadow-lg hover:-translate-y-1 transition-all' },
      { label: 'Icon Style', detail: 'w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4, icon: h-6 w-6 text-primary' },
      { label: 'Text', detail: 'Title: text-lg font-semibold text-foreground mb-2. Desc: text-sm text-muted-foreground mb-4. CTA: h-10 w-full rounded-lg font-medium' },
    ],
    styleNotes: [
      'Optional: subtle background pattern or gradient behind the strip',
      'Primary card (Browse) can have slightly emphasized border: border-primary/30',
      'Mobile: full-width stacked, gap-3, each card py-5 px-4',
      'Arrow icon animated on hover: translateX(4px) transition',
    ],
  },
];

const priColor = (order: number) =>
  order <= 2 ? 'border-destructive/50 text-destructive bg-destructive/10' :
  order <= 4 ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
  order <= 6 ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' :
  'border-muted-foreground/30 text-muted-foreground bg-muted/30';

const HomepageBlueprint = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const section = homepage.find(s => s.key === activeSection)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Homepage Layout Blueprint</h1>
        <p className="text-sm text-muted-foreground mt-1">
          7 sections · Premium marketplace homepage — search-dominant, trust-driven, conversion-optimized
        </p>
      </div>

      {/* Visual Section Map */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Page Section Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            {homepage.map((s) => {
              const isActive = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all border ${
                    isActive ? 'border-primary bg-primary/10' : 'border-border/30 bg-card/30 hover:bg-muted/30'
                  }`}
                >
                  <Badge variant="outline" className={`text-[9px] w-6 h-6 flex items-center justify-center rounded-full p-0 ${priColor(s.order)}`}>
                    {s.order}
                  </Badge>
                  <s.icon className={`h-4 w-4 ${s.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground">{s.label}</p>
                    <p className="text-[9px] text-muted-foreground line-clamp-1">{s.purpose}</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] flex-shrink-0">{s.specs.length} specs</Badge>
                  {isActive && <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Section Detail */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
              <section.icon className={`h-5 w-5 ${section.color}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{section.label}</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">{section.purpose}</p>
            </div>
            <Badge variant="outline" className={`text-[9px] ${priColor(section.order)}`}>Section {section.order}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layout Description */}
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-[10px] font-medium text-foreground mb-1 flex items-center gap-1">
              <Layout className="h-3 w-3" /> Layout Structure
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{section.layout}</p>
          </div>

          {/* Specs */}
          <div>
            <p className="text-[11px] font-medium text-foreground mb-2 flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Implementation Specifications
            </p>
            <div className="space-y-2">
              {section.specs.map((spec, i) => (
                <div key={i} className="border border-border/30 rounded-lg p-2.5 bg-card/30">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 mt-0.5 flex-shrink-0">{spec.label}</Badge>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">{spec.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Style Notes */}
          <div className="bg-muted/10 rounded-lg p-3">
            <p className="text-[10px] font-medium text-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Style & Behavior Notes
            </p>
            <div className="space-y-1">
              {section.styleNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Style System */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Visual Style System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                title: 'Surface Treatment',
                items: ['bg-card/60 backdrop-blur-sm', 'border border-border/30', 'rounded-xl consistent radius', 'shadow-sm default → shadow-xl hover', 'Glass overlays: bg-background/80 backdrop-blur-xl']
              },
              {
                title: 'Typography Scale',
                items: ['Hero: serif 48px bold tracking-tight', 'Section: serif 28px semibold', 'Card title: sans 14px semibold', 'Body: sans 14px normal', 'Caption: sans 10-12px muted']
              },
              {
                title: 'Spacing Rhythm',
                items: ['Section padding: py-16 desktop / py-10 mobile', 'Card padding: p-4 standard', 'Component gap: gap-4 standard', 'Container: max-w-7xl mx-auto px-4', 'Vertical sections: gap-0 (full-bleed)']
              },
              {
                title: 'Color Hierarchy',
                items: ['Primary (gold): CTAs, badges, active states', 'Foreground: headings, prices, key data', 'Muted-foreground: descriptions, labels', 'Primary/10: icon backgrounds, highlights', 'Destructive: urgency signals only']
              },
            ].map((group) => (
              <div key={group.title} className="border border-border/40 rounded-lg p-3 bg-card/40">
                <p className="text-[11px] font-semibold text-foreground mb-2">{group.title}</p>
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-1 mb-0.5">
                    <span className="text-[8px] text-muted-foreground mt-0.5">•</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Breakpoint Guide */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            Responsive Behavior Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { device: 'Desktop (≥1024px)', rules: [
                'Hero: 100vh, search bar max-w-3xl centered',
                'Featured: 3-4 visible cards, arrow navigation',
                'AI section: 2-column asymmetric layout',
                'Trust band: 5 stats in single row',
                'Hotspots: bento grid 2x3',
                'CTA strip: 3-column grid',
              ]},
              { device: 'Tablet (768-1023px)', rules: [
                'Hero: 85vh, search bar max-w-2xl',
                'Featured: 2 visible cards, swipe enabled',
                'AI section: stack vertically',
                'Trust band: 3-column grid',
                'Hotspots: 2x2 grid, equal sizing',
                'CTA strip: 2-column + 1 below',
              ]},
              { device: 'Mobile (<768px)', rules: [
                'Hero: 80vh, search stacked vertically',
                'Featured: 1 card visible, full-width swipe',
                'AI section: vertical stack, visual below',
                'Trust band: 2x2 grid',
                'Hotspots: single column, 16/9 ratio',
                'CTA strip: single column stack',
              ]},
            ].map((bp) => (
              <div key={bp.device} className="border border-border/40 rounded-lg p-3 bg-card/40">
                <p className="text-[11px] font-semibold text-foreground mb-2">{bp.device}</p>
                {bp.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-1 mb-1">
                    <CheckCircle className="h-2.5 w-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] text-muted-foreground">{rule}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Metrics Targets */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-primary" />
            Conversion Performance Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { metric: 'Search Initiation', target: '> 40%', desc: 'of visitors interact with search' },
              { metric: 'Listing Click Rate', target: '> 15%', desc: 'from featured carousel' },
              { metric: 'Inquiry Conversion', target: '> 3%', desc: 'of listing page visitors' },
              { metric: 'Bounce Rate', target: '< 35%', desc: 'homepage bounce rate' },
              { metric: 'Scroll Depth', target: '> 70%', desc: 'reach trust band section' },
              { metric: 'Mobile CTA Tap', target: '> 8%', desc: 'floating inquiry button' },
            ].map((kpi) => (
              <div key={kpi.metric} className="text-center border border-border/30 rounded-lg p-3 bg-card/30">
                <p className="text-lg font-bold text-foreground">{kpi.target}</p>
                <p className="text-[10px] font-medium text-foreground mt-1">{kpi.metric}</p>
                <p className="text-[9px] text-muted-foreground">{kpi.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageBlueprint;
