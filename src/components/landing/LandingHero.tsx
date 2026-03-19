import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-astra-navy-dark via-astra-navy to-astra-navy-dark" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-astra-navy-dark via-astra-navy-dark/60 to-transparent" />

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-primary/30 bg-gold-primary/10 mb-8">
            <TrendingUp className="w-3.5 h-3.5 text-gold-primary" />
            <span className="text-xs font-inter font-medium tracking-wider uppercase text-gold-primary">
              AI-Powered Investment Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            <span className="text-titanium-white">Invest Smarter in</span>
            <br />
            <span className="bg-gradient-to-r from-gold-primary via-astra-gold-light to-gold-primary bg-clip-text text-transparent animate-hero-brand-glow">
              Indonesia's Premium
            </span>
            <br />
            <span className="text-titanium-white">Properties</span>
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-base md:text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Every listing is AI-scored for investment potential. Browse real properties in Bali, Jakarta,
            and BSD with rental yield analytics and market intelligence — free to explore.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-gold-primary to-astra-gold-muted hover:from-astra-gold-muted hover:to-gold-primary text-astra-navy-dark font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-gold-primary/20 transition-all duration-300"
            >
              View Investment Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/onboarding/investor')}
              className="border-gold-primary/40 text-gold-primary hover:bg-gold-primary/10 px-8 py-6 text-base rounded-xl"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Start Investor Profile
            </Button>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-4 mt-6 text-text-muted/60 font-inter text-xs">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Free access</span>
            <span className="text-border/30">·</span>
            <span>No credit card</span>
            <span className="text-border/30">·</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI scoring on every listing</span>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto"
          >
            {[
              { value: '5', label: 'Live Listings' },
              { value: 'AI', label: 'Scored & Ranked' },
              { value: 'Bali · JKT', label: 'Markets Covered' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-playfair text-2xl md:text-3xl font-bold text-gold-primary">
                  {stat.value}
                </div>
                <div className="font-inter text-[11px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-astra-navy-dark to-transparent" />
    </section>
  );
};

export default LandingHero;
