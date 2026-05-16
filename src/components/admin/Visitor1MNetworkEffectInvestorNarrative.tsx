import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, Users, BarChart3, Share2, Eye, Repeat, DollarSign, Megaphone, ArrowUpRight, Network, Handshake } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: 1M Traffic ── */
const trafficPhases = [
  { phase: 'Phase 1 — National SEO Moat (100K→300K)', duration: '0–6 months', focus: 'Content authority + programmatic SEO', tactics: [
    { tactic: 'Programmatic City×District×Type Pages', detail: 'Auto-generate 2,000+ landing pages: "Investasi apartemen di [District], [City]" — capture every long-tail property search permutation at national scale' },
    { tactic: 'Topical Authority Clusters', detail: 'Build 20+ pillar pages with 10-15 supporting articles each: investment guides, market reports, property type analyses — establish domain as #1 property intelligence source' },
    { tactic: 'National PR & Media Syndication', detail: 'Monthly press releases with proprietary market data insights — build brand search volume and high-DA backlinks from 50+ media outlets' },
    { tactic: 'YouTube Investment Channel Scale', detail: 'Publish 3 videos/week: market analysis, virtual tours, investor education — YouTube as secondary search engine driving 50K+ monthly referral visits' },
    { tactic: 'Google Discover & News Optimization', detail: 'Publish timely market commentary and trend pieces optimized for Google Discover — capture passive discovery traffic at scale' },
  ], kpis: ['300K visitors/month', '>55% organic', '2,000+ indexed pages'] },
  { phase: 'Phase 2 — Viral & Social Scale (300K→650K)', duration: '6–12 months', focus: 'Social virality + community loops', tactics: [
    { tactic: 'National Influencer Network', detail: 'Partner with 50+ property/finance influencers across all major cities — coordinated monthly campaigns reaching 5M+ combined audience' },
    { tactic: '"Market Pulse" Weekly Viral Series', detail: 'Shareable infographics + short-form videos: "This week in [City] property" — designed for WhatsApp/Instagram virality with platform branding' },
    { tactic: 'Investor Community Platform', detail: 'Build 50+ city-specific WhatsApp/Telegram groups (1,000+ members each) — push alerts, market insights, new listings driving 100K+ monthly return visits' },
    { tactic: 'Referral Traffic Engine', detail: 'User-shared listing collections with tracking — reward top sharers with premium access; target 15% of traffic from referral loops' },
    { tactic: 'Cross-Platform Content Repurposing', detail: 'Every article → carousel → short video → podcast clip → newsletter — maximize reach from single content investment across 6+ channels' },
  ], kpis: ['650K visitors/month', '>20% social/referral', '>25% returning visitors'] },
  { phase: 'Phase 3 — Brand Gravity & Retention (650K→1M)', duration: '12–18 months', focus: 'Brand search + retention mechanics', tactics: [
    { tactic: 'Brand Search Volume Dominance', detail: 'Target 50K+ monthly branded searches through consistent PR, events, and thought leadership — reduce dependency on generic keyword competition' },
    { tactic: 'Personalized Re-Engagement Engine', detail: 'AI-driven email/push: price drops on saved listings, new matches for search criteria, market alerts for watched districts — drive 30%+ return rate' },
    { tactic: 'National Property Events & Webinars', detail: 'Monthly investment webinars (1,000+ attendees each) + quarterly offline events in 5 major cities — establish as industry authority hub' },
    { tactic: 'Strategic Content Partnerships', detail: 'Co-branded content with banks, developers, and financial platforms — tap into partner audiences of 1M+ combined reach' },
    { tactic: 'Progressive Web App & Notification Layer', detail: 'Push notification opt-in targeting 200K+ subscribers — daily alerts for new listings, price changes, market signals driving habitual return visits' },
  ], kpis: ['1M visitors/month', '>30% returning', '>60% organic+brand'] },
];

const trafficKPIs = [
  { kpi: 'Monthly Unique Visitors', target: '1,000,000', tracking: 'Weekly trend with source attribution' },
  { kpi: 'Organic Traffic Share', target: '>55%', tracking: 'SEO + brand search combined' },
  { kpi: 'Returning Visitor Ratio', target: '>30%', tracking: 'Users returning within 30 days' },
  { kpi: 'Inquiry Conversion Rate', target: '>4%', tracking: 'Visitors submitting qualified inquiries' },
  { kpi: 'Pages Per Session', target: '>4.0', tracking: 'Average browsing depth indicating engagement' },
  { kpi: 'Brand Search Volume', target: '50K+/month', tracking: 'Direct brand name searches on Google' },
  { kpi: 'Cost Per Visitor (blended)', target: '<$0.15', tracking: 'Total marketing spend / total visitors' },
];

/* ── Section 2: Network Effects ── */
const networkLoops = [
  { loop: 'Buyer → Vendor Flywheel', icon: Users, description: 'More buyers attract more vendors, which attracts more buyers', stages: [
    { stage: 'Inquiry Velocity Signal', detail: 'Display real-time inquiry counts on listings — vendors see "47 inquiries this week" reinforcing platform value vs competitors' },
    { stage: 'Response Speed Gamification', detail: 'Rank agents by response time; fast responders get "⚡ Quick Response" badge + algorithmic boost — faster responses increase buyer satisfaction + return rate' },
    { stage: 'Transaction Momentum Stories', detail: 'Automated "Just Sold" + "Under Offer" notifications to nearby searchers — create FOMO-driven urgency accelerating deal velocity' },
    { stage: 'Buyer Demand Dashboard for Vendors', detail: 'Show vendors: "234 active buyers searching in your district this week" — prove demand exists, reducing vendor acquisition friction to near-zero' },
    { stage: 'Smart Matching Notifications', detail: 'When new listing matches 50+ saved searches, notify all matched buyers instantly — create competitive inquiry rush that vendors can see' },
  ]},
  { loop: 'Vendor Attraction & Lock-In', icon: Handshake, description: 'Vendor success on platform creates dependency and referral growth', stages: [
    { stage: 'Performance Proof Reports', detail: 'Monthly "Your Platform ROI" report: inquiries received, viewings booked, deals closed vs industry average — prove switching cost' },
    { stage: 'Portfolio Analytics Suite', detail: 'Free analytics for all active vendors: listing performance, competitor pricing, demand trends — tools they can\'t get elsewhere' },
    { stage: 'Agent Referral Network', detail: 'Agents refer other agents → both get visibility credits — target 30% of new vendor acquisition through referral loop' },
    { stage: 'Agency Network Effect', detail: 'When agency lists 50+ properties, unlock bulk management tools + dedicated support — entire agencies become dependent on platform workflow' },
    { stage: 'Success Story Amplification', detail: 'Feature top-performing agents in marketing, social media, and PR — create aspiration loop attracting new agents who want same visibility' },
  ]},
  { loop: 'Investor Participation Growth', icon: TrendingUp, description: 'Investor activity creates data that attracts more investors', stages: [
    { stage: 'Yield & Opportunity Dashboards', detail: 'Real-time investment analytics: district yields, price trends, capital flow signals — make platform the primary research tool before any purchase decision' },
    { stage: 'Portfolio Intelligence Layer', detail: 'Investors track portfolio performance, get rebalancing suggestions, see comparable transactions — deep engagement creating switching cost' },
    { stage: 'Early Access Deal Feed', detail: 'Active investors get 24h early access to new high-yield listings — reward engagement with exclusive opportunity creating habitual platform visits' },
    { stage: 'Investor Community Network', detail: 'Connect investors in same markets for co-investment, knowledge sharing — social bonds strengthen platform retention' },
    { stage: 'Institutional Data Products', detail: 'Aggregate anonymized investor behavior into market intelligence products — more investors = better data = more institutional clients = more credibility = more investors' },
  ]},
];

const networkKPIs = [
  { kpi: 'Active Vendor Growth Rate', target: '>15% quarterly', description: 'Net new vendors listing actively' },
  { kpi: 'Avg Inquiries Per Listing', target: '>8/month', description: 'Demand signal strength per listing' },
  { kpi: 'Vendor Response Time', target: '<2 hours avg', description: 'Speed of first response to inquiries' },
  { kpi: 'Repeat Transaction Rate', target: '>25%', description: 'Users transacting more than once' },
  { kpi: 'Referral Acquisition Share', target: '>20%', description: 'New users from referral loops' },
  { kpi: 'Cross-Side Engagement', target: '>3 interactions/week', description: 'Avg buyer-vendor touchpoints per active user' },
];

/* ── Section 3: Investor Narrative ── */
const narrativePanels = [
  { panel: 'Growth Momentum Panel', icon: ArrowUpRight, metrics: [
    { metric: 'Traffic Scale Trajectory', spec: 'Monthly visitor count with 6-month trendline — show consistent upward curve demonstrating demand capture acceleration' },
    { metric: 'Listings Inventory Growth', spec: 'Total active listings with net weekly additions — demonstrate supply flywheel acceleration and market coverage expansion' },
    { metric: 'Deal Closure Velocity', spec: 'Monthly closed transactions with average deal cycle duration — show increasing velocity proving platform reduces transaction friction' },
    { metric: 'Geographic Expansion Progress', spec: 'Number of active cities with liquidity density per city — demonstrate repeatable expansion playbook execution' },
    { metric: 'User Cohort Retention Curves', spec: 'Monthly cohort retention at 30/60/90 days — prove users find lasting value, not just one-time visits' },
  ]},
  { panel: 'Monetization & Efficiency Panel', icon: DollarSign, metrics: [
    { metric: 'Revenue Growth Curve', spec: 'MRR progression with month-over-month growth rate — target consistent >15% MoM demonstrating scalable monetization' },
    { metric: 'CAC vs LTV Ratio', spec: 'Customer acquisition cost vs 12-month lifetime value — target >3:1 ratio proving sustainable unit economics' },
    { metric: 'Premium Conversion Stability', spec: 'Percentage of vendors upgrading to paid tiers with cohort analysis — show conversion rate improving or stable as scale increases' },
    { metric: 'Revenue Per Active User', spec: 'Blended ARPU across buyer, vendor, and investor segments — demonstrate monetization depth increasing with engagement' },
    { metric: 'Gross Margin Trajectory', spec: 'Revenue minus direct costs trending toward >70% — prove operating leverage as platform scales' },
  ]},
  { panel: 'Market Leadership Panel', icon: Globe, metrics: [
    { metric: 'Liquidity Share in Target Regions', spec: 'Platform listings as % of total market listings in active cities — demonstrate growing market dominance trajectory' },
    { metric: 'Brand Search Volume Trend', spec: 'Google Trends data showing branded search growth — prove brand awareness converting to organic demand' },
    { metric: 'Institutional Partnership Count', spec: 'Number of active partnerships with developers, banks, funds — demonstrate ecosystem credibility and revenue diversification' },
    { metric: 'Net Promoter Score', spec: 'User satisfaction measurement with quarterly trend — prove product-market fit strengthening at scale' },
    { metric: 'Competitive Win Rate', spec: 'Percentage of vendor/buyer acquisition from competitor platforms — demonstrate competitive moat effectiveness' },
  ]},
];

const investorKPIs = [
  { kpi: 'Valuation Confidence Score', target: 'Improving quarterly', description: 'Composite of revenue growth, retention, and market share signals' },
  { kpi: 'Fundraising Conversion Rate', target: '>25% meeting-to-termsheet', description: 'Investor meetings converting to investment interest' },
  { kpi: 'Growth Sustainability Index', target: '>80/100', description: 'Weighted score of organic growth share, retention, and unit economics' },
  { kpi: 'Market Timing Signal', target: 'Strong', description: 'External market conditions favoring PropTech investment' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Traffic Scale Health', items: ['Monthly visitors vs 1M trajectory on track', 'Organic share maintaining >55%', 'Brand search volume growing >10% monthly', 'Content publication cadence maintained (10+ pieces/week)', 'Paid channel ROI reviewed and optimized quarterly'] },
  { category: 'Network Effect Strength', items: ['Vendor growth rate >15% quarterly maintained', 'Inquiry-per-listing ratio stable or increasing', 'Agent response time <2 hours tracked', 'Referral acquisition share >20% sustained', 'Cross-city demand routing active and measured'] },
  { category: 'Investor Narrative Readiness', items: ['Revenue growth curve data updated monthly', 'CAC/LTV ratio calculated with cohort methodology', 'Market share data refreshed quarterly', 'Competitive win rate tracked systematically', 'Board-ready dashboard generated on-demand'] },
  { category: 'Platform Balance', items: ['No single city >40% of total traffic', 'Vendor churn rate <5% monthly', 'Content quality score maintained despite volume', 'Premium-to-free visibility gap not widening', 'Data infrastructure handling traffic load without latency'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Traffic plateau at 500-700K: organic growth hitting keyword ceiling while paid channels show diminishing returns', mitigation: 'Diversify into video, podcast, and community channels; invest in brand search growth through PR and events; expand programmatic pages to cover adjacent property categories' },
  { risk: 'Network effect stall: inquiry-per-listing declining as supply grows faster than demand', mitigation: 'Temporarily slow vendor acquisition; increase buyer-focused marketing spend; improve matching algorithm precision; activate demand in underserved districts' },
  { risk: 'Investor narrative fatigue: growth story becoming less compelling as base effects reduce percentage growth rates', mitigation: 'Shift narrative emphasis from growth rate to market dominance metrics; highlight unit economics improvement; introduce new revenue streams showing expansion optionality' },
  { risk: 'Geographic concentration risk: >50% of traffic and revenue from single metropolitan area', mitigation: 'Allocate marketing budget proportionally to expansion cities; localize content and influencer partnerships; set city-level growth targets with dedicated resources' },
  { risk: 'Content quality dilution: programmatic SEO pages providing thin value leading to Google quality penalties', mitigation: 'Ensure every programmatic page has unique data-driven insights; implement content quality scoring; regularly audit and improve underperforming pages' },
];

export default function Visitor1MNetworkEffectInvestorNarrative() {
  const [activeTab, setActiveTab] = useState('traffic');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">1M Visitor Scale + Network Effect Acceleration + Investor KPI Narrative</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Mass-scale traffic engine, ecosystem flywheel & investor growth storytelling</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🚀 1M Visitors</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="traffic">🚀 1M Traffic</TabsTrigger>
          <TabsTrigger value="network">🔗 Network Effects</TabsTrigger>
          <TabsTrigger value="narrative">📊 Investor KPIs</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4 mt-4">
          {trafficPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{p.phase}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{p.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Focus: {p.focus}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">{p.tactics.map((t, j) => (
                    <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                      <span className="text-sm font-medium">{t.tactic}</span>
                      <p className="text-xs text-muted-foreground">{t.detail}</p>
                    </div>
                  ))}</div>
                  <div className="flex flex-wrap gap-2 pt-1">{p.kpis.map((k, j) => <Badge key={j} variant="outline" className="text-xs">{k}</Badge>)}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Traffic KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Tracking</th></tr></thead><tbody>{trafficKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.tracking}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4 mt-4">
          {networkLoops.map((l, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><l.icon className="h-4 w-4 text-primary" /> {l.loop}</CardTitle>
                  <p className="text-xs text-muted-foreground">{l.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{l.stages.map((s, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{s.stage}</span>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Network Effect KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{networkKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="narrative" className="space-y-4 mt-4">
          {narrativePanels.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.panel}</CardTitle></CardHeader>
                <CardContent className="grid gap-2">{p.metrics.map((m, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{m.metric}</span>
                    <p className="text-xs text-muted-foreground">{m.spec}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Investor Narrative KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{investorKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4 mt-4">
          {checklist.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{c.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4 mt-4">
          {risks.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
                  <div className="text-xs"><strong>Mitigation:</strong> {r.mitigation}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
