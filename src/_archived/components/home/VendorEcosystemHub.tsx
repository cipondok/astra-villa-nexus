import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Building2, Palette, Wifi, Scale, Star, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const VendorEcosystemHub = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const segments = [
    { icon: Building2, titleKey: 'developersTitle', descKey: 'developersDesc', projects: 24, value: 'Rp 2.1T', rating: 4.8 },
    { icon: Palette, titleKey: 'interiorStudios', descKey: 'interiorStudiosDesc', projects: 156, value: 'Rp 45M avg', rating: 4.7 },
    { icon: Wifi, titleKey: 'smartHomeTech', descKey: 'smartHomeTechDesc', projects: 89, value: 'Rp 28M avg', rating: 4.6 },
    { icon: Scale, titleKey: 'legalFinance', descKey: 'legalFinanceDesc', projects: 312, value: 'Rp 15M avg', rating: 4.9 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-primary/15 bg-gold-primary/5 mb-3">
          <Zap className="h-3 w-3 text-gold-primary" />
          <span className="text-[10px] font-semibold text-gold-primary uppercase tracking-widest">{t('homeComponents.economicEcosystem')}</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">{t('homeComponents.vendorMarketplacePartners')}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">{t('homeComponents.trustedProfessionals')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {segments.map((seg, i) => (
          <motion.div key={seg.titleKey} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} className="rounded-xl p-4 border border-border/60 bg-card hover:border-gold-primary/30 transition-all group cursor-pointer shadow-sm" onClick={() => navigate('/vendors')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/15 group-hover:bg-gold-primary/15 transition-colors"><seg.icon className="h-5 w-5 text-gold-primary" /></div>
              <div><h3 className="text-sm font-bold text-foreground">{t(`homeComponents.${seg.titleKey}`)}</h3><p className="text-[10px] text-muted-foreground">{t(`homeComponents.${seg.descKey}`)}</p></div>
            </div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <div><span className="text-muted-foreground">{t('homeComponents.projectsLabel')}</span><div className="font-bold text-foreground tabular-nums">{seg.projects}</div></div>
              <div className="text-right"><span className="text-muted-foreground">{t('homeComponents.valueLabel')}</span><div className="font-bold text-foreground">{seg.value}</div></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold-primary text-gold-primary" /><span className="text-xs font-bold text-foreground tabular-nums">{seg.rating}</span></div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-5">
        <Button variant="outline" onClick={() => navigate('/vendor/register')} className="gap-2 text-sm">{t('homeComponents.joinMarketplaceAsVendor')}<ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

export default VendorEcosystemHub;
