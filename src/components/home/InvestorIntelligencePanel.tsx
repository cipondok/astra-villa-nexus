import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Award, Sparkles, MapPin } from 'lucide-react';

const cities = [
  { name: 'Jakarta', roi: 12.4, trend: 'up' },
  { name: 'Bali', roi: 15.2, trend: 'up' },
  { name: 'Surabaya', roi: 9.8, trend: 'stable' },
  { name: 'Bandung', roi: 11.1, trend: 'up' },
];

const trustBadges = [
  { icon: Shield, label: 'Verified Listings' },
  { icon: Award, label: 'Institutional Grade' },
  { icon: Sparkles, label: 'AI-Scored' },
];

const InvestorIntelligencePanel = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <div className="glass-effect rounded-2xl p-4 sm:p-6 border border-border/40">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ROI Heatmap Summary */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-intel-blue/10">
                <TrendingUp className="h-4 w-4 text-intel-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">ROI by City</h3>
                <p className="text-[10px] text-muted-foreground">AI Forecast — Next 12 months</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => (
                <motion.div
                  key={city.name}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/30 cursor-pointer hover:border-gold-primary/30 transition-colors"
                  onClick={() => navigate('/investment-map-explorer')}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{city.name}</span>
                  </div>
                  <span className="text-xs font-bold text-intel-success tabular-nums">
                    {city.roi}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Badges + CTA */}
          <div className="lg:w-64 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <badge.icon className="h-4 w-4 text-gold-primary" />
                  <span className="font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/investor-portfolio')}
              className="w-full bg-gradient-to-r from-gold-primary to-gold-secondary text-foreground hover:opacity-90 font-semibold h-10"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Portfolio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorIntelligencePanel;
