import React from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MembershipLevel, MEMBERSHIP_LEVELS } from '@/types/membership';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TierLockedFeatureProps {
  featureName: string;
  featureNameId?: string;
  featureDescription?: string;
  featureDescriptionId?: string;
  requiredLevel: MembershipLevel;
  currentLevel: MembershipLevel;
  variant?: 'overlay' | 'card' | 'inline' | 'badge';
  children?: React.ReactNode;
  className?: string;
  showUpgradeButton?: boolean;
}

const TierLockedFeature: React.FC<TierLockedFeatureProps> = ({
  featureName,
  featureNameId,
  featureDescription,
  featureDescriptionId,
  requiredLevel,
  currentLevel,
  variant = 'card',
  children,
  className,
  showUpgradeButton = true
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const levelConfig = MEMBERSHIP_LEVELS[requiredLevel];
  const currentConfig = MEMBERSHIP_LEVELS[currentLevel];

  const name = language === 'id' && featureNameId ? featureNameId : featureName;
  const description = language === 'id' && featureDescriptionId ? featureDescriptionId : featureDescription;

  const text = {
    en: {
      lockedFor: 'Available for',
      andAbove: 'and above',
      currentLevel: 'Your level',
      upgrade: 'Upgrade',
      unlockFeature: 'Unlock this feature'
    },
    id: {
      lockedFor: 'Tersedia untuk',
      andAbove: 'ke atas',
      currentLevel: 'Level Anda',
      upgrade: 'Upgrade',
      unlockFeature: 'Buka fitur ini'
    }
  };

  const t = text[language];

  if (variant === 'badge') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "gap-1 text-xs border-chart-3/30 bg-chart-3/10 text-chart-3",
          className
        )}
      >
        <Lock className="h-3 w-3" />
        {levelConfig.shortLabel}+
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground py-1",
        className
      )}>
        <Lock className="h-3.5 w-3.5 text-chart-3" />
        <span>{name}</span>
        <Badge variant="outline" className="text-[10px] h-5 border-chart-3/30 text-chart-3">
          {levelConfig.shortLabel}+
        </Badge>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={cn("relative", className)}>
        <div className="opacity-30 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border border-dashed border-chart-3/50">
          <div className="text-center p-4 max-w-xs">
            <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-chart-3" />
            </div>
            <h4 className="font-semibold text-sm mb-1">{name}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {t.lockedFor} <span className={levelConfig.color}>{levelConfig.shortLabel}</span> {t.andAbove}
            </p>
            {showUpgradeButton && (
              <Button
                size="sm"
                onClick={() => navigate('/membership')}
                className="h-8 text-xs gap-1.5"
              >
                <Crown className="h-3.5 w-3.5" />
                {t.upgrade}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn(
      "border-dashed border-chart-3/40 bg-chart-3/5",
      className
    )}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-chart-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{name}</h4>
              <Badge variant="outline" className="text-[10px] h-5 border-chart-3/30 text-chart-3">
                {levelConfig.shortLabel}+
              </Badge>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mb-3">{description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {t.currentLevel}: <span className={currentConfig.color}>{currentConfig.shortLabel}</span>
              </span>
              {showUpgradeButton && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/membership')}
                  className="h-7 text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
                >
                  <Sparkles className="h-3 w-3" />
                  {t.unlockFeature}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierLockedFeature;
