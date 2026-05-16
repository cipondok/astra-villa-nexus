import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Sparkles, Image, Box, Star, Zap, Shield, Building2, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/useTranslation';
import { usePropertyFormTiers, PROPERTY_FORM_FEATURES } from '@/hooks/usePropertyFormTiers';
import { MEMBERSHIP_LEVELS, MembershipLevel } from '@/types/membership';
import { cn } from '@/lib/utils';

const TierFeatureBanner: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
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

  const t = text[language] || text.en;

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
    <div className="flex items-center gap-1.5 flex-wrap px-2 py-1.5 rounded-md border border-border/40 bg-muted/30">
      {/* Level indicator */}
      <div className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
        levelConfig.bgColor, levelConfig.color
      )}>
        <Crown className="h-3 w-3" />
        {levelConfig.label}
      </div>

      <span className="text-muted-foreground/40 text-[10px]">•</span>

      {/* Image count */}
      <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0 h-5 shrink-0">
        <Image className="h-2.5 w-2.5" />
        {maxImages} {t.images}
      </Badge>

      {canUseVirtualTour && (
        <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0 h-5 shrink-0 bg-chart-1/10 text-chart-1 border-chart-1/30">
          <Box className="h-2.5 w-2.5" />
          {t.virtualTour}
        </Badge>
      )}
      {canUse3DModel && (
        <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0 h-5 shrink-0 bg-chart-4/10 text-chart-4 border-chart-4/30">
          <Box className="h-2.5 w-2.5" />
          {t.model3d}
        </Badge>
      )}
      {canBeFeatured && (
        <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0 h-5 shrink-0 bg-gold-primary/10 text-gold-primary border-gold-primary/30">
          <Star className="h-2.5 w-2.5" />
          {t.featuredBadge}
        </Badge>
      )}

      {topLockedFeatures.length > 0 && (
        <>
          <span className="text-muted-foreground/40 text-[10px]">•</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/membership')}
            className="h-5 text-[10px] gap-1 px-1.5 text-muted-foreground hover:text-primary"
          >
            <Sparkles className="h-2.5 w-2.5" />
            Upgrade
          </Button>
        </>
      )}
    </div>
  );
};

export default TierFeatureBanner;
