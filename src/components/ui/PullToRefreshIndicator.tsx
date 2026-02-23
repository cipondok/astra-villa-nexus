import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  indicatorOpacity: number;
  indicatorRotation: number;
  threshold: number;
}

const PullToRefreshIndicator = ({
  isPulling,
  isRefreshing,
  pullDistance,
  indicatorOpacity,
  indicatorRotation,
  threshold,
}: PullToRefreshIndicatorProps) => {
  return (
    <AnimatePresence>
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{
            opacity: isRefreshing ? 1 : indicatorOpacity,
            y: isRefreshing ? 0 : Math.min(pullDistance - 40, 0),
          }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
        >
          <motion.div
            animate={{
              rotate: isRefreshing ? 360 : indicatorRotation,
            }}
            transition={{
              duration: isRefreshing ? 1 : 0,
              repeat: isRefreshing ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <RefreshCw className="h-3 w-3" />
          </motion.div>
          <span className="text-xs font-medium">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= threshold
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PullToRefreshIndicator;
