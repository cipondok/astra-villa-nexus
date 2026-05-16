import { motion } from 'framer-motion';
import { Brain, Globe, Zap, Shield, Cpu, BarChart3, Network, Layers } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const TechnologyAuthorityStrip = () => {
  const { t } = useTranslation();

  const techModules = [
    { icon: Brain, title: t('homeComponents.autonomousDealMatching'), desc: t('homeComponents.autonomousDealMatchingDesc') },
    { icon: Cpu, title: t('homeComponents.predictiveValuation'), desc: t('homeComponents.predictiveValuationDesc') },
    { icon: Globe, title: t('homeComponents.globalDemandNetwork'), desc: t('homeComponents.globalDemandNetworkDesc') },
    { icon: Network, title: t('homeComponents.behavioralBuyerIntel'), desc: t('homeComponents.behavioralBuyerIntelDesc') },
  ];

  const scrollTech = [
    { icon: Brain, label: t('homeComponents.aiValuationEngine') },
    { icon: Globe, label: t('homeComponents.globalDemandHeatmap') },
    { icon: Zap, label: t('homeComponents.autonomousDealMatching') },
    { icon: Shield, label: t('homeComponents.smartContractReady') },
    { icon: Cpu, label: t('homeComponents.predictiveAnalytics') },
    { icon: BarChart3, label: t('homeComponents.marketIntelligenceAPI') },
    { icon: Layers, label: t('homeComponents.tokenizationPipeline') },
    { icon: Network, label: t('homeComponents.neuralNetworkScoring') },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="bg-secondary/50 py-10 sm:py-14 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-intel-blue/[0.03] rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-intel-blue/15 bg-intel-blue/5 mb-3">
              <Cpu className="h-3 w-3 text-intel-blue" />
              <span className="text-[10px] font-semibold text-intel-blue uppercase tracking-widest">{t('homeComponents.intelligenceLayer')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('homeComponents.astraIntelligencePowering')}{' '}
              <span className="bg-gradient-to-r from-intel-blue to-intel-purple bg-clip-text text-transparent">{t('homeComponents.futureRealEstateMarkets')}</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t('homeComponents.autonomousSystems')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techModules.map((mod, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-5 rounded-xl border border-border/60 bg-card hover:border-intel-blue/30 transition-all group shadow-sm">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-intel-blue/10 border border-intel-blue/15 mb-4 group-hover:bg-intel-blue/15 transition-colors">
                  <mod.icon className="h-5 w-5 text-intel-blue" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{mod.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-muted/50 border-y border-border/40 py-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/50 to-transparent z-10" />
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}>
          {[...scrollTech, ...scrollTech].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/5 border border-border/40">
                <item.icon className="h-3 w-3 text-gold-primary" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TechnologyAuthorityStrip;
