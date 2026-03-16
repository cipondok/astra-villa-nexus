import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, MapPin, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import verifiedShield from '@/assets/verified-shield.svg';

export default function SocialProofStrip() {
  const { data: stats } = useQuery({
    queryKey: ['homepage-social-proof'],
    queryFn: async () => {
      const [
        { count: totalListings },
        { data: cityData },
        { count: newToday },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('properties').select('city').eq('status', 'active').not('city', 'is', null),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active')
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ]);

      const uniqueCities = new Set((cityData || []).map(c => c.city)).size;

      return {
        listings: totalListings || 0,
        cities: uniqueCities,
        newToday: newToday || 0,
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  const items = [
    { icon: Building2, value: stats ? `${stats.listings.toLocaleString()}+` : '—', label: 'Active Listings' },
    { icon: MapPin, value: stats ? `${stats.cities}` : '—', label: 'Cities' },
    { icon: TrendingUp, value: stats ? `${stats.newToday}` : '—', label: 'New Today' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex items-center justify-center gap-4 sm:gap-8 py-3 sm:py-4"
    >
      {/* Verified badge */}
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
        <img src={verifiedShield} alt="" className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Verified Platform</span>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.icon className="h-3.5 w-3.5 text-gold-primary" />
          <span className="text-sm sm:text-base font-bold text-foreground">{item.value}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}
