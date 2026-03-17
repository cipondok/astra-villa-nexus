import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: BarChart3,
    title: 'Pre-Launch Demand Analytics',
    desc: 'Validate your project with real investor demand data before breaking ground.',
  },
  {
    icon: Users,
    title: 'Direct Investor Distribution',
    desc: 'Reach thousands of qualified investors looking for new development opportunities.',
  },
  {
    icon: Zap,
    title: 'JV Partnership Matching',
    desc: 'AI-matched joint venture opportunities based on project type, location, and ROI profile.',
  },
];

const LandingDeveloper = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-32 bg-astra-navy-dark overflow-hidden">
      {/* Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left - content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-inter text-xs uppercase tracking-[0.2em] text-gold-primary mb-4 block">
              For Developers
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-titanium-white mb-6 leading-tight">
              Launch Projects with
              <br />
              <span className="text-gold-primary">Intelligence Advantage</span>
            </h2>
            <p className="font-inter text-text-muted mb-8 leading-relaxed">
              Partner with ASTRA to access demand analytics, pre-qualified investor networks,
              and AI-powered market timing for your next development project.
            </p>

            <div className="space-y-5 mb-8">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold-primary/10 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-gold-primary" />
                  </div>
                  <div>
                    <h4 className="font-inter text-sm font-semibold text-titanium-white">{f.title}</h4>
                    <p className="font-inter text-xs text-text-muted mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate('/partners/become-partner')}
              className="bg-gradient-to-r from-gold-primary to-astra-gold-muted text-astra-navy-dark font-semibold px-6 rounded-xl"
            >
              Become a Partner <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Right - visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden border border-border/15">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                alt="Modern development project"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-astra-navy-dark/60 to-transparent rounded-2xl" />
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -left-4 md:-left-8 bg-card/95 border border-gold-primary/20 rounded-xl p-4 shadow-xl"
            >
              <div className="text-xs text-text-muted font-inter mb-1">Avg. Pre-Launch ROI</div>
              <div className="font-playfair text-2xl font-bold text-intel-success">+24.5%</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingDeveloper;
