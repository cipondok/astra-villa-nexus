import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';
import { cn } from '@/lib/utils';

interface VIPUpgradePromptProps {
  requiredLevel: MembershipLevel;
  featureName: string;
  featureDescription?: string;
  variant?: 'card' | 'inline' | 'banner';
  showUpgradeButton?: boolean;
  className?: string;
}

export const VIPUpgradePrompt: React.FC<VIPUpgradePromptProps> = ({
  requiredLevel,
  featureName,
  featureDescription,
  variant = 'card',
  showUpgradeButton = true,
  className
}) => {
  const navigate = useNavigate();
  const levelConfig = MEMBERSHIP_LEVELS[requiredLevel];

  const handleUpgrade = () => {
    navigate('/membership');
  };

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}>
        <Lock className="h-4 w-4" />
        <span>
          {levelConfig.shortLabel}+ required for {featureName}
        </span>
        {showUpgradeButton && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={handleUpgrade}>
            Upgrade <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "flex items-center justify-between gap-4 rounded-lg border p-4",
        levelConfig.bgColor,
        levelConfig.borderColor,
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-background/80"
          )}>
            <Crown className={cn("h-5 w-5", levelConfig.color)} />
          </div>
          <div>
            <p className="font-medium">
              Unlock {featureName}
            </p>
            <p className="text-sm text-muted-foreground">
              Available for {levelConfig.label} and above
            </p>
          </div>
        </div>
        {showUpgradeButton && (
          <Button onClick={handleUpgrade} className="shrink-0">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn(
      "overflow-hidden",
      levelConfig.borderColor,
      className
    )}>
      <div className={cn(
        "px-6 py-4",
        levelConfig.bgColor
      )}>
        <div className="flex items-center gap-2">
          <Crown className={cn("h-5 w-5", levelConfig.color)} />
          <span className={cn("font-semibold", levelConfig.color)}>
            {levelConfig.label} Feature
          </span>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{featureName}</h3>
        {featureDescription && (
          <p className="mb-4 text-sm text-muted-foreground">
            {featureDescription}
          </p>
        )}
        <p className="mb-4 text-sm">
          Upgrade to <span className={levelConfig.color}>{levelConfig.label}</span> to unlock this feature.
        </p>
        {showUpgradeButton && (
          <Button onClick={handleUpgrade} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to {levelConfig.shortLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Wrapper component for conditional feature rendering
interface VIPFeatureGateProps {
  requiredLevel: MembershipLevel;
  userLevel: MembershipLevel;
  featureName: string;
  featureDescription?: string;
  children: React.ReactNode;
  fallbackVariant?: 'card' | 'inline' | 'banner';
}

export const VIPFeatureGate: React.FC<VIPFeatureGateProps> = ({
  requiredLevel,
  userLevel,
  featureName,
  featureDescription,
  children,
  fallbackVariant = 'card'
}) => {
  const userPriority = MEMBERSHIP_LEVELS[userLevel]?.priority ?? 0;
  const requiredPriority = MEMBERSHIP_LEVELS[requiredLevel]?.priority ?? 0;

  if (userPriority >= requiredPriority) {
    return <>{children}</>;
  }

  return (
    <VIPUpgradePrompt
      requiredLevel={requiredLevel}
      featureName={featureName}
      featureDescription={featureDescription}
      variant={fallbackVariant}
    />
  );
};

export default VIPUpgradePrompt;
