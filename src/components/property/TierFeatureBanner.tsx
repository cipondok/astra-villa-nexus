import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Sparkles, Image, Box, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePropertyFormTiers, PROPERTY_FORM_FEATURES } from '@/hooks/usePropertyFormTiers';
import { MEMBERSHIP_LEVELS, MembershipLevel } from '@/types/membership';
import { cn } from '@/lib/utils';

const TierFeatureBanner: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    membershipLevel, 
    maxImages, 
    canUseVirtualTour, 
    canUse3DModel,
    canUseSEO,
    canBeFeatured,
    lockedFeatures 
  } = usePropertyFormTiers();

  const levelConfig = MEMBERSHIP_LEVELS[membershipLevel];

  const text = {
    en: {
      yourLevel: 'Your Level',
      currentFeatures: 'Current Features',
      lockedFeatures: 'Locked Features',
      upgradeToUnlock: 'Upgrade to Unlock',
      images: 'images',
      virtualTour: 'Virtual Tour',
      model3d: '3D Model',
      seoTools: 'SEO Tools',
      featuredBadge: 'Featured Badge',
      upgradeNow: 'Upgrade Now',
      unlockMore: 'Unlock more features'
    },
    id: {
      yourLevel: 'Level Anda',
      currentFeatures: 'Fitur Saat Ini',
      lockedFeatures: 'Fitur Terkunci',
      upgradeToUnlock: 'Upgrade untuk Membuka',
      images: 'gambar',
      virtualTour: 'Virtual Tour',
      model3d: 'Model 3D',
      seoTools: 'Tools SEO',
      featuredBadge: 'Badge Featured',
      upgradeNow: 'Upgrade Sekarang',
      unlockMore: 'Buka lebih banyak fitur'
    }
  };

  const t = text[language];

  // Get icons for features
  const getFeatureIcon = (id: string) => {
    switch (id) {
      case 'virtual_tour': return Box;
      case '3d_model': return Box;
      case 'images_extended':
      case 'unlimited_images': return Image;
      case 'featured_badge': return Star;
      case 'priority_listing': return Zap;
      case 'seo_optimization': return Shield;
      default: return Sparkles;
    }
  };

  // Show only top 3 locked features
  const topLockedFeatures = lockedFeatures.slice(0, 3);

  return (
    <Card className="border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Current Level */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center",
              levelConfig.bgColor,
              "border",
              levelConfig.borderColor
            )}>
              <Crown className={cn("h-5 w-5 sm:h-6 sm:w-6", levelConfig.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.yourLevel}</p>
              <p className={cn("font-semibold text-sm sm:text-base", levelConfig.color)}>
                {levelConfig.label}
              </p>
            </div>
          </div>

          {/* Current Features */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Image className="h-3 w-3" />
              {maxImages} {t.images}
            </Badge>
            {canUseVirtualTour && (
              <Badge variant="secondary" className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                <Box className="h-3 w-3" />
                {t.virtualTour}
              </Badge>
            )}
            {canUse3DModel && (
              <Badge variant="secondary" className="text-xs gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                <Box className="h-3 w-3" />
                {t.model3d}
              </Badge>
            )}
            {canBeFeatured && (
              <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                <Star className="h-3 w-3" />
                {t.featuredBadge}
              </Badge>
            )}
          </div>

          {/* Locked Features / Upgrade Button */}
          {topLockedFeatures.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5">
                {topLockedFeatures.map(feature => {
                  const Icon = getFeatureIcon(feature.id);
                  const requiredConfig = MEMBERSHIP_LEVELS[feature.requiredLevel];
                  return (
                    <div 
                      key={feature.id} 
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground"
                      title={`${language === 'id' ? feature.nameId : feature.name} - ${requiredConfig.shortLabel}+`}
                    >
                      <Lock className="h-3 w-3" />
                      <Icon className="h-3 w-3" />
                    </div>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/membership')}
                className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.upgradeNow}</span>
                <span className="sm:hidden">{t.unlockMore}</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TierFeatureBanner;
