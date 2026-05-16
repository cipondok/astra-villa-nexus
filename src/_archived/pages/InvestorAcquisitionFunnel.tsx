import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Play, Eye, Brain, TrendingUp, Bell, ChevronRight, Zap, Star, Shield, BarChart3, Search, Bookmark, Handshake, AlertTriangle, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── animated counter ── */
function AnimCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── urgency toast ── */
const urgencyAlerts = [
  { icon: AlertTriangle, text: 'New undervalued villa detected — Canggu, Bali', time: '2 min ago', color: 'text-amber-500' },
  { icon: TrendingUp, text: 'Price drop alert triggered — 12% below market', time: '8 min ago', color: 'text-emerald-500' },
  { icon: MapPin, text: 'High rental yield zone rising — Seminyak corridor', time: '14 min ago', color: 'text-primary' },
];

export default function InvestorAcquisitionFunnel() {
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setActiveAlert(p => (p + 1) % urgencyAlerts.length), 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
              <Zap className="w-3 h-3" /> AI-Powered Deal Intelligence
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight max-w-3xl mx-auto">
              Find Undervalued Property Deals{' '}
              <span className="text-primary">Before the Market Moves</span>
            </h1>

            <p className="mt-5 text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              AI scans pricing inefficiencies, rental demand, and growth signals across thousands of properties in real time.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                Unlock AI Deal Feed <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/properties')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border bg-card/60 text-foreground font-medium text-base hover:bg-accent/50 transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> See Live Opportunity Demo
              </button>
            </div>

            {/* micro trust */}
            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Free forever plan</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.9/5 investor rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF COUNTERS ═══ */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { label: 'Active Investors Viewing Deals', value: 2847, suffix: '+', icon: Eye },
              { label: 'Properties Analyzed by AI', value: 184300, suffix: '+', icon: Brain },
              { label: 'Deals Entered into Negotiation', value: 1263, suffix: '', icon: Handshake },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  <AnimCounter end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FUNNEL STEPS ═══ */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Your Path to Smarter Investing</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Three intelligent steps from discovery to deal execution</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {[
            { step: 1, icon: Search, title: 'Discover', desc: 'AI-scored listings surface undervalued deals with pricing inefficiency and growth signals.', accent: 'from-primary/20 to-primary/5' },
            { step: 2, icon: Bookmark, title: 'Save & Track', desc: 'Build a smart watchlist that monitors price movements, demand shifts, and yield changes.', accent: 'from-primary/15 to-primary/5' },
            { step: 3, icon: Handshake, title: 'Negotiate', desc: 'Enter deal negotiation with AI-powered offer recommendations and market intelligence.', accent: 'from-primary/10 to-primary/5' },
          ].map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 p-6 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.accent} border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform`}>
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md shadow-primary/20">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ URGENCY TRIGGERS ═══ */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Live Intelligence Alerts</h2>
            <p className="mt-3 text-muted-foreground">Real-time signals our AI is detecting right now</p>
          </motion.div>

          <div className="max-w-lg mx-auto space-y-3">
            {urgencyAlerts.map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-500 ${i === activeAlert
                  ? 'border-primary/40 bg-primary/5 shadow-md shadow-primary/5'
                  : 'border-border/30 bg-card/40'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${i === activeAlert ? 'bg-primary/15' : 'bg-muted/30'}`}>
                  <alert.icon className={`w-4 h-4 ${i === activeAlert ? alert.color : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${i === activeAlert ? 'text-foreground' : 'text-muted-foreground'}`}>{alert.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{alert.time}</p>
                </div>
                {i === activeAlert && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Start Building Your Property{' '}
              <span className="text-primary">Investment Edge</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Join thousands of investors using AI to discover deals others miss.
            </p>
            <button onClick={() => navigate('/auth')}
              className="mt-8 px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 transition-all flex items-center gap-2 mx-auto">
              Create Free Investor Account <ChevronRight className="w-5 h-5" />
            </button>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required · Setup in 30 seconds</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
