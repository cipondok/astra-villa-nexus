import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BadgeCheck, Building2, Users, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Recent listing activity ticker */
function ActivityTicker() {
  const { data: recentListings } = useQuery({
    queryKey: ['recent-listing-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('title, city, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!recentListings?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentListings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [recentListings?.length]);

  if (!recentListings?.length) return null;

  const current = recentListings[currentIndex];
  const timeAgo = getTimeAgo(current.created_at);

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 border border-border/40"
    >
      <Activity className="h-3 w-3 text-chart-1 shrink-0" />
      <span className="text-[11px] text-muted-foreground truncate">
        <span className="font-semibold text-foreground">{current.title?.slice(0, 30)}</span>
        {' '}listed in {current.city} • {timeAgo}
      </span>
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const InvestorCredibilityShowcase = () => {
  const { data: agentCount } = useQuery({
    queryKey: ['verified-agent-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent');
      return count || 0;
    },
    staleTime: 15 * 60 * 1000,
  });

  const credibilityItems = [
    { icon: BadgeCheck, value: `${agentCount || 0}+`, label: 'Verified Agents' },
    { icon: Building2, value: '50+', label: 'Developer Partners' },
    { icon: Users, value: '15+', label: 'Cities Covered' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-foreground mb-1">
          Trusted Supply Network
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Verified agents and premium developers across Indonesia
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-5">
        {credibilityItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border border-border/40 bg-card/50"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 mb-2">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">{item.value}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Live activity ticker */}
      <ActivityTicker />
    </div>
  );
};

export default InvestorCredibilityShowcase;
