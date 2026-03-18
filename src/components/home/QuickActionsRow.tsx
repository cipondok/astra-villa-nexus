import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, PieChart, Sparkles, Search, TrendingUp, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAction {
  icon: typeof Heart;
  label: string;
  path: string;
  color: string;
  bg: string;
  requireAuth?: boolean;
}

const actions: QuickAction[] = [
  { icon: Heart, label: 'Watchlist', path: '/saved', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', requireAuth: true },
  { icon: PieChart, label: 'Portfolio', path: '/portfolio-command-center', color: 'text-primary', bg: 'bg-primary/10 border-primary/20', requireAuth: true },
  { icon: Sparkles, label: 'AI Assistant', path: '/ai-search', color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/20' },
  { icon: TrendingUp, label: 'Deal Finder', path: '/deal-finder', color: 'text-chart-1', bg: 'bg-chart-1/10 border-chart-1/20' },
  { icon: Search, label: 'Advanced Search', path: '/advanced-search', color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/20' },
  { icon: Bell, label: 'Alerts', path: '/notifications', color: 'text-chart-3', bg: 'bg-chart-3/10 border-chart-3/20', requireAuth: true },
];

const QuickActionsRow = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-1">
      <div className="flex items-center gap-2 px-1 min-w-max">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            onClick={() => {
              if (action.requireAuth && !user) {
                navigate('/?auth=true');
                return;
              }
              navigate(action.path);
            }}
            className={cn(
              'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border',
              'transition-all duration-200 hover:scale-[1.04] active:scale-95',
              'min-w-[72px]',
              action.bg,
            )}
          >
            <action.icon className={cn('h-5 w-5', action.color)} />
            <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

QuickActionsRow.displayName = 'QuickActionsRow';
export default QuickActionsRow;
