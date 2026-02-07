import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Star, 
  Check, 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  Home,
  MessageCircle,
  TrendingUp,
  ChevronLeft,
  Sparkles,
  Lock
} from 'lucide-react';
import { useUserMembership } from '@/hooks/useUserMembership';
import { useVIPLimits } from '@/hooks/useVIPLimits';
import { MEMBERSHIP_LEVELS, MembershipLevel, getMembershipConfig } from '@/types/membership';
import { cn } from '@/lib/utils';
import MembershipUpgradeFlow from '@/components/membership/MembershipUpgradeFlow';

const TIER_ORDER: MembershipLevel[] = ['basic', 'verified', 'vip', 'gold', 'platinum', 'diamond'];

const TIER_PRICING: Record<MembershipLevel, { monthly: number; yearly: number }> = {
  basic: { monthly: 0, yearly: 0 },
  verified: { monthly: 0, yearly: 0 },
  vip: { monthly: 99000, yearly: 990000 },
  gold: { monthly: 299000, yearly: 2990000 },
  platinum: { monthly: 599000, yearly: 5990000 },
  diamond: { monthly: 999000, yearly: 9990000 }
};

const formatIDR = (amount: number) => {
  if (amount === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { membershipLevel, isLoading } = useUserMembership();
  const { currentProperties, maxProperties, currentListings, maxListings, canFeatureListings, prioritySupport } = useVIPLimits();
  
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTargetTier, setSelectedTargetTier] = useState<MembershipLevel>('verified');
  
  const currentConfig = getMembershipConfig(membershipLevel);
  const currentTierIndex = TIER_ORDER.indexOf(membershipLevel);

  const handleUpgrade = (tier: MembershipLevel) => {
    setSelectedTargetTier(tier);
    setUpgradeDialogOpen(true);
  };

  const isCurrentTier = (tier: MembershipLevel) => tier === membershipLevel;
  const isTierLocked = (tier: MembershipLevel) => TIER_ORDER.indexOf(tier) <= currentTierIndex;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Slim Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h1 className="text-base font-semibold">Membership</h1>
              </div>
            </div>
            
            {/* Current Level Badge */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border",
              currentConfig.bgColor,
              currentConfig.borderColor
            )}>
              <span className="text-lg">{currentConfig.icon}</span>
              <span className={cn("text-xs font-medium", currentConfig.color)}>
                {currentConfig.shortLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 space-y-4">
        {/* Usage Stats - Compact Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Usage Overview</span>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Properties */}
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Home className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Properties</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-lg font-bold">{currentProperties}</span>
                  <span className="text-[10px] text-muted-foreground">
                    / {maxProperties === 999 ? '∞' : maxProperties}
                  </span>
                </div>
                <Progress 
                  value={maxProperties === 999 ? 10 : (currentProperties / maxProperties) * 100} 
                  className="h-1"
                />
              </CardContent>
            </Card>

            {/* Listings */}
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Listings</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-lg font-bold">{currentListings}</span>
                  <span className="text-[10px] text-muted-foreground">
                    / {maxListings === 999 ? '∞' : maxListings}
                  </span>
                </div>
                <Progress 
                  value={maxListings === 999 ? 10 : (currentListings / maxListings) * 100} 
                  className="h-1"
                />
              </CardContent>
            </Card>

            {/* Featured */}
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Star className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Featured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {canFeatureListings ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">
                      <Check className="h-2.5 w-2.5 mr-0.5" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      <Lock className="h-2.5 w-2.5 mr-0.5" />
                      Locked
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Priority</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {prioritySupport ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">
                      <Check className="h-2.5 w-2.5 mr-0.5" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      <Lock className="h-2.5 w-2.5 mr-0.5" />
                      Locked
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Membership Tiers - Slim Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Upgrade Tiers</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {TIER_ORDER.map((tier, index) => {
              const config = MEMBERSHIP_LEVELS[tier];
              const pricing = TIER_PRICING[tier];
              const isCurrent = isCurrentTier(tier);
              const isLocked = isTierLocked(tier);
              const isPopular = tier === 'gold';

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className={cn(
                    "relative overflow-hidden transition-all hover:shadow-md active:scale-[0.98]",
                    isCurrent && "ring-2 ring-primary",
                    isPopular && !isCurrent && "ring-1 ring-accent",
                  )}>
                    {/* Status Badge */}
                    {(isPopular && !isCurrent) && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-accent text-accent-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-bl">
                          ⭐
                        </div>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-bl">
                          ✓
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className={cn("p-2.5 text-center", config.bgColor)}>
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <h3 className={cn("text-xs font-semibold", config.color)}>
                        {config.shortLabel}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {pricing.monthly === 0 ? 'Gratis' : `${formatIDR(pricing.monthly).replace('Rp', 'Rp ')}/bln`}
                      </p>
                    </div>

                    {/* Benefits Preview */}
                    <CardContent className="p-2.5 pt-2">
                      <ul className="space-y-1 mb-2.5">
                        {config.benefits.slice(0, 3).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1 text-[10px] text-muted-foreground">
                            <Check className="h-2.5 w-2.5 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{benefit}</span>
                          </li>
                        ))}
                        {config.benefits.length > 3 && (
                          <li className="text-[9px] text-muted-foreground/70 pl-3.5">
                            +{config.benefits.length - 3} more
                          </li>
                        )}
                      </ul>

                      {/* Action */}
                      {isCurrent ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full h-7 text-[10px]" 
                          disabled
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Current
                        </Button>
                      ) : isLocked ? (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="w-full h-7 text-[10px]" 
                          disabled
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Unlocked
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          className="w-full h-7 text-[10px]"
                          onClick={() => handleUpgrade(tier)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Upgrade
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Help Banner - Slim */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Need help?</p>
                  <p className="text-[10px] text-muted-foreground">Contact our team for guidance</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] shrink-0"
                onClick={() => navigate('/contact')}
              >
                Contact
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upgrade Flow Dialog */}
      <MembershipUpgradeFlow
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentLevel={membershipLevel}
        targetLevel={selectedTargetTier}
      />
    </div>
  );
};

export default MembershipPage;
