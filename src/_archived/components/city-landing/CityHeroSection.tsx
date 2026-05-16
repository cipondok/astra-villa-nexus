import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Building2, Flame } from 'lucide-react';

interface Props {
  cityName: string;
  hotspot: any;
  propertyCount: number;
}

const trendLabel = (t: string | null) => {
  if (!t) return { text: 'Stable', color: 'text-chart-4', icon: TrendingUp };
  if (t.toLowerCase().includes('up') || t.toLowerCase().includes('rising')) return { text: 'Rising', color: 'text-intel-success', icon: TrendingUp };
  if (t.toLowerCase().includes('hot')) return { text: 'Hot Market', color: 'text-heat-fire', icon: Flame };
  return { text: t, color: 'text-chart-4', icon: TrendingUp };
};

const CityHeroSection = ({ cityName, hotspot, propertyCount }: Props) => {
  const trend = trendLabel(hotspot?.trend);
  const TrendIcon = trend.icon;

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-astra-navy-dark via-astra-navy to-background overflow-hidden">
      {/* Gold line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />

      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted font-inter mb-6">
            <a href="/" className="hover:text-gold-primary transition-colors">Home</a>
            <span>/</span>
            <a href="/investment" className="hover:text-gold-primary transition-colors">Investment</a>
            <span>/</span>
            <span className="text-gold-primary">{cityName}</span>
          </nav>

          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-titanium-white leading-tight mb-4">
            Property Investment in
            <br />
            <span className="bg-gradient-to-r from-gold-primary via-astra-gold-light to-gold-primary bg-clip-text text-transparent">
              {cityName}
            </span>
          </h1>

          <p className="font-inter text-base md:text-lg text-text-muted max-w-2xl mb-8 leading-relaxed">
            Explore AI-scored investment opportunities in {cityName}. Our intelligence engine continuously analyzes market dynamics, rental demand, and price trends to surface the best deals.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/20 bg-card/5">
              <Building2 className="w-4 h-4 text-gold-primary" />
              <span className="font-inter text-sm text-titanium-white font-medium">{propertyCount}+ Listings</span>
            </div>
            {hotspot?.hotspot_score && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/20 bg-card/5">
                <Flame className="w-4 h-4 text-heat-hot" />
                <span className="font-inter text-sm text-titanium-white font-medium">Heat Score: {hotspot.hotspot_score}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/20 bg-card/5">
              <TrendIcon className={`w-4 h-4 ${trend.color}`} />
              <span className={`font-inter text-sm font-medium ${trend.color}`}>{trend.text}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/20 bg-card/5">
              <MapPin className="w-4 h-4 text-gold-primary" />
              <span className="font-inter text-sm text-titanium-white font-medium">Indonesia</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CityHeroSection;
