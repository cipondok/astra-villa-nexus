import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BarChart3, Brain, Flame, Target } from 'lucide-react';

interface Props {
  cityName: string;
  hotspot: any;
  properties: any[];
}

const CityInsightsSection = ({ cityName, hotspot, properties }: Props) => {
  const avgPrice = properties.length > 0
    ? properties.reduce((s, p) => s + (p.price || 0), 0) / properties.length
    : 0;

  const avgYield = properties.filter(p => p.rental_yield_percentage).length > 0
    ? properties.filter(p => p.rental_yield_percentage).reduce((s, p) => s + p.rental_yield_percentage, 0) / properties.filter(p => p.rental_yield_percentage).length
    : null;

  const avgScore = properties.filter(p => p.opportunity_score).length > 0
    ? Math.round(properties.filter(p => p.opportunity_score).reduce((s, p) => s + p.opportunity_score, 0) / properties.filter(p => p.opportunity_score).length)
    : null;

  const formatPrice = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)} Miliar`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)} Juta`;
    return `Rp ${v.toLocaleString('id-ID')}`;
  };

  const heatLevel = hotspot?.hotspot_score
    ? hotspot.hotspot_score >= 75 ? 'Investment Hotspot' : hotspot.hotspot_score >= 50 ? 'Growing Market' : 'Stable Market'
    : 'Emerging Market';

  const heatColor = hotspot?.hotspot_score
    ? hotspot.hotspot_score >= 75 ? 'text-heat-fire' : hotspot.hotspot_score >= 50 ? 'text-heat-hot' : 'text-heat-warm'
    : 'text-heat-cool';

  const recommendation = avgScore
    ? avgScore >= 80 ? 'Strong Buy – High concentration of elite-scored properties.' : avgScore >= 65 ? 'Growth Zone – Early-stage opportunities with upside potential.' : 'Monitor – Selective opportunities available for patient investors.'
    : 'Explore individual listings for AI investment recommendations.';

  const insights = [
    {
      icon: DollarSign,
      title: 'Avg. Property Price',
      value: avgPrice > 0 ? formatPrice(avgPrice) : 'Varies',
      sub: 'Based on active listings',
      color: 'text-gold-primary',
    },
    {
      icon: BarChart3,
      title: 'Est. Rental Yield',
      value: avgYield ? `${avgYield.toFixed(1)}% /yr` : 'Data pending',
      sub: 'Gross annual yield estimate',
      color: 'text-intel-success',
    },
    {
      icon: Flame,
      title: 'Demand Heat',
      value: heatLevel,
      sub: hotspot?.hotspot_score ? `Score: ${hotspot.hotspot_score}/100` : 'Calculating...',
      color: heatColor,
    },
    {
      icon: Target,
      title: 'Avg. Opportunity Score',
      value: avgScore ? `${avgScore}/100` : '—',
      sub: 'AI composite investment score',
      color: 'text-intel-blue',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-2">
            Investment Insights – {cityName}
          </h2>
          <div className="w-12 h-[1px] bg-gradient-to-r from-gold-primary to-transparent" />
        </motion.div>

        {/* Insight cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {insights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-border bg-card"
            >
              <item.icon className={`w-5 h-5 ${item.color} mb-3`} />
              <div className="font-inter text-xs text-muted-foreground mb-1">{item.title}</div>
              <div className={`font-playfair text-lg md:text-xl font-bold ${item.color}`}>{item.value}</div>
              <div className="font-inter text-[11px] text-muted-foreground mt-1">{item.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 md:p-6 rounded-2xl border border-primary/20 bg-primary/5"
        >
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-inter text-sm font-semibold text-foreground mb-1">AI Investment Recommendation</h3>
              <p className="font-inter text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CityInsightsSection;
