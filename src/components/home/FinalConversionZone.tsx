import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home, Key, Building2, Store, Sparkles } from 'lucide-react';

const paths = [
  { label: 'Invest', icon: TrendingUp, path: '/investor-portfolio', primary: true },
  { label: 'Buy', icon: Home, path: '/buy', primary: false },
  { label: 'Rent', icon: Key, path: '/rent', primary: false },
  { label: 'List Property', icon: Building2, path: '/post-property', primary: false },
  { label: 'Become Vendor', icon: Store, path: '/vendor/register', primary: false },
];

const FinalConversionZone = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-primary/20 bg-gold-primary/5 mb-4">
        <Sparkles className="h-3 w-3 text-gold-primary" />
        <span className="text-[10px] sm:text-xs font-semibold text-gold-primary uppercase tracking-widest">
          Start Your Journey
        </span>
      </div>
      <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
        Where Real Estate Meets Intelligent Technology
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
        Indonesia's First AI-Powered Digital Virtual Tour Property Platform
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {paths.map((p) => (
          <Button
            key={p.label}
            variant={p.primary ? 'default' : 'outline'}
            size="lg"
            onClick={() => navigate(p.path)}
            className={
              p.primary
                ? 'bg-gradient-to-r from-gold-primary to-gold-secondary text-foreground hover:opacity-90 font-bold gap-2 h-11 px-6'
                : 'border-border/50 font-semibold gap-2 h-11 px-5'
            }
          >
            <p.icon className="h-4 w-4" />
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FinalConversionZone;
