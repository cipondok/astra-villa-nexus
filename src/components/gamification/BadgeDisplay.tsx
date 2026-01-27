import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Sparkles } from 'lucide-react';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGamification, Badge } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  variant?: 'grid' | 'inline' | 'showcase';
  category?: 'all' | 'universal' | 'agent' | 'homeowner' | 'searcher';
  maxDisplay?: number;
  showLocked?: boolean;
  className?: string;
}

const BadgeDisplay = ({
  variant = 'inline',
  category = 'all',
  maxDisplay = 5,
  showLocked = false,
  className
}: BadgeDisplayProps) => {
  const { allBadges, userBadges, hasBadge, stats } = useGamification();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Filter badges by category
  const filteredBadges = allBadges?.filter(badge => {
    if (category === 'all') return true;
    return badge.category === category || badge.category === 'universal';
  }) || [];

  // Get earned badges
  const earnedBadges = filteredBadges.filter(badge => hasBadge(badge.badge_key));
  const lockedBadges = filteredBadges.filter(badge => !hasBadge(badge.badge_key));

  const displayBadges = showLocked 
    ? [...earnedBadges, ...lockedBadges].slice(0, maxDisplay)
    : earnedBadges.slice(0, maxDisplay);

  const remainingCount = earnedBadges.length - maxDisplay;

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1 flex-wrap", className)}>
          {displayBadges.map((badge, index) => {
            const isEarned = hasBadge(badge.badge_key);
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedBadge(badge)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all",
                      isEarned 
                        ? "bg-primary/10 hover:bg-primary/20 cursor-pointer"
                        : "bg-muted/50 opacity-40 grayscale"
                    )}
                  >
                    {badge.icon}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-semibold">{badge.name}</div>
                  <div className="text-muted-foreground">{badge.description}</div>
                  {!isEarned && <div className="text-orange-500 mt-1">🔒 Not earned yet</div>}
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {remainingCount > 0 && (
            <button
              onClick={() => setShowAllBadges(true)}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:bg-muted/80"
            >
              +{remainingCount}
            </button>
          )}
        </div>

        {/* Badge Detail Dialog */}
        <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
          <DialogContent className="max-w-sm">
            {selectedBadge && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl mb-4"
                >
                  {selectedBadge.icon}
                </motion.div>
                <h3 className="text-lg font-bold">{selectedBadge.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedBadge.description}</p>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                  {hasBadge(selectedBadge.badge_key) ? (
                    <BadgeUI className="bg-green-500/10 text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Earned
                    </BadgeUI>
                  ) : (
                    <BadgeUI variant="outline" className="text-muted-foreground">
                      <Lock className="h-3 w-3 mr-1" /> Locked
                    </BadgeUI>
                  )}
                  
                  {selectedBadge.xp_reward > 0 && (
                    <BadgeUI className="bg-primary/10 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" /> +{selectedBadge.xp_reward} XP
                    </BadgeUI>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* All Badges Dialog */}
        <Dialog open={showAllBadges} onOpenChange={setShowAllBadges}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🏆 Your Badges
                <BadgeUI variant="secondary">{earnedBadges.length}/{filteredBadges.length}</BadgeUI>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="earned">
              <TabsList className="w-full">
                <TabsTrigger value="earned" className="flex-1">Earned ({earnedBadges.length})</TabsTrigger>
                <TabsTrigger value="locked" className="flex-1">Locked ({lockedBadges.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="earned" className="mt-4">
                <div className="grid grid-cols-4 gap-3">
                  {earnedBadges.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => { setShowAllBadges(false); setSelectedBadge(badge); }}
                      className="p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-center"
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-[10px] font-medium truncate">{badge.name}</div>
                    </button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="locked" className="mt-4">
                <div className="grid grid-cols-4 gap-3">
                  {lockedBadges.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => { setShowAllBadges(false); setSelectedBadge(badge); }}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center opacity-60 grayscale"
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-[10px] font-medium truncate">{badge.name}</div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    );
  }

  // Grid variant for profile pages
  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-5 gap-3", className)}>
        {filteredBadges.map(badge => {
          const isEarned = hasBadge(badge.badge_key);
          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedBadge(badge)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all p-2",
                      isEarned 
                        ? "bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20"
                        : "bg-muted/30 opacity-40 grayscale"
                    )}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-[9px] font-medium text-center leading-tight truncate w-full">
                      {badge.name}
                    </span>
                    {!isEarned && <Lock className="h-3 w-3 absolute top-1 right-1 text-muted-foreground" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{badge.description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  // Showcase variant for achievements section
  return (
    <div className={cn("space-y-3", className)}>
      {earnedBadges.slice(0, 3).map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            {badge.icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{badge.name}</div>
            <div className="text-xs text-muted-foreground">{badge.description}</div>
          </div>
          <BadgeUI className="bg-primary/10 text-primary text-[10px]">
            +{badge.xp_reward} XP
          </BadgeUI>
        </motion.div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
