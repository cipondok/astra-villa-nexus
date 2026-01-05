import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Award,
  ChevronLeft
} from 'lucide-react';
import { useUserMembership } from '@/hooks/useUserMembership';
import { useVIPLimits } from '@/hooks/useVIPLimits';
import { MEMBERSHIP_LEVELS, MembershipLevel, getMembershipConfig } from '@/types/membership';
import { cn } from '@/lib/utils';

// Define tier order for comparison
const TIER_ORDER: MembershipLevel[] = ['basic', 'verified', 'vip', 'gold', 'platinum', 'diamond'];

// Pricing (placeholder - in real app this would come from backend)
const TIER_PRICING: Record<MembershipLevel, { monthly: number; yearly: number }> = {
  basic: { monthly: 0, yearly: 0 },
  verified: { monthly: 0, yearly: 0 },
  vip: { monthly: 99000, yearly: 990000 },
  gold: { monthly: 299000, yearly: 2990000 },
  platinum: { monthly: 599000, yearly: 5990000 },
  diamond: { monthly: 999000, yearly: 9990000 }
};

// Format IDR currency
const formatIDR = (amount: number) => {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { membershipLevel, verificationStatus, userLevelName, isLoading } = useUserMembership();
  const { currentProperties, maxProperties, currentListings, maxListings, canFeatureListings, prioritySupport } = useVIPLimits();
  
  const currentConfig = getMembershipConfig(membershipLevel);
  const currentTierIndex = TIER_ORDER.indexOf(membershipLevel);

  const handleUpgrade = (tier: MembershipLevel) => {
    // In a real app, this would navigate to a payment page or open a payment modal
    console.log(`Upgrading to ${tier}`);
    // For now, show a toast or navigate to contact
    navigate('/contact?subject=membership-upgrade&tier=' + tier);
  };

  const isCurrentTier = (tier: MembershipLevel) => tier === membershipLevel;
  const isTierLocked = (tier: MembershipLevel) => TIER_ORDER.indexOf(tier) <= currentTierIndex;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading membership info...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Crown className="h-8 w-8 text-primary" />
                Membership
              </h1>
              <p className="text-muted-foreground mt-1">
                Unlock premium features and exclusive benefits
              </p>
            </div>
            
            {/* Current Status */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                    currentConfig.bgColor,
                    currentConfig.borderColor,
                    "border-2"
                  )}>
                    {currentConfig.icon}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Level</p>
                    <p className={cn("font-bold text-lg", currentConfig.color)}>
                      {currentConfig.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Properties */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      Properties
                    </span>
                    <span className="text-sm font-medium">
                      {currentProperties}/{maxProperties === 999 ? '∞' : maxProperties}
                    </span>
                  </div>
                  <Progress 
                    value={maxProperties === 999 ? 10 : (currentProperties / maxProperties) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Listings */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Active Listings
                    </span>
                    <span className="text-sm font-medium">
                      {currentListings}/{maxListings === 999 ? '∞' : maxListings}
                    </span>
                  </div>
                  <Progress 
                    value={maxListings === 999 ? 10 : (currentListings / maxListings) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Featured Listings */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Featured Listings
                    </span>
                    <Badge variant={canFeatureListings ? "default" : "secondary"}>
                      {canFeatureListings ? 'Enabled' : 'Locked'}
                    </Badge>
                  </div>
                </div>

                {/* Priority Support */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Priority Support
                    </span>
                    <Badge variant={prioritySupport ? "default" : "secondary"}>
                      {prioritySupport ? 'Enabled' : 'Locked'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Membership Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Membership Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIER_ORDER.map((tier, index) => {
              const config = MEMBERSHIP_LEVELS[tier];
              const pricing = TIER_PRICING[tier];
              const isCurrent = isCurrentTier(tier);
              const isLocked = isTierLocked(tier);
              const isPopular = tier === 'gold';

              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    isCurrent && "ring-2 ring-primary",
                    isPopular && !isCurrent && "ring-2 ring-yellow-400",
                    config.glowColor
                  )}>
                    {/* Popular Badge */}
                    {isPopular && !isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                          POPULAR
                        </div>
                      </div>
                    )}

                    {/* Current Badge */}
                    {isCurrent && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                          CURRENT
                        </div>
                      </div>
                    )}

                    <CardHeader className={cn("pb-4", config.bgColor)}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2",
                          config.borderColor,
                          "bg-background/50"
                        )}>
                          {config.icon}
                        </div>
                        <div>
                          <CardTitle className={cn("text-lg", config.color)}>
                            {config.label}
                          </CardTitle>
                          <CardDescription>
                            {pricing.monthly === 0 ? 'Free forever' : `${formatIDR(pricing.monthly)}/mo`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      {/* Benefits List */}
                      <ul className="space-y-2 mb-6">
                        {config.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      <Separator className="mb-4" />

                      {/* Action Button */}
                      {isCurrent ? (
                        <Button className="w-full" disabled variant="outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : isLocked ? (
                        <Button className="w-full" disabled variant="secondary">
                          <Check className="h-4 w-4 mr-2" />
                          Unlocked
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleUpgrade(tier)}
                          variant={isPopular ? "default" : "outline"}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ / Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Need help choosing?</h3>
                  <p className="text-muted-foreground text-sm">
                    Our team can help you find the perfect membership tier for your needs.
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/contact')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipPage;
