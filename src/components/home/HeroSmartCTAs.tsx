import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home, Key, Store } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const HeroSmartCTAs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const ctas = [
    { label: t('homeComponents.investNow'), icon: TrendingUp, path: '/portfolio-dashboard', variant: 'default' as const },
    { label: t('homeComponents.buyProperty'), icon: Home, path: '/buy', variant: 'outline' as const },
    { label: t('homeComponents.rentInstantly'), icon: Key, path: '/rent', variant: 'outline' as const },
    { label: t('homeComponents.listAsVendor'), icon: Store, path: '/vendor/register', variant: 'outline' as const },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {ctas.map((cta) => (
        <Button
          key={cta.label}
          variant={cta.variant}
          size="sm"
          onClick={() => navigate(cta.path)}
          className={
            cta.variant === 'default'
              ? 'bg-gold-primary text-foreground hover:bg-gold-primary/90 font-semibold gap-1.5 h-9 px-4 text-xs sm:text-sm'
              : 'border-border/50 bg-background/30 backdrop-blur-sm hover:bg-background/50 font-medium gap-1.5 h-9 px-4 text-xs sm:text-sm'
          }
        >
          <cta.icon className="h-3.5 w-3.5" />
          {cta.label}
        </Button>
      ))}
    </div>
  );
};

export default HeroSmartCTAs;
