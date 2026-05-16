import { Users, Shield, Home, ThumbsUp, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AgentStats {
  totalAgents: number;
  verifiedAgents: number;
  propertiesSold: number;
  satisfactionRate: number;
}

interface AgentHeroBannerProps {
  stats?: AgentStats;
}

const AgentHeroBanner = ({ stats }: AgentHeroBannerProps) => {
  const statItems = [
    { icon: Users, value: stats?.totalAgents || 0, label: 'Total Agen', suffix: '+' },
    { icon: Shield, value: stats?.verifiedAgents || 0, label: 'Terverifikasi', suffix: '' },
    { icon: Home, value: stats?.propertiesSold || 0, label: 'Terjual', suffix: '+' },
    { icon: ThumbsUp, value: stats?.satisfactionRate || 0, label: 'Kepuasan', suffix: '%' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-gold-primary/5">
      {/* Gold glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gold-primary/5 rounded-full blur-[100px]" />
      
      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
        <div className="absolute top-40 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-14 sm:py-20 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gold-primary/15 flex items-center justify-center">
                <Search className="h-4 w-4 text-gold-primary" />
              </div>
              <span className="text-sm font-medium text-gold-primary tracking-wide uppercase">Find Your Agent</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Cari Agen Properti{' '}
              <span className="text-gold-primary">Terpercaya</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl">
              Temukan agen properti berpengalaman dan terverifikasi untuk membantu Anda menemukan properti impian
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className={cn(
                  "backdrop-blur-sm rounded-xl p-4 text-center border transition-all duration-300",
                  "bg-card/60 border-gold-primary/10 hover:border-gold-primary/30 hover:shadow-md hover:shadow-gold-primary/5"
                )}
              >
                <div className="w-9 h-9 mx-auto mb-2 rounded-lg bg-gold-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-gold-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {item.value.toLocaleString()}{item.suffix}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHeroBanner;
