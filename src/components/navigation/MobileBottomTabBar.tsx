import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Heart, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/haptics';

const tabs = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'search', icon: Search, label: 'Search', path: '/search' },
  { id: 'post', icon: Plus, label: 'Post', path: '/post-property', accent: true },
  { id: 'saved', icon: Heart, label: 'Saved', path: '/saved' },
  { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
];

export default function MobileBottomTabBar() {
  const { isMobile } = useIsMobile();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isMobile) return null;

  // Hide on admin routes
  if (pathname.startsWith('/admin')) return null;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleTap = (path: string) => {
    haptic('light');
    if ((path === '/saved' || path === '/profile') && !user) {
      // Trigger login for auth-required tabs
      const event = new CustomEvent('openLogin');
      window.dispatchEvent(event);
      return;
    }
    navigate(path);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9990] md:hidden",
        "bg-card/95 backdrop-blur-xl border-t border-border/40",
        "shadow-[0_-2px_12px_hsl(var(--foreground)/0.04)]"
      )}
      style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => handleTap(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1",
                "min-h-[56px] py-1.5 rounded-lg transition-colors duration-150",
                "active:scale-95 active:bg-muted/40",
                tab.accent && !active && "text-primary",
                active ? "text-primary" : !tab.accent && "text-muted-foreground",
              )}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              {tab.accent ? (
                <div className={cn(
                  "w-10 h-7 rounded-full flex items-center justify-center",
                  "bg-primary text-primary-foreground shadow-sm"
                )}>
                  <tab.icon className="h-4 w-4" />
                </div>
              ) : (
                <tab.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]")} />
              )}
              <span className={cn(
                "text-[9px] font-medium leading-none",
                active && "font-semibold"
              )}>
                {tab.label}
              </span>
              {active && !tab.accent && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
