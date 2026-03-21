import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Award, Sparkles, MapPin, ChevronRight, Globe } from 'lucide-react';

const cities = [
  { name: 'Jakarta', roi: 12.4, trend: 'up', signal: 'Strong' },
  { name: 'Bali', roi: 15.2, trend: 'up', signal: 'Very Strong' },
  { name: 'Surabaya', roi: 9.8, trend: 'stable', signal: 'Moderate' },
  { name: 'Bandung', roi: 11.1, trend: 'up', signal: 'Strong' },
];

const trustBadges = [
  { icon: Shield, label: 'Institutional Grade Verification' },
  { icon: Award, label: 'AI-Scored Investment Quality' },
  { icon: Globe, label: 'Global Investor Network' },
];

const InvestorIntelligencePanel = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <div className="rounded-2xl p-5 sm:p-7 border border-white/[0.06] bg-[hsl(220,25%,8%)] backdrop-blur-xl relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-intel-blue/[0.03] rounded-full blur-[80px]" />

        <div className="relative flex flex-col lg:flex-row gap-6">
          {/* ROI Heatmap */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-intel-blue/10 border border-intel-blue/20">
                <TrendingUp className="h-4 w-4 text-intel-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ROI Intelligence by City</h3>
                <p className="text-[10px] text-white/40">AI Forecast — Next 12 months projection</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city, i) => (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-intel-blue/20 transition-all"
                  onClick={() => navigate('/investment-map-explorer')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-white/30" />
                      <span className="text-xs font-semibold text-white">{city.name}</span>
                    </div>
                    <span className="text-xs font-bold text-intel-success tabular-nums">
                      {city.roi}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Signal</span>
                    <span className="text-[10px] font-medium text-intel-blue">{city.signal}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Badges + CTA */}
          <div className="lg:w-72 flex flex-col justify-between gap-5">
            <div className="space-y-3.5">
              <h4 className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">Trust Signals</h4>
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                  <badge.icon className="h-4 w-4 text-gold-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-white/70">{badge.label}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/portfolio-dashboard')}
              className="w-full bg-gradient-to-r from-gold-primary to-gold-secondary text-black font-bold h-11 gap-2 hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Start Portfolio
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorIntelligencePanel;
