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
  Lock,
  BarChart3,
  Building2,
  Gem
} from 'lucide-react';
import { useUserMembership } from '@/hooks/useUserMembership';
import { useVIPLimits } from '@/hooks/useVIPLimits';
import { MEMBERSHIP_LEVELS, MembershipLevel, getMembershipConfig } from '@/types/membership';
import { cn } from '@/lib/utils';
import MembershipUpgradeFlow from '@/components/membership/MembershipUpgradeFlow';

const TIER_ORDER: MembershipLevel[] = ['free', 'pro_agent', 'developer', 'vip_investor'];

const TIER_ICONS: Record<MembershipLevel, React.ReactNode> = {
  free: <Shield className="h-5 w-5" />,
  pro_agent: <Star className="h-5 w-5" />,
  developer: <Building2 className="h-5 w-5" />,
  vip_investor: <Gem className="h-5 w-5" />,
};

import { getCurrencyFormatter } from '@/stores/currencyStore';
const formatIDR = (amount: number) => {
  if (amount === 0) return 'Gratis';
  return getCurrencyFormatter()(amount);
};

// Feature comparison data
const COMPARISON_FEATURES = [
  { name: 'Listing Exposure', free: '1x', pro_agent: '2x', developer: '5x', vip_investor: '10x' },
  { name: 'Max Images', free: '5', pro_agent: '10', developer: '30', vip_investor: 'Unlimited' },
  { name: 'Priority Placement', free: false, pro_agent: true, developer: true, vip_investor: true },
  { name: 'Agent Badge', free: false, pro_agent: true, developer: true, vip_investor: true },
  { name: 'SEO Tools', free: false, pro_agent: true, developer: true, vip_investor: true },
  { name: 'AI Analytics', free: false, pro_agent: false, developer: true, vip_investor: true },
  { name: 'Virtual Tour / 3D', free: false, pro_agent: false, developer: true, vip_investor: true },
  { name: 'Featured Badge', free: false, pro_agent: false, developer: true, vip_investor: true },
  { name: 'Homepage Spotlight', free: false, pro_agent: false, developer: false, vip_investor: true },
  { name: '3D Featured Badge', free: false, pro_agent: false, developer: false, vip_investor: true },
  { name: 'Personal Concierge', free: false, pro_agent: false, developer: false, vip_investor: true },
  { name: 'Priority Support', free: false, pro_agent: true, developer: true, vip_investor: true },
];

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { membershipLevel, isLoading } = useUserMembership();
  const { currentProperties, maxProperties, currentListings, maxListings, canFeatureListings, prioritySupport } = useVIPLimits();
  
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTargetTier, setSelectedTargetTier] = useState<MembershipLevel>('pro_agent');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
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
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h1 className="text-base font-semibold">Premium Membership</h1>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border",
              currentConfig.bgColor, currentConfig.borderColor
            )}>
              <span className="text-lg">{currentConfig.icon}</span>
              <span className={cn("text-xs font-medium", currentConfig.color)}>{currentConfig.shortLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 space-y-5">
        {/* Usage Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Usage Overview</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Home className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Properties</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-lg font-bold">{currentProperties}</span>
                  <span className="text-[10px] text-muted-foreground">/ {maxProperties === 999 ? '∞' : maxProperties}</span>
                </div>
                <Progress value={maxProperties === 999 ? 10 : (currentProperties / maxProperties) * 100} className="h-1" />
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Listings</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-lg font-bold">{currentListings}</span>
                  <span className="text-[10px] text-muted-foreground">/ {maxListings === 999 ? '∞' : maxListings}</span>
                </div>
                <Progress value={maxListings === 999 ? 10 : (currentListings / maxListings) * 100} className="h-1" />
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Star className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Featured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {canFeatureListings ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5"><Check className="h-2.5 w-2.5 mr-0.5" />Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5"><Lock className="h-2.5 w-2.5 mr-0.5" />Locked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Priority</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {prioritySupport ? (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5"><Check className="h-2.5 w-2.5 mr-0.5" />Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5"><Lock className="h-2.5 w-2.5 mr-0.5" />Locked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-center gap-2">
            <span className={cn("text-xs font-medium", billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>Monthly</span>
            <button
              onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                billingCycle === 'yearly' ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform",
                billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </button>
            <span className={cn("text-xs font-medium", billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground')}>
              Yearly
            </span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
              Save 17%
            </Badge>
          </div>
        </motion.div>

        {/* Tier Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Choose Your Plan</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {TIER_ORDER.map((tier, index) => {
              const config = MEMBERSHIP_LEVELS[tier];
              const isCurrent = isCurrentTier(tier);
              const isLocked = isTierLocked(tier);
              const isPopular = tier === 'developer';
              const price = billingCycle === 'monthly' ? config.monthlyPrice : config.yearlyPrice;

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
                    {isPopular && !isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-accent text-accent-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-bl">
                          Popular
                        </div>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-bl">✓</div>
                      </div>
                    )}

                    <div className={cn("p-2.5 text-center", config.bgColor)}>
                      <div className="text-2xl mb-1">{config.icon}</div>
                      <h3 className={cn("text-xs font-semibold", config.color)}>{config.shortLabel}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {price === 0 ? 'Gratis' : `${formatIDR(price)}/${billingCycle === 'monthly' ? 'bln' : 'thn'}`}
                      </p>
                    </div>

                    <CardContent className="p-2.5 pt-2">
                      <ul className="space-y-1 mb-2.5">
                        {config.benefits.slice(0, 4).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1 text-[10px] text-muted-foreground">
                            <Check className="h-2.5 w-2.5 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{benefit}</span>
                          </li>
                        ))}
                        {config.benefits.length > 4 && (
                          <li className="text-[9px] text-muted-foreground/70 pl-3.5">
                            +{config.benefits.length - 4} more
                          </li>
                        )}
                      </ul>

                      {isCurrent ? (
                        <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" disabled>
                          <Shield className="h-3 w-3 mr-1" /> Current
                        </Button>
                      ) : isLocked ? (
                        <Button size="sm" variant="secondary" className="w-full h-7 text-[10px]" disabled>
                          <Check className="h-3 w-3 mr-1" /> Unlocked
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full h-7 text-[10px]" onClick={() => handleUpgrade(tier)}>
                          <Zap className="h-3 w-3 mr-1" /> Upgrade <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Feature Comparison</span>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-2 font-medium text-muted-foreground">Feature</th>
                      {TIER_ORDER.map(tier => {
                        const config = MEMBERSHIP_LEVELS[tier];
                        return (
                          <th key={tier} className={cn("p-2 text-center font-semibold", config.color)}>
                            <div className="flex flex-col items-center gap-0.5">
                              <span>{config.icon}</span>
                              <span>{config.shortLabel}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((feature, i) => (
                      <tr key={feature.name} className={cn("border-b last:border-0", i % 2 === 0 && "bg-muted/10")}>
                        <td className="p-2 font-medium">{feature.name}</td>
                        {TIER_ORDER.map(tier => {
                          const value = feature[tier];
                          return (
                            <td key={tier} className="p-2 text-center">
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <Check className="h-3 w-3 text-primary mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground/40">—</span>
                                )
                              ) : (
                                <span className="font-medium">{value}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recurring Income Note */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Recurring Income Model</p>
                <p className="text-[10px] text-muted-foreground">All premium plans renew automatically. Cancel anytime.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-muted/30">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Need help?</p>
                  <p className="text-[10px] text-muted-foreground">Contact our team for guidance</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[10px] shrink-0" onClick={() => navigate('/contact')}>
                Contact
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
