import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomepageLiveMetrics } from '@/hooks/useHomepageLiveMetrics';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, Users, Percent, Zap, Activity, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, Brain, Globe, ChevronRight
} from 'lucide-react';

// Animated counter component
const AnimatedNumber = ({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const startVal = display;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(startVal + (value - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span className="tabular-nums">{prefix}{display.toLocaleString('id-ID')}{suffix}</span>;
};

// Mini sparkline using SVG
const MiniSparkline = ({ color = 'hsl(var(--intel-blue))' }: { color?: string }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      pts.push(30 + Math.sin(i * 0.5) * 15 + Math.random() * 10);
    }
    return pts;
  }, []);
  const path = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 5},${y}`).join(' ');
  return (
    <svg width="100" height="60" viewBox="0 0 100 60" className="opacity-60">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// Sentiment indicator
const sentiments = ['Bullish', 'Neutral', 'Bearish'] as const;
const sentimentColors = { Bullish: 'text-intel-success', Neutral: 'text-gold-primary', Bearish: 'text-intel-danger' };
const sentimentIcons = { Bullish: ArrowUpRight, Neutral: Minus, Bearish: ArrowDownRight };

// Ticker items
const tickerItems = [
  'Jakarta CBD demand +12.4% MoM',
  'Bali rental yield hits 15.2% annual',
  'Surabaya supply alert: 45 new units',
  'Bandung investor activity surge detected',
  'Makassar emerging market signal activated',
  'Yogyakarta premium segment growing 8.3%',
  'Semarang institutional capital inflow',
  'Medan residential demand acceleration',
];

const GlobalMarketCommandCenter = () => {
  const { data: metrics } = useHomepageLiveMetrics();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sentimentIdx] = useState(() => Math.floor(Math.random() * 2)); // Bullish or Neutral
  const sentiment = sentiments[sentimentIdx];
  const SentimentIcon = sentimentIcons[sentiment];

  const kpis = useMemo(() => [
    { label: 'Active Investors', value: metrics?.activeInvestors || 0, icon: Users, color: 'text-intel-blue' },
    { label: 'Properties Trading', value: metrics?.totalListings || 0, icon: BarChart3, color: 'text-intel-success' },
    { label: 'Avg Rental Yield', value: metrics?.avgYield || 8.4, icon: Percent, color: 'text-gold-primary', suffix: '%' },
    { label: 'AI Match Speed', value: 2.4, icon: Zap, color: 'text-intel-purple', suffix: 's' },
  ], [metrics]);

  return (
    <section className="relative w-full overflow-hidden bg-[hsl(220,25%,6%)]" id="hero-section"
      style={{ minHeight: 'clamp(580px, 88vh, 920px)' }}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(217,91%,60%,0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(217,91%,60%,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[600px] rounded-full bg-[hsl(217,91%,60%,0.04)] blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full bg-[hsl(45,100%,60%,0.03)] blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col justify-between py-6 sm:py-10">
        {/* Main content */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

              {/* LEFT: Logo + Sparkline + Sentiment */}
              <div className="lg:col-span-4 space-y-5">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-intel-blue/20 bg-intel-blue/5 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-intel-blue opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-intel-blue" />
                    </span>
                    <span className="text-[10px] font-semibold text-intel-blue uppercase tracking-[0.2em]">
                      Autonomous Real Estate Exchange
                    </span>
                  </div>

                  {/* Mini chart */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">ASTRA Property Index</span>
                      <span className="text-[10px] font-bold text-intel-success">+4.7%</span>
                    </div>
                    <MiniSparkline />
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`flex items-center gap-1 ${sentimentColors[sentiment]}`}>
                        <SentimentIcon className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">{sentiment}</span>
                      </div>
                      <span className="text-[10px] text-white/30">AI Market Sentiment</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* CENTER: Headline */}
              <div className="lg:col-span-4 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="space-y-4"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-[1.1] text-white tracking-tight">
                    Multi-Billion Dollar{' '}
                    <span className="bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
                      Real Estate Liquidity
                    </span>{' '}
                    Powered by ASTRA Intelligence
                  </h1>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-intel-blue to-intel-blue/0 rounded-full mx-auto lg:mx-0" />
                  <p className="text-sm text-white/50 max-w-md mx-auto lg:mx-0 leading-relaxed">
                    Indonesia's autonomous property exchange platform combining institutional-grade analytics with AI-powered deal intelligence.
                  </p>
                  <div className="flex gap-3 justify-center lg:justify-start pt-2">
                    <Button
                      onClick={() => navigate('/investor-portfolio')}
                      className="bg-gradient-to-r from-intel-blue to-intel-blue/80 text-white font-semibold gap-2 h-10 px-5 border-0 hover:opacity-90"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Deploy Capital
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/buy')}
                      className="border-white/10 text-white/80 hover:bg-white/5 font-medium gap-2 h-10 px-5 bg-transparent"
                    >
                      Explore Assets
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT: KPI Stack */}
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {kpis.map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="p-3 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{kpi.label}</span>
                      </div>
                      <div className={`text-lg sm:text-xl font-bold text-white ${kpi.color ? '' : ''}`}>
                        <AnimatedNumber value={typeof kpi.value === 'number' ? Math.floor(kpi.value) : 0} suffix={kpi.suffix || ''} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bloomberg-style ticker */}
        <div className="mt-6 border-t border-white/[0.06]">
          <div className="relative overflow-hidden py-2.5">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[hsl(220,25%,6%)] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[hsl(220,25%,6%)] to-transparent z-10" />
            <motion.div
              className="flex gap-10 whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <Activity className="h-3 w-3 text-intel-blue/60" />
                  <span className="text-[11px] text-white/50 font-medium">{item}</span>
                  <span className="text-[10px] text-intel-success font-bold">LIVE</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalMarketCommandCenter;
