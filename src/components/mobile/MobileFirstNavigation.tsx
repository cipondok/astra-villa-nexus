import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Search, Heart, User, Menu, 
  Building2, MessageCircle, Bell, Plus,
  MapPin, Calculator, Wallet, Settings,
  X, ChevronUp, Camera, Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

/**
 * Thumb-Zone Optimized Mobile Navigation
 * - Primary actions in bottom thumb zone (bottom 1/3 of screen)
 * - Secondary actions accessible via expandable menu
 * - Maximum 2 taps to reach any primary feature
 */

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const MobileFirstNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Primary navigation - always visible in thumb zone
  const primaryNav: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Heart, label: 'Saved', path: '/saved' },
    { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: user ? '/profile' : '/auth' },
  ];

  // Quick actions - 1 tap from FAB
  const quickActions = [
    { icon: Plus, label: 'List Property', path: '/add-property', color: 'bg-primary' },
    { icon: Camera, label: 'AR Preview', path: '/mobile/ar-preview', color: 'bg-accent' },
    { icon: MessageCircle, label: 'Community', path: '/mobile/community', color: 'bg-secondary' },
    { icon: Gavel, label: 'Auctions', path: '/mobile/auctions', color: 'bg-muted-foreground' },
  ];

  // Secondary navigation - accessible via menu expansion
  const secondaryNav: NavItem[] = [
    { icon: Building2, label: 'Buy', path: '/dijual' },
    { icon: Building2, label: 'Rent', path: '/disewa' },
    { icon: Wallet, label: 'Tokens', path: '/astra-tokens' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsExpanded(false);
    setShowQuickActions(false);
  }, [navigate]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Backdrop for expanded states */}
      <AnimatePresence>
        {(isExpanded || showQuickActions) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => {
              setIsExpanded(false);
              setShowQuickActions(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Quick Actions FAB Menu */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex gap-3 p-3 bg-primary-foreground/5 backdrop-blur-2xl rounded-2xl shadow-xl border border-gold-primary/15">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                  onClick={() => handleNavigation(action.path)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl",
                    "active:scale-95 transition-all duration-200",
                    action.color
                  )}
                >
                  <action.icon className="h-5 w-5 text-white" />
                  <span className="text-[10px] font-medium text-white whitespace-nowrap">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Nav Panel (slides up) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 bg-primary-foreground/5 backdrop-blur-2xl border-t border-gold-primary/15 rounded-t-2xl shadow-xl"
          >
            <div className="flex justify-center pt-2.5 pb-1.5">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
            </div>
            
            <div className="px-4 pb-5 grid grid-cols-4 gap-3">
              {secondaryNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl",
                    "active:scale-95 transition-all duration-200",
                    isActive(item.path) 
                      ? "bg-gold-primary/10 text-gold-primary" 
                      : "text-muted-foreground hover:bg-gold-primary/5"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-primary-foreground/5 backdrop-blur-2xl border-t border-gold-primary/15"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      >
        <div className="flex items-center justify-around px-1 h-16 min-h-[64px]">
          {primaryNav.slice(0, 2).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            />
          ))}

          {/* Center FAB Button */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            aria-label="Quick actions"
            className={cn(
              "relative -mt-5 flex items-center justify-center",
              "w-13 h-13 rounded-full flex-shrink-0",
              "bg-gradient-to-r from-gold-primary to-gold-primary/80 shadow-md shadow-gold-primary/25",
              "active:scale-95 transition-all duration-200",
              showQuickActions && "rotate-45"
            )}
          >
            <Plus className="h-6 w-6 text-background" />
          </button>

          {primaryNav.slice(2, 4).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            />
          ))}

          {/* Menu expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="More navigation options"
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-1 min-w-[44px] min-h-[44px] flex-1",
              "active:scale-95 transition-all duration-200",
              isExpanded ? "text-gold-primary" : "text-muted-foreground"
            )}
          >
            <ChevronUp className={cn(
              "h-5 w-5 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

// Individual nav button component
const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={item.label}
    className={cn(
      "relative flex flex-col items-center gap-0.5 py-2 px-1 min-w-[44px] min-h-[44px] flex-1",
      "active:scale-95 transition-all duration-200",
      isActive ? "text-gold-primary" : "text-muted-foreground"
    )}
  >
    <div className="relative">
      <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
      {item.badge && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </div>
    <span className={cn(
      "text-[10px] font-medium",
      isActive && "font-semibold"
    )}>
      {item.label}
    </span>
    {isActive && (
      <motion.div
        layoutId="activeNavIndicator"
        className="absolute -bottom-1 w-4 h-1 rounded-full bg-gold-primary"
      />
    )}
  </button>
);

export default MobileFirstNavigation;
