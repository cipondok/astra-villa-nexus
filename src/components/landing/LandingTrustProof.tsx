import { motion } from 'framer-motion';
import { Star, Quote, Building2 } from 'lucide-react';

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

const partners = [
  'Intiland Development',
  'Ciputra Group',
  'Sinar Mas Land',
  'Agung Podomoro',
  'Summarecon Agung',
  'Pakuwon Jati',
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
            Trusted by Investors
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
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-gold-primary/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-gold-primary text-gold-primary" />
                ))}
              </div>

              {/* Quote text */}
              <p className="font-inter text-sm text-text-muted leading-relaxed mb-6">
                "{t.quote}"
              </p>

              {/* Author */}
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

        {/* Partner logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-inter text-xs uppercase tracking-[0.2em] text-text-muted mb-8">
            Developer Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {partners.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/10 bg-card/5 hover:border-gold-primary/15 transition-colors"
              >
                <Building2 className="w-4 h-4 text-gold-primary/50" />
                <span className="font-inter text-sm text-text-muted/80 font-medium tracking-wide">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTrustProof;
