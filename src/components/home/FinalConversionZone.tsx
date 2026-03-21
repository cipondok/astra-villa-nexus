import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home, Key, Building2, Store, Sparkles, ArrowRight } from 'lucide-react';

const paths = [
  { label: 'Invest Capital', icon: TrendingUp, path: '/investor-portfolio', primary: true },
  { label: 'Buy Property', icon: Home, path: '/buy', primary: false },
  { label: 'Rent Instantly', icon: Key, path: '/rent', primary: false },
  { label: 'List Property', icon: Building2, path: '/post-property', primary: false },
  { label: 'Become Vendor Partner', icon: Store, path: '/vendor/register', primary: false },
];

const FinalConversionZone = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden py-12 sm:py-16">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-intel-blue/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[200px] bg-gold-primary/[0.03] rounded-full blur-[80px]" />

      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-primary/15 bg-gold-primary/5 mb-5">
            <Sparkles className="h-3 w-3 text-gold-primary" />
            <span className="text-[10px] sm:text-xs font-semibold text-gold-primary uppercase tracking-widest">
              Start Your Journey
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Where Real Estate Meets{' '}
            <span className="bg-gradient-to-r from-gold-primary to-gold-secondary bg-clip-text text-transparent">
              Intelligent Technology
            </span>
          </h2>
          <p className="text-sm text-white/40 mb-8 max-w-lg mx-auto">
            Indonesia's First AI-Powered Digital Virtual Tour Property Platform — Operating at Global Scale
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {paths.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate(p.path)}
                  className={
                    p.primary
                      ? 'bg-gradient-to-r from-gold-primary to-gold-secondary text-black font-bold gap-2 h-12 px-7 border-0 hover:opacity-90'
                      : 'border border-white/10 text-white/70 bg-transparent hover:bg-white/5 font-semibold gap-2 h-12 px-6'
                  }
                >
                  <p.icon className="h-4 w-4" />
                  {p.label}
                  {p.primary && <ArrowRight className="h-4 w-4" />}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalConversionZone;
