import { motion } from 'framer-motion';
import { Wrench, Scale, PaintBucket, FileCheck, ShieldCheck, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const services = [
  { icon: Wrench, title: 'Property Repair', desc: 'Certified technicians for plumbing, electrical, and general maintenance.' },
  { icon: PaintBucket, title: 'Renovation', desc: 'Full interior & exterior renovation with project management included.' },
  { icon: Scale, title: 'Legal Services', desc: 'Property law, ownership transfer, and contract review by licensed attorneys.' },
  { icon: FileCheck, title: 'Document Verification', desc: 'AI-assisted authenticity checks on certificates, permits, and legal docs.' },
  { icon: ShieldCheck, title: 'Property Insurance', desc: 'Comprehensive coverage options from trusted Indonesian insurers.' },
  { icon: Hammer, title: 'Construction', desc: 'New build management from architectural design through completion.' },
];

const LandingServices = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-astra-navy to-astra-navy-dark">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="font-inter text-xs uppercase tracking-[0.2em] text-gold-primary mb-4 block">
            Service Marketplace
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-titanium-white mb-4">
            Everything Your Property Needs
          </h2>
          <p className="font-inter text-text-muted max-w-lg mx-auto">
            Vetted service providers for every stage of property ownership and investment.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-5 rounded-2xl border border-border/15 bg-card/5 hover:border-gold-primary/25 transition-all duration-300 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center mb-3 group-hover:bg-gold-primary/20 transition-colors">
                <s.icon className="w-5 h-5 text-gold-primary" />
              </div>
              <h3 className="font-inter text-sm font-semibold text-titanium-white mb-1">{s.title}</h3>
              <p className="font-inter text-[11px] text-text-muted leading-relaxed hidden md:block">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
            className="border-gold-primary/30 text-gold-primary hover:bg-gold-primary/10 rounded-xl"
          >
            Explore All Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingServices;
