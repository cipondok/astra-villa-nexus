import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Heart, Eye, Share2, Bookmark, Download,
  Play, Film, Mic, MessageSquare, ChevronRight, Zap, BarChart3,
  Target, Clock, Users, ArrowUpRight, RefreshCw, FileText, Hash
} from 'lucide-react';

/* ── data ── */
const contentIdeas = [
  { id: 1, title: 'AI found this undervalued Bali villa — here\'s the data', category: 'Discovery', viralScore: 92, trend: 'Rising', audience: '18–35 investors', hook: 'This villa is listed 23% below AI fair value…', bestFormat: 'TikTok' },
  { id: 2, title: 'Top 3 Bandung growth zones investors are watching', category: 'Market Intel', viralScore: 85, trend: 'Stable', audience: 'Local investors', hook: 'Bandung\'s next boom area? Data says…', bestFormat: 'YouTube' },
  { id: 3, title: 'Before vs After: This property surged 40% in 18 months', category: 'Story', viralScore: 88, trend: 'Rising', audience: 'All segments', hook: 'Would you have bought this property 18 months ago?', bestFormat: 'Instagram' },
  { id: 4, title: 'Rental yield breakdown — which area wins?', category: 'Education', viralScore: 79, trend: 'Stable', audience: 'Yield seekers', hook: '8.2% vs 5.1% — same city, different returns…', bestFormat: 'LinkedIn' },
  { id: 5, title: 'I analyzed 500 listings with AI — here\'s what I found', category: 'Data Deep-Dive', viralScore: 94, trend: 'Hot', audience: 'Tech-savvy investors', hook: 'We ran every listing through our scoring engine…', bestFormat: 'TikTok' },
  { id: 6, title: '3 red flags AI detects in overpriced listings', category: 'Education', viralScore: 81, trend: 'Rising', audience: 'First-time buyers', hook: 'Stop overpaying. Here are 3 signals AI catches…', bestFormat: 'Instagram' },
];

const formats = [
  { key: 'tiktok', label: 'TikTok Short', icon: Play, duration: '15–60s', style: 'Fast cuts, text overlay, trending audio' },
  { key: 'instagram', label: 'Instagram Reel', icon: Film, duration: '30–90s', style: 'Polished visuals, location tags, carousel option' },
  { key: 'youtube', label: 'YouTube Short', icon: Play, duration: '30–60s', style: 'Data-driven, screen recordings, voiceover' },
  { key: 'linkedin', label: 'LinkedIn Post', icon: MessageSquare, duration: '~200 words', style: 'Insight-led, professional tone, thought leadership' },
];

const scoreColor = (s: number) => s >= 90 ? 'text-emerald-500' : s >= 80 ? 'text-primary' : 'text-amber-500';
const scoreBg = (s: number) => s >= 90 ? 'bg-emerald-500/10 border-emerald-500/30' : s >= 80 ? 'bg-primary/10 border-primary/30' : 'bg-amber-500/10 border-amber-500/30';
const trendBadge = (t: string) => t === 'Hot' ? 'bg-destructive/10 text-destructive border-destructive/30' : t === 'Rising' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted/30 text-muted-foreground border-border/50';

export default function PropertyContentEngine() {
  const [activeFormat, setActiveFormat] = useState('tiktok');
  const [selectedIdea, setSelectedIdea] = useState(contentIdeas[0]);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const activeFormatData = formats.find(f => f.key === activeFormat)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium">
            <Sparkles className="w-3 h-3" /> Content Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Property Content Machine</h1>
          <p className="text-muted-foreground text-sm">Generate viral real estate investment content ideas across all platforms</p>
        </motion.div>

        {/* ═══ CONTENT IDEA FEED + DETAIL ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* feed list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Content Ideas
              </h2>
              <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>

            {contentIdeas.map((idea, i) => (
              <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.05 }}
                onClick={() => setSelectedIdea(idea)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedIdea.id === idea.id
                  ? 'border-primary/40 bg-primary/[0.03] shadow-sm'
                  : 'border-border bg-card hover:border-primary/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-muted/20 text-muted-foreground">{idea.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${trendBadge(idea.trend)}`}>
                        {idea.trend === 'Hot' ? '🔥 ' : idea.trend === 'Rising' ? '📈 ' : ''}{idea.trend}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Best: {idea.bestFormat}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug">{idea.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Users className="w-3 h-3" /> {idea.audience}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${scoreBg(idea.viralScore)}`}>
                      <span className={`text-sm font-bold ${scoreColor(idea.viralScore)}`}>{idea.viralScore}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">Viral</span>
                  </div>
                </div>

                {/* mini bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${idea.viralScore}%` }} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSaved(p => { const n = new Set(p); n.has(idea.id) ? n.delete(idea.id) : n.add(idea.id); return n; }); }}
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className={`w-4 h-4 ${saved.has(idea.id) ? 'fill-primary text-primary' : ''}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* detail sidebar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-4">

            {/* viral score detail */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Viral Score Breakdown
              </h3>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${scoreBg(selectedIdea.viralScore)}`}>
                  <span className={`text-2xl font-bold ${scoreColor(selectedIdea.viralScore)}`}>{selectedIdea.viralScore}</span>
                  <span className="text-[9px] text-muted-foreground">/ 100</span>
                </div>
              </div>
              {[
                { label: 'Engagement Potential', value: selectedIdea.viralScore - 3 },
                { label: 'Trend Alignment', value: selectedIdea.trend === 'Hot' ? 95 : selectedIdea.trend === 'Rising' ? 78 : 60 },
                { label: 'Audience Interest', value: selectedIdea.viralScore + 2 > 100 ? 98 : selectedIdea.viralScore + 2 },
              ].map(m => (
                <div key={m.label} className="mb-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium text-foreground">{m.value}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/30">
                    <div className="h-full rounded-full bg-primary/70 transition-all duration-500" style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* script preview */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Script Preview
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Hook Line</span>
                  <p className="text-sm font-medium text-foreground mt-1">"{selectedIdea.hook}"</p>
                </div>
                <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Key Talking Points</span>
                  <ul className="mt-1.5 space-y-1">
                    {['Share the data point or discovery', 'Show visual proof (screenshot, map, chart)', 'Compare with market average', 'End with actionable takeaway'].map((p, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">CTA Recommendation</span>
                  <p className="text-sm text-foreground mt-1">"Follow for daily property intelligence — link in bio to explore AI-scored deals."</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ FORMAT TABS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Format Suggestions
          </h2>

          {/* tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {formats.map(f => (
              <button key={f.key} onClick={() => setActiveFormat(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeFormat === f.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 border border-border/50'}`}>
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>

          {/* active format detail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted/10 border border-border/50 p-3 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">{activeFormatData.duration}</p>
            </div>
            <div className="rounded-lg bg-muted/10 border border-border/50 p-3 text-center">
              <Hash className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">Style</p>
              <p className="text-sm font-medium text-foreground">{activeFormatData.style}</p>
            </div>
            <div className="rounded-lg bg-muted/10 border border-border/50 p-3 text-center">
              <ArrowUpRight className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">Best Posting Time</p>
              <p className="text-sm font-medium text-foreground">
                {activeFormat === 'linkedin' ? 'Tue/Thu 8–10am' : 'Mon/Wed/Fri 6–9pm'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ═══ ACTIONS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3 justify-center pb-8">
          {[
            { label: 'Generate Content Batch', icon: Sparkles, primary: true },
            { label: 'Save Viral Idea', icon: Bookmark, primary: false },
            { label: 'Export Posting Plan', icon: Download, primary: false },
          ].map(btn => (
            <button key={btn.label}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${btn.primary
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:brightness-110'
                : 'border border-border bg-card text-foreground hover:bg-accent/50'}`}>
              <btn.icon className="w-4 h-4" /> {btn.label} <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
