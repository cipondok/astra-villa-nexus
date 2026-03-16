
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle, CheckCircle, XCircle, ArrowRight, Eye, Type,
  Smartphone, Layers, Palette, MousePointerClick, Image, Shield,
  Sparkles, Target, TrendingUp, Zap, Grid3x3, Layout
} from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'issue' | 'warning' | 'good';

interface Finding {
  id: string;
  title: string;
  status: Status;
  severity: Severity;
  location: string;
  observation: string;
  codeEvidence?: string;
  fix: string;
  effort: 'Quick' | 'Medium' | 'Large';
}

interface AuditCategory {
  key: string;
  label: string;
  icon: typeof Layout;
  color: string;
  findings: Finding[];
}

const sevCls: Record<Severity, string> = {
  critical: 'border-destructive/50 text-destructive bg-destructive/10',
  high: 'border-amber-500/50 text-amber-500 bg-amber-500/10',
  medium: 'border-blue-500/50 text-blue-500 bg-blue-500/10',
  low: 'border-muted-foreground/30 text-muted-foreground bg-muted/30',
};

const statusIcon = (s: Status) =>
  s === 'issue' ? <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" /> :
  s === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" /> :
  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />;

const categories: AuditCategory[] = [
  {
    key: 'spacing', label: 'Spacing & Rhythm', icon: Layers, color: 'text-blue-500',
    findings: [
      {
        id: 's1', title: 'Mobile heading overrides break type scale', status: 'issue', severity: 'high',
        location: 'index.css lines 181-198',
        observation: 'Global !important rules force h1 to 1.25rem and h2 to 1.125rem on mobile. This flattens the hierarchy — h1 and h2 become nearly indistinguishable (20px vs 18px). The !important declarations also prevent component-level overrides.',
        codeEvidence: 'h1 { font-size: 1.25rem !important; } h2 { font-size: 1.125rem !important; }',
        fix: 'Remove global !important heading overrides. Use Tailwind responsive classes (text-xl md:text-2xl lg:text-3xl) at the component level instead. This preserves hierarchy while remaining mobile-friendly.',
        effort: 'Medium',
      },
      {
        id: 's2', title: 'PropertyCard padding inconsistency', status: 'warning', severity: 'medium',
        location: 'PropertyCard.tsx line 181',
        observation: 'Card content uses p-2 md:p-3 — only 8px on mobile. Combined with text-[9px] labels and h-6 buttons, the card feels cramped. Meanwhile the image section has no explicit padding, creating uneven density.',
        codeEvidence: '<CardContent className="p-2 md:p-3 bg-card/50">',
        fix: 'Standardize to p-3 (12px) all viewports. Increase button height from h-6 to h-8, text from text-[9px] to text-[10px]. This adds ~16px total card height but greatly improves tap targets and readability.',
        effort: 'Quick',
      },
      {
        id: 's3', title: 'Section spacing lacks vertical rhythm', status: 'warning', severity: 'medium',
        location: 'Homepage sections (home/ components)',
        observation: 'Homepage sections use inconsistent spacing: DealHunterHero uses space-y-3, FeaturedPropertiesCarousel uses its own padding. No shared section wrapper enforces consistent py-12/py-16 rhythm between sections.',
        fix: 'Create a <HomeSection className="py-10 md:py-16"> wrapper component. Apply to all homepage sections for consistent vertical rhythm.',
        effort: 'Quick',
      },
    ],
  },
  {
    key: 'typography', label: 'Typography Hierarchy', icon: Type, color: 'text-purple-500',
    findings: [
      {
        id: 't1', title: 'Playfair Display loaded but never used systematically', status: 'issue', severity: 'high',
        location: 'index.css line 5, tailwind.config.ts line 130',
        observation: 'Playfair Display and Montserrat are imported via Google Fonts and registered in tailwind.config (font-playfair, font-montserrat), but no component systematically uses them for headings. This is 120KB+ of unused font weight loading.',
        codeEvidence: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');",
        fix: 'Apply font-playfair to hero headlines and section titles via a reusable heading component: <SectionHeading className="font-playfair">. Remove unused weights (keep 500, 700 only) to reduce load by ~80KB.',
        effort: 'Medium',
      },
      {
        id: 't2', title: 'Excessive text-[9px] usage across cards', status: 'warning', severity: 'high',
        location: 'PropertyCard.tsx lines 200-270, CompactPropertyCard.tsx',
        observation: '9px text appears 8+ times in PropertyCard — spec labels, button text, badge text, timestamp. This is below WCAG minimum (12px effective) and creates visual noise where everything looks the same size.',
        codeEvidence: 'text-[9px] used for: type badges, price labels, spec chips, CTA buttons, timestamps',
        fix: 'Establish a minimum of text-[10px] for badges and captions, text-xs (12px) for interactive elements, text-sm (14px) for titles. This creates 3 clear tiers instead of a single cramped size.',
        effort: 'Quick',
      },
      {
        id: 't3', title: 'Price gradient clip weakens readability', status: 'warning', severity: 'medium',
        location: 'PropertyCard.tsx line 240',
        observation: 'Price uses bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent. While visually interesting, gradient text reduces contrast and fails WCAG AA on light backgrounds where secondary is very light.',
        codeEvidence: 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent',
        fix: 'Use solid text-foreground font-bold for price — it is the most important data point. Reserve gradient text for decorative headings only, never for critical financial information.',
        effort: 'Quick',
      },
    ],
  },
  {
    key: 'cards', label: 'Property Card Design', icon: Grid3x3, color: 'text-green-500',
    findings: [
      {
        id: 'c1', title: 'Image height too short on desktop', status: 'issue', severity: 'high',
        location: 'PropertyCard.tsx line 136',
        observation: 'Image uses h-28 md:h-32 (112px/128px). For property cards, this is shorter than industry standard (180-200px). The image barely shows the property and makes the card feel information-heavy rather than visual-first.',
        codeEvidence: 'imageClassName={`h-28 md:h-32 group-hover:scale-105`}',
        fix: 'Increase to h-40 md:h-48 (160px/192px) or use aspect-ratio 16/10. This gives properties visual dominance and makes the carousel/grid feel more premium.',
        effort: 'Quick',
      },
      {
        id: 'c2', title: 'No AI deal score badge on listing cards', status: 'issue', severity: 'critical',
        location: 'PropertyCard.tsx, CompactPropertyCard.tsx',
        observation: 'Despite having AI valuation infrastructure, neither PropertyCard nor CompactPropertyCard displays a deal score badge. The DealHunterHero is the only place deal intelligence is visible. This wastes the platform\'s key differentiator.',
        fix: 'Add a DealScoreBadge component: absolute top-3 right-3, w-10 h-10 rounded-full, showing 0-100 score. Color-code: ≥80 green, 60-79 amber, <60 muted. Show on all cards where score data exists.',
        effort: 'Medium',
      },
      {
        id: 'c3', title: 'Like button collision zone on mobile', status: 'warning', severity: 'medium',
        location: 'PropertyCard.tsx lines 166-178',
        observation: 'Heart button is absolute bottom-1.5 right-1.5 with h-8 w-8 on mobile but h-7 w-7 on sm+. The larger mobile size is correct (44px target), but its position at bottom-right can overlap with image carousel dots.',
        codeEvidence: 'className="absolute bottom-1.5 right-1.5 h-8 w-8 sm:h-7 sm:w-7"',
        fix: 'Move to top-right position (absolute top-2 right-2) and always use h-9 w-9. This avoids carousel conflict and follows the standard save-button placement pattern.',
        effort: 'Quick',
      },
      {
        id: 'c4', title: 'Card hover scale creates layout shift', status: 'warning', severity: 'medium',
        location: 'PropertyCard.tsx line 131',
        observation: 'hover:scale-[1.02] on cards causes neighboring cards to shift in grid layout when hovered. This breaks visual stability, especially in 3-column grids.',
        codeEvidence: 'hover:scale-[1.02]',
        fix: 'Replace scale transform with shadow + translate: hover:shadow-xl hover:-translate-y-1. Or use scale only with will-change-transform and ensure grid gap accommodates expansion.',
        effort: 'Quick',
      },
    ],
  },
  {
    key: 'color', label: 'Color & Shadow System', icon: Palette, color: 'text-amber-500',
    findings: [
      {
        id: 'co1', title: 'Shadow uses rgba instead of HSL tokens', status: 'warning', severity: 'medium',
        location: 'tailwind.config.ts lines 468-470',
        observation: 'Box shadows use rgba(0,0,0,0.08) and rgba(255,215,0,0.20) — hardcoded values that don\'t adapt to theme changes. The dark mode shadow tokens in index.css correctly use HSL, creating an inconsistency.',
        codeEvidence: "'macos': '0 4px 20px rgba(0, 0, 0, 0.08)', 'macos-hover': '0 8px 30px rgba(255, 215, 0, 0.20)'",
        fix: 'Convert to HSL: macos: "0 4px 20px hsl(var(--foreground) / 0.08)", macos-hover: "0 8px 30px hsl(var(--gold-primary) / 0.20)". This ensures theme-awareness.',
        effort: 'Quick',
      },
      {
        id: 'co2', title: 'Glass effect opacity too high in light mode', status: 'warning', severity: 'low',
        location: 'index.css lines 362-396',
        observation: 'Light mode glass-effect uses 0.9 opacity and glass-card uses 0.95. At these levels, the glass effect is barely perceptible — it looks like a solid white card. The backdrop-blur is essentially wasted.',
        fix: 'Reduce light mode glass to 0.7-0.8 opacity for cards that sit on patterned/gradient backgrounds. Keep 0.95 for cards on solid backgrounds. Add a glass-card-prominent variant with lower opacity.',
        effort: 'Quick',
      },
      {
        id: 'co3', title: 'Card hover shadow uses primary/10 — too subtle', status: 'warning', severity: 'low',
        location: 'PropertyCard.tsx line 131',
        observation: 'hover:shadow-primary/10 produces barely visible color shift. The gold/blue glow on hover should be more intentional.',
        codeEvidence: 'hover:shadow-lg hover:shadow-primary/10',
        fix: 'Increase to hover:shadow-primary/20 and add border color change: hover:border-primary/30 → hover:border-primary/50. The combined effect creates more premium hover feedback.',
        effort: 'Quick',
      },
    ],
  },
  {
    key: 'responsive', label: 'Responsive & Mobile', icon: Smartphone, color: 'text-cyan-500',
    findings: [
      {
        id: 'r1', title: 'Global p tag !important override at 13px', status: 'issue', severity: 'high',
        location: 'index.css line 200',
        observation: 'p { font-size: 0.8125rem !important; } forces ALL paragraph text to 13px on mobile. This overrides component-level sizing and makes descriptive text too small on property detail pages and blog content.',
        codeEvidence: 'p { font-size: 0.8125rem !important; line-height: 1.6 !important; }',
        fix: 'Remove the global p override entirely. Let components control their own text sizing with Tailwind responsive classes. If a baseline is needed, set it on body (already at 16px) and let inheritance work.',
        effort: 'Quick',
      },
      {
        id: 'r2', title: 'No sticky inquiry CTA on mobile property pages', status: 'issue', severity: 'critical',
        location: 'Property detail page layout',
        observation: 'On mobile, the inquiry CTA scrolls away with content. Users must scroll back up to find the contact button — a major conversion killer. Industry standard is a sticky bottom bar.',
        fix: 'Add a fixed bottom-0 bar on mobile property detail pages: flex items-center justify-between, px-4 py-3, bg-background/95 backdrop-blur-xl, border-t, containing price summary and "Send Inquiry" button.',
        effort: 'Medium',
      },
      {
        id: 'r3', title: 'Card grid doesn\'t optimize for medium screens', status: 'warning', severity: 'medium',
        location: 'Property listing grids',
        observation: 'Common pattern is grid-cols-1 sm:grid-cols-2 lg:grid-cols-3. Missing md breakpoint means tablets show 2 columns at 768-1024px, which can make cards very wide and waste whitespace.',
        fix: 'Add md:grid-cols-3 breakpoint for tablets in landscape. Consider grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 for denser listing pages.',
        effort: 'Quick',
      },
    ],
  },
  {
    key: 'premium', label: 'Premium Perception', icon: Sparkles, color: 'text-pink-500',
    findings: [
      {
        id: 'p1', title: 'No entry animations on homepage sections', status: 'warning', severity: 'medium',
        location: 'Homepage sections',
        observation: 'DealHunterHero uses framer-motion for card entry, but other homepage sections (FeaturedPropertiesCarousel, SmartAIFeed, etc.) render statically. This creates an inconsistent premium feel.',
        fix: 'Apply ScrollReveal wrapper (already exists) to all homepage sections with staggered delays. Use consistent easing: cubic-bezier(0.22, 1, 0.36, 1) to match the existing hero-text-reveal animation.',
        effort: 'Quick',
      },
      {
        id: 'p2', title: 'Missing hover elevation on featured property cards', status: 'warning', severity: 'medium',
        location: 'FeaturedPropertiesCarousel.tsx',
        observation: 'Featured carousel cards lack distinct hover feedback compared to regular PropertyCard. Premium properties should have stronger interactive signals — shadow lift, border glow, subtle scale.',
        fix: 'Add: group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/40 transition-all duration-300. This creates premium hover that distinguishes featured from regular cards.',
        effort: 'Quick',
      },
      {
        id: 'p3', title: 'Font loading blocks render for 3 font families', status: 'issue', severity: 'high',
        location: 'index.css lines 3-6',
        observation: 'Three Google Font imports load at page start: Inter (9 weights), Playfair Display (6 weights), Montserrat (5 weights). Even with font-display:swap, this is ~300KB of fonts, most unused. LCP is impacted.',
        fix: 'Reduce to: Inter 400,500,600,700 + Playfair Display 500,700. Remove Montserrat (not used in any component). Use <link rel="preload"> for critical weights. Expected saving: ~180KB.',
        effort: 'Medium',
      },
    ],
  },
  {
    key: 'risks', label: 'Implementation Risks', icon: Shield, color: 'text-destructive',
    findings: [
      {
        id: 'ri1', title: 'Badge z-index stacking in card image overlay', status: 'issue', severity: 'high',
        location: 'PropertyCard.tsx lines 144-163',
        observation: 'Type badge (top-left, z-10), Featured badge (top-right, z-10), and Like button (bottom-right, z-10) all share z-10. When cards are in a carousel, these can overlap with adjacent card badges during scroll or hover scale transforms.',
        fix: 'Use z-20 for interactive elements (buttons), z-10 for informational badges. Add isolation: isolate to card container to create a stacking context boundary.',
        effort: 'Quick',
      },
      {
        id: 'ri2', title: 'transition-colors on all elements causes paint storms', status: 'warning', severity: 'high',
        location: 'index.css line 322',
        observation: '* { @apply border-border transition-colors duration-200; } applies color transition to EVERY element. During theme toggle, this triggers thousands of style recalculations. On large pages, this causes visible jank (200-500ms frame drops).',
        codeEvidence: '* { @apply border-border transition-colors duration-200; }',
        fix: 'Remove the global transition-colors. Apply transitions only to interactive elements (buttons, cards, links) via component classes. Theme toggle can use a fade overlay instead of per-element transitions.',
        effort: 'Medium',
      },
      {
        id: 'ri3', title: 'react-remove-scroll override can break modal scroll', status: 'warning', severity: 'medium',
        location: 'index.css lines 120-147',
        observation: 'The aggressive scroll-lock override (overflow:auto !important on [data-scroll-locked]) prevents layout shifts but also disables scroll containment in modals. Users can scroll the background page while a modal is open.',
        fix: 'Instead of overriding globally, apply overflow containment only to modal content containers. Use overscroll-behavior: contain on modal wrappers to prevent background scroll leak.',
        effort: 'Large',
      },
      {
        id: 'ri4', title: 'binance-red class used without being defined', status: 'issue', severity: 'low',
        location: 'PropertyCard.tsx line 170',
        observation: 'The like button uses text-binance-red for the liked state, but this color is not defined in tailwind.config.ts. It likely resolves to nothing or a default, making the liked state invisible.',
        codeEvidence: "isLiked ? 'text-binance-red' : 'text-primary-foreground'",
        fix: 'Replace with text-destructive which is already defined and semantically correct for a "liked" heart state.',
        effort: 'Quick',
      },
    ],
  },
];

const UIAuditReport = () => {
  const [activeTab, setActiveTab] = useState('spacing');
  const cat = categories.find(c => c.key === activeTab)!;

  const allFindings = categories.flatMap(c => c.findings);
  const criticalCount = allFindings.filter(f => f.severity === 'critical').length;
  const highCount = allFindings.filter(f => f.severity === 'high').length;
  const issueCount = allFindings.filter(f => f.status === 'issue').length;
  const quickFixes = allFindings.filter(f => f.effort === 'Quick').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">UI/UX Audit Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Codebase-grounded analysis — {allFindings.length} findings across {categories.length} areas
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Critical Issues', count: criticalCount, cls: 'text-destructive' },
          { label: 'High Severity', count: highCount, cls: 'text-amber-500' },
          { label: 'Total Issues', count: issueCount, cls: 'text-foreground' },
          { label: 'Quick Fixes', count: quickFixes, cls: 'text-green-500' },
        ].map(s => (
          <Card key={s.label} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${s.cls}`}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-7 gap-1.5">
        {categories.map(c => {
          const issues = c.findings.filter(f => f.status === 'issue').length;
          return (
            <button key={c.key} onClick={() => setActiveTab(c.key)}
              className={`rounded-lg p-2.5 text-left transition-all border ${
                activeTab === c.key ? 'border-primary bg-primary/10' : 'border-border/30 bg-card/30 hover:bg-muted/30'
              }`}>
              <c.icon className={`h-4 w-4 ${c.color} mb-1`} />
              <p className="text-[10px] font-semibold text-foreground line-clamp-1">{c.label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] text-muted-foreground">{c.findings.length}</span>
                {issues > 0 && <span className="text-[9px] text-destructive font-medium">({issues} issues)</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Category Findings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <cat.icon className={`h-5 w-5 ${cat.color}`} />
          <h2 className="text-base font-bold text-foreground">{cat.label}</h2>
          <Badge variant="outline" className="text-[9px]">{cat.findings.length} findings</Badge>
        </div>

        {cat.findings.map(f => (
          <Card key={f.id} className={`bg-card/60 backdrop-blur-sm border-border/50 ${
            f.status === 'issue' ? 'border-l-2 border-l-destructive' :
            f.status === 'warning' ? 'border-l-2 border-l-amber-500' : ''
          }`}>
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {statusIcon(f.status)}
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{f.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${sevCls[f.severity]}`}>{f.severity}</Badge>
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0">{f.effort}</Badge>
                </div>
              </div>

              {/* Observation */}
              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-[10px] font-medium text-foreground mb-1">Observation</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.observation}</p>
              </div>

              {/* Code Evidence */}
              {f.codeEvidence && (
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/30">
                  <p className="text-[9px] font-mono text-muted-foreground">{f.codeEvidence}</p>
                </div>
              )}

              {/* Fix */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                <p className="text-[10px] font-medium text-foreground mb-1 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 text-green-500" /> Recommended Fix
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.fix}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prioritized Action Plan */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Prioritized Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { phase: 'Week 1 — Quick Wins', effort: 'Quick', items: allFindings.filter(f => f.effort === 'Quick') },
              { phase: 'Week 2 — Medium Effort', effort: 'Medium', items: allFindings.filter(f => f.effort === 'Medium') },
              { phase: 'Week 3+ — Structural', effort: 'Large', items: allFindings.filter(f => f.effort === 'Large') },
            ].map(phase => (
              <div key={phase.phase} className="border border-border/40 rounded-lg p-3 bg-card/40">
                <p className="text-[11px] font-semibold text-foreground mb-2">{phase.phase}</p>
                <p className="text-[9px] text-muted-foreground mb-2">{phase.items.length} items</p>
                {phase.items.map(item => (
                  <div key={item.id} className="flex items-start gap-1.5 mb-1.5">
                    {statusIcon(item.status)}
                    <div>
                      <p className="text-[10px] text-foreground line-clamp-1">{item.title}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{item.location.split(' ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Expected Impact After Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { metric: 'Mobile Conversion', before: '~1.5%', after: '3-4%', reason: 'Sticky CTA, larger touch targets, readable text' },
              { metric: 'Page Load (LCP)', before: '~3.5s', after: '<2.5s', reason: 'Font reduction, remove global transitions' },
              { metric: 'Visual Hierarchy', before: 'Flat', after: 'Clear 3-tier', reason: 'Type scale fix, price prominence, deal badges' },
              { metric: 'Premium Perception', before: 'Functional', after: 'High-end', reason: 'Entry animations, hover elevation, font pairing' },
            ].map(m => (
              <div key={m.metric} className="border border-border/40 rounded-lg p-3 bg-card/40">
                <p className="text-[11px] font-semibold text-foreground mb-2">{m.metric}</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] text-muted-foreground">{m.before}</span>
                  <ArrowRight className="h-3 w-3 text-green-500" />
                  <span className="text-[11px] font-bold text-green-500">{m.after}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">{m.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIAuditReport;
