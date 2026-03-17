import { motion } from 'framer-motion';
import { Brain, Flame, BarChart3, Rocket, Shield, Globe } from 'lucide-react';

const benefits = [
  {
    icon: Brain,
    title: 'AI Opportunity Scoring',
    description: 'Every property rated 0–100 by our AI engine analyzing price, location, growth potential, and market demand.',
    accent: 'from-intel-blue to-intel-blue-glow',
  },
  {
    icon: Flame,
    title: 'Market Heat Intelligence',
    description: 'Real-time clustering of demand hotspots across Indonesia so you invest where momentum is building.',
    accent: 'from-heat-hot to-heat-fire',
  },
  {
    icon: BarChart3,
    title: 'Rental Income Insights',
    description: 'Projected rental yields, occupancy forecasts, and comparable income data for every listed property.',
    accent: 'from-intel-success to-chart-2',
  },
  {
    icon: Rocket,
    title: 'Developer Launch Support',
    description: 'Pre-launch demand analytics, JV partnerships, and direct-to-investor distribution for new projects.',
    accent: 'from-intel-purple to-chart-5',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'Blockchain-backed document verification and fraud detection to protect every transaction.',
    accent: 'from-gold-primary to-astra-gold-muted',
  },
  {
    icon: Globe,
    title: 'Foreign Investment Guide',
    description: 'End-to-end guidance for international investors including legal, taxation, and ownership structures.',
    accent: 'from-chart-3 to-intel-blue',
  },
];

const LandingBenefits = () => {
  return (
    <section className="relative py-20 md:py-32 bg-astra-navy-dark">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="font-inter text-xs uppercase tracking-[0.2em] text-gold-primary mb-4 block">
            Platform Intelligence
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-titanium-white mb-4">
            Why Investors Choose ASTRA
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent mx-auto" />
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative p-6 rounded-2xl border border-border/20 bg-card/5 hover:bg-card/10 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${b.accent} mb-4`}>
                <b.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-playfair text-lg font-semibold text-titanium-white mb-2">{b.title}</h3>
              <p className="font-inter text-sm text-text-muted leading-relaxed">{b.description}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: '0 0 40px hsl(var(--gold-primary) / 0.06)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingBenefits;
