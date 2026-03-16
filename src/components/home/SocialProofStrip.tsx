import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, MapPin, TrendingUp, Lock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import verifiedShield from '@/assets/verified-shield.svg';
import { cn } from '@/lib/utils';

/** Animated counter that rolls up from 0 to target */
function AnimatedCounter({ target, suffix = '', duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target <= 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString()}{suffix}
    </span>
  );
}

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
    { icon: Building2, value: stats?.listings || 0, suffix: '+', label: 'Listings' },
    { icon: MapPin, value: stats?.cities || 0, suffix: '', label: 'Cities' },
    { icon: TrendingUp, value: stats?.newToday || 0, suffix: '', label: 'New Today' },
    { icon: BarChart3, value: 34, suffix: '', label: 'Provinces' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex items-center justify-center gap-3 sm:gap-5 py-3 sm:py-4 flex-wrap"
    >
      {/* Verified badge */}
      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
        <img src={verifiedShield} alt="" className="h-4 w-4" aria-hidden="true" />
        <span>Verified Platform</span>
      </div>

      <div className="h-4 w-px bg-border" />

      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm sm:text-base font-bold text-foreground">
            {stats ? (
              <AnimatedCounter target={item.value} suffix={item.suffix} />
            ) : '—'}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}

      <div className="h-4 w-px bg-border hidden sm:block" />

      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
        <Lock className="h-3.5 w-3.5 text-chart-1" />
        <span>Secure Inquiries</span>
      </div>
    </motion.div>
  );
}
