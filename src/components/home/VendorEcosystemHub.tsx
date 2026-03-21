import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Building2, Palette, Wifi, Scale, Star, ArrowRight } from 'lucide-react';

const segments = [
  {
    icon: Building2,
    title: 'Developers',
    desc: 'Premier property development partners',
    projects: 24,
    value: 'Rp 2.1T',
    rating: 4.8,
  },
  {
    icon: Palette,
    title: 'Interior Designers',
    desc: 'Luxury staging & renovation specialists',
    projects: 156,
    value: 'Rp 45M avg',
    rating: 4.7,
  },
  {
    icon: Wifi,
    title: 'Smart Home',
    desc: 'IoT installation & automation experts',
    projects: 89,
    value: 'Rp 28M avg',
    rating: 4.6,
  },
  {
    icon: Scale,
    title: 'Legal & Finance',
    desc: 'Notary, tax advisory & mortgage partners',
    projects: 312,
    value: 'Rp 15M avg',
    rating: 4.9,
  },
];

const VendorEcosystemHub = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <div className="text-center mb-6">
        <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">
          Vendor Ecosystem
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Trusted professionals powering every property transaction
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-effect rounded-xl p-4 border border-border/40 hover:border-gold-primary/30 transition-all group cursor-pointer"
            onClick={() => navigate('/vendors')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/20 group-hover:bg-gold-primary/20 transition-colors">
                <seg.icon className="h-5 w-5 text-gold-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{seg.title}</h3>
                <p className="text-[10px] text-muted-foreground">{seg.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 text-xs">
              <div>
                <span className="text-muted-foreground">Completed</span>
                <div className="font-bold text-foreground">{seg.projects} projects</div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Avg Value</span>
                <div className="font-bold text-foreground">{seg.value}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-gold-primary text-gold-primary" />
                <span className="text-xs font-semibold text-foreground">{seg.rating}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-5">
        <Button variant="outline" onClick={() => navigate('/vendor/register')} className="gap-2 text-sm">
          Join Marketplace as Vendor
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VendorEcosystemHub;
