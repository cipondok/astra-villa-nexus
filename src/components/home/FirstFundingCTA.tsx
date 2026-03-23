import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useHomepageLiveMetrics } from '@/hooks/useHomepageLiveMetrics';

const FirstFundingCTA = () => {
  const navigate = useNavigate();
  const { data: metrics } = useHomepageLiveMetrics();

  const suggestedAmounts = [
    { label: 'Rp 2,000,000', desc: 'Test investment' },
    { label: 'Rp 5,000,000', desc: 'Most popular' },
    { label: 'Rp 10,000,000', desc: 'Recommended' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-accent/30"
      >
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-[40px]" />

        <div className="relative p-5 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 shrink-0">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-0.5">
                Start Your Investment Journey
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Many investors begin with Rp 2–5 million to explore opportunities.
              </p>
            </div>
          </div>

          {/* Suggested amounts */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {suggestedAmounts.map((amount, i) => (
              <motion.button
                key={amount.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate('/wallet')}
                className="flex flex-col items-center p-3 rounded-xl border border-border/60 hover:border-primary/30 bg-background/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {amount.label}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{amount.desc}</span>
                {i === 1 && (
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-gold-primary/10 text-gold-primary text-[9px] font-semibold">
                    Popular
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
            {metrics && (
              <>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-chart-1" />
                  <span>{metrics.activeInvestors.toLocaleString('id-ID')}+ active investors</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-gold-primary" />
                  <span>{metrics.avgYield}% avg. yield</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-primary" />
              <span>Escrow protected</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => navigate('/wallet')}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Fund Your Wallet
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/search')}
              className="gap-2"
            >
              Browse Opportunities First
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FirstFundingCTA;
