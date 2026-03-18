import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Users, TrendingUp, Award } from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { icon: Building2, value: 12500, suffix: '+', label: 'Properties Listed' },
  { icon: Users, value: 45000, suffix: '+', label: 'Active Users' },
  { icon: TrendingUp, value: 98, suffix: '%', label: 'Satisfaction Rate' },
  { icon: Award, value: 1200, suffix: '+', label: 'Deals Closed' },
];

function CountUp({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  const format = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
    return n.toString();
  };

  return (
    <span className="tabular-nums font-bold text-2xl sm:text-3xl md:text-4xl text-foreground">
      {format(count)}{suffix}
    </span>
  );
}

export default function AnimatedStatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="w-full py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 mb-1">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <CountUp target={stat.value} suffix={stat.suffix} inView={inView} />
              <span className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
