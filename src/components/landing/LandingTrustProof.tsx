import { motion } from 'framer-motion';
import { Star, Quote, Search, BarChart3, BadgeDollarSign } from 'lucide-react';

const testimonials = [
  {
    name: 'David Hartono',
    role: 'Private Investor, Singapore',
    quote: "ASTRA's AI scoring helped me identify a Canggu villa that yielded 18% ROI in the first year. The market intelligence is unmatched.",
    rating: 5,
    avatar: 'DH',
  },
  {
    name: 'Sarah Chen',
    role: 'Portfolio Investor, Hong Kong',
    quote: 'I discovered three off-market opportunities through the platform that I would never have found through traditional agents.',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Andi Prasetyo',
    role: 'Developer Partner, Jakarta',
    quote: 'Our pre-launch campaign reached 2,400 qualified investors in 48 hours. The demand analytics saved us months of market research.',
    rating: 5,
    avatar: 'AP',
  },
];

const steps = [
  {
    icon: Search,
    title: 'Browse',
    description: 'Explore curated properties across Bali, Jakarta, and BSD with full market data.',
  },
  {
    icon: BarChart3,
    title: 'Score',
    description: 'Every listing is AI-scored on rental yield, capital growth, and location potential.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Invest',
    description: 'Connect directly with verified sellers and close deals with confidence.',
  },
];

const LandingTrustProof = () => {
  return (
    <section className="relative py-20 md:py-32 bg-astra-navy-dark overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <span className="font-inter text-xs uppercase tracking-[0.2em] text-gold-primary mb-4 block">
            What Investors Say
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-titanium-white mb-4">
            Success Stories
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent mx-auto" />
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative p-6 rounded-2xl border border-border/15 bg-card/5 hover:border-gold-primary/20 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-gold-primary/20 mb-4" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-gold-primary text-gold-primary" />
                ))}
              </div>
              <p className="font-inter text-sm text-text-muted leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-primary/20 to-gold-primary/5 border border-gold-primary/20 flex items-center justify-center">
                  <span className="font-playfair text-xs font-bold text-gold-primary">{t.avatar}</span>
                </div>
                <div>
                  <p className="font-inter text-sm font-semibold text-titanium-white">{t.name}</p>
                  <p className="font-inter text-[11px] text-text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-inter text-xs uppercase tracking-[0.2em] text-text-muted mb-10">
            How It Works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-gold-primary" />
                </div>
                <span className="font-inter text-[10px] uppercase tracking-widest text-gold-primary/60 mb-1">
                  Step {i + 1}
                </span>
                <h3 className="font-playfair text-lg font-bold text-titanium-white mb-2">{step.title}</h3>
                <p className="font-inter text-sm text-text-muted leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTrustProof;
