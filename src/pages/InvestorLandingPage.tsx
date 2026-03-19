import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SEOHead, seoSchemas } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Brain, TrendingUp, Target, Bookmark, BarChart3, MessageSquare,
  BellRing, ArrowRight, ChevronRight, Shield, Zap, Globe, Star, Quote,
  Building2, MapPin, LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================
   INVESTOR LANDING PAGE — Global Proptech Conversion Page
   ============================================================ */

export default function InvestorLandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="AI Property Investment Platform — ASTRA"
        description="Discover Indonesia's smartest property investments. AI analyzes market data, rental demand, and growth signals to reveal hidden real estate opportunities."
        keywords="AI property investment, Indonesia real estate, villa investment bali, rental yield, proptech"
        jsonLd={[seoSchemas.organization(), seoSchemas.realEstateAgent()]}
      />

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-playfair text-lg font-bold tracking-tight">ASTRA</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#listings" className="hover:text-foreground transition-colors">Listings</a>
              <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        <HeroSection navigate={navigate} />
        <HowAIWorksSection />
        <FeaturedListingsSection navigate={navigate} />
        <InvestorBenefitsSection />
        <SocialProofSection />
        <FinalCTASection navigate={navigate} />
        <FooterSection />
      </div>
    </>
  );
}

/* ===================== HERO ===================== */
function HeroSection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  const trustItems = [
    { icon: <BarChart3 className="w-3.5 h-3.5" />, text: 'Data-driven scoring' },
    { icon: <Target className="w-3.5 h-3.5" />, text: 'Investor-focused listings' },
    { icon: <Shield className="w-3.5 h-3.5" />, text: 'Premium developer network' },
  ];

  return (
    <section ref={ref} className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <motion.div style={{ opacity, y }} className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-medium border-primary/20 text-primary bg-primary/5">
            <Sparkles className="w-3 h-3 mr-1.5" />
            AI-Powered Investment Intelligence
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground mb-6"
        >
          Discover Indonesia's{' '}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Smartest
          </span>{' '}
          Property Investments
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI analyzes market data, rental demand, and growth signals to reveal hidden real estate opportunities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
        >
          <Button size="lg" className="h-12 px-8 text-base font-semibold" onClick={() => navigate('/search')}>
            Explore AI Opportunities
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => navigate('/contact')}>
            Request Private Investor Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="text-primary">{item.icon}</div>
              {item.text}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ===================== HOW AI WORKS ===================== */
function HowAIWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const cards = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Scans Market Pricing',
      desc: 'AI identifies pricing inefficiencies across thousands of listings, spotting undervalued assets before the market corrects.',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: 'Predicts Yield & Liquidity',
      desc: 'Machine learning models forecast rental yields and resale liquidity using historical data, tourism trends, and demand signals.',
      gradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Surfaces Opportunities',
      desc: 'High-opportunity deals are ranked and surfaced with confidence scores so you can act decisively on the best investments.',
      gradient: 'from-amber-500/10 to-orange-500/10',
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-20 sm:py-28 bg-accent/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" className="mb-4 text-xs">How It Works</Badge>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Intelligence That Finds the Deals
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three layers of AI analysis working continuously to surface your next best investment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group bg-card border border-border rounded-2xl p-7 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-primary mb-5', card.gradient)}>
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== FEATURED LISTINGS ===================== */
function FeaturedListingsSection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const listings = [
    {
      title: 'Modern Villa with Infinity Pool',
      location: 'Canggu, Bali',
      price: 'IDR 5.2B',
      yield: '14.2%',
      score: 92,
      type: 'Villa',
      specs: '3 BD · 3 BA · 250 m²',
    },
    {
      title: 'Beachfront Residence Penthouse',
      location: 'Seminyak, Bali',
      price: 'IDR 8.8B',
      yield: '11.5%',
      score: 87,
      type: 'Apartment',
      specs: '4 BD · 4 BA · 320 m²',
    },
    {
      title: 'Eco Retreat in Rice Terraces',
      location: 'Ubud, Bali',
      price: 'IDR 3.6B',
      yield: '16.8%',
      score: 95,
      type: 'Villa',
      specs: '2 BD · 2 BA · 180 m²',
    },
  ];

  return (
    <section id="listings" ref={ref} className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <Badge variant="outline" className="mb-4 text-xs">Featured</Badge>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
              Elite Opportunities
            </h2>
          </div>
          <Button variant="ghost" className="text-primary" onClick={() => navigate('/search')}>
            View All Listings <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/search')}
            >
              {/* Image placeholder */}
              <div className="relative h-52 bg-gradient-to-br from-accent to-accent/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-muted-foreground/30" />
                </div>
                {/* Score badge */}
                <div className="absolute top-3 right-3">
                  <div className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                    listing.score >= 90
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/90 backdrop-blur-sm text-foreground border border-border'
                  )}>
                    <Zap className="w-3 h-3" />
                    {listing.score}
                  </div>
                </div>
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="text-[10px] bg-card/90 backdrop-blur-sm">{listing.type}</Badge>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{listing.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.location}
                </div>
                <p className="text-xs text-muted-foreground mb-4">{listing.specs}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{listing.price}</span>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {listing.yield} yield
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== INVESTOR BENEFITS ===================== */
function InvestorBenefitsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const benefits = [
    { icon: <Bookmark className="w-5 h-5" />, title: 'Save to Watchlist', desc: 'Track properties that match your investment thesis and get notified on changes.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Track Opportunity Scores', desc: 'Real-time scoring updates as market conditions, demand, and pricing shift.' },
    { icon: <Sparkles className="w-5 h-5" />, title: 'AI Investment Insights', desc: 'Personalized deal recommendations, yield forecasts, and risk assessments.' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Direct Agent Access', desc: 'Instant negotiation channel with verified agents for premium listings.' },
  ];

  return (
    <section id="benefits" ref={ref} className="py-20 sm:py-28 bg-accent/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" className="mb-4 text-xs">For Investors</Badge>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Your Investment Command Center
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tools designed for serious property investors who want data, speed, and conviction.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {b.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== SOCIAL PROOF ===================== */
function SocialProofSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const testimonials = [
    {
      quote: "Finally a smarter way to invest in property. The AI scoring changed how I evaluate deals.",
      author: "R. Santoso",
      role: "Private Investor, Jakarta",
    },
    {
      quote: "Feels like using a hedge fund tool for real estate. The data depth is unmatched in this market.",
      author: "A. Chen",
      role: "Portfolio Manager, Singapore",
    },
    {
      quote: "I closed my best deal through ASTRA. The yield prediction was accurate within 2% of actual.",
      author: "M. Williams",
      role: "International Investor, Sydney",
    },
  ];

  return (
    <section ref={ref} className="py-20 sm:py-28 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="outline" className="mb-4 text-xs">
            <Star className="w-3 h-3 mr-1 text-primary" />
            Trusted by Investors
          </Badge>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
            What Investors Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-7 relative"
            >
              <Quote className="w-8 h-8 text-primary/15 absolute top-5 right-5" />
              <p className="text-foreground/90 leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div>
                <div className="font-semibold text-sm text-foreground">{t.author}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== FINAL CTA ===================== */
function FinalCTASection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
            Start building your property investment edge
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join investors using AI-powered insights to discover, analyze, and act on the best property opportunities in Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="h-13 px-10 text-base font-semibold" onClick={() => navigate('/auth')}>
              Create Investor Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-10 text-base" onClick={() => navigate('/contact')}>
              Talk to Our Team
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== FOOTER ===================== */
function FooterSection() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-playfair text-base font-bold">ASTRA</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered property investment intelligence for the Indonesian real estate market.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="space-y-2.5">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Platform</h4>
              <div className="space-y-1.5 text-muted-foreground">
                <a href="/search" className="block hover:text-foreground transition-colors">Browse Listings</a>
                <a href="/ai-recommendations" className="block hover:text-foreground transition-colors">AI Insights</a>
                <a href="/market-intelligence" className="block hover:text-foreground transition-colors">Market Data</a>
              </div>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Company</h4>
              <div className="space-y-1.5 text-muted-foreground">
                <a href="/about" className="block hover:text-foreground transition-colors">About</a>
                <a href="/contact" className="block hover:text-foreground transition-colors">Contact</a>
                <a href="/agent-registration" className="block hover:text-foreground transition-colors">For Agents</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ASTRA AI. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
