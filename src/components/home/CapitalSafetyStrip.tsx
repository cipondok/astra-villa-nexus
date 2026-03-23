import { motion } from 'framer-motion';
import { Wallet, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    title: 'Fund Wallet Securely',
    desc: 'Deposit via bank transfer, e-wallet, or international payment',
  },
  {
    icon: Shield,
    title: 'Reserve via Escrow',
    desc: 'Funds held in protected escrow until conditions are met',
  },
  {
    icon: CheckCircle2,
    title: 'Complete Verified Transaction',
    desc: 'Property verified, legal checks passed, ownership transferred',
  },
];

const CapitalSafetyStrip = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 mb-3">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-widest">
            Investor Protection
          </span>
        </div>
        <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
          Your Capital, Always Protected
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Every transaction flows through our secure escrow infrastructure
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative">
        {/* Connector lines (desktop only) */}
        <div className="hidden sm:block absolute top-10 left-[calc(33.33%+8px)] right-[calc(33.33%+8px)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex flex-col items-center text-center relative"
          >
            {/* Step number + icon */}
            <div className="relative mb-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </div>
            </div>

            {/* Mobile arrow between steps */}
            {i < steps.length - 1 && (
              <div className="sm:hidden my-1">
                <ArrowRight className="h-4 w-4 text-primary/30 rotate-90" />
              </div>
            )}

            <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust statement */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/50 border border-border/40">
          <Shield className="h-3.5 w-3.5 text-chart-1" />
          <span className="text-xs text-muted-foreground font-medium">
            Your funds remain protected until deal conditions are met.
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default CapitalSafetyStrip;
