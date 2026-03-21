import { motion } from 'framer-motion';
import { Brain, Globe, Zap, Shield, Cpu, BarChart3 } from 'lucide-react';

const techItems = [
  { icon: Brain, label: 'AI Valuation Engine' },
  { icon: Globe, label: 'Global Demand Heatmap' },
  { icon: Zap, label: 'Autonomous Deal Matching' },
  { icon: Shield, label: 'Smart Contract Ready' },
  { icon: Cpu, label: 'Predictive Analytics' },
  { icon: BarChart3, label: 'Market Intelligence API' },
];

const TechnologyAuthorityStrip = () => (
  <div className="relative overflow-hidden py-5 bg-muted/30 border-y border-border/30">
    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
    <motion.div
      className="flex gap-8 sm:gap-12 whitespace-nowrap"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      {[...techItems, ...techItems].map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gold-primary/10 border border-gold-primary/15">
            <item.icon className="h-3.5 w-3.5 text-gold-primary" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </motion.div>
  </div>
);

export default TechnologyAuthorityStrip;
