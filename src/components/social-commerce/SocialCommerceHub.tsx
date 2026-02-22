import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, Video, Image, Facebook, MessageCircle,
  ShoppingBag, ExternalLink, Eye, Heart, Share2, 
  TrendingUp, Zap, ArrowRight, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  features: string[];
  cta: string;
}

const platforms: SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram Storefront',
    icon: Instagram,
    color: 'text-destructive',
    bgGradient: 'from-destructive via-accent to-chart-3',
    features: ['Shoppable Posts', 'Story Links', 'Reels Shopping'],
    cta: 'Shop Now'
  },
  {
    id: 'tiktok',
    name: 'TikTok Tours',
    icon: Video,
    color: 'text-foreground',
    bgGradient: 'from-chart-4 via-destructive to-destructive',
    features: ['Property Tours', 'Shop Now Button', 'Live Shopping'],
    cta: 'Book Tour'
  },
  {
    id: 'pinterest',
    name: 'Pinterest Ideas',
    icon: Image,
    color: 'text-destructive',
    bgGradient: 'from-destructive to-destructive',
    features: ['Idea Boards', 'Rich Pins', 'Shop Tab'],
    cta: 'Save Idea'
  },
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    icon: Facebook,
    color: 'text-chart-4',
    bgGradient: 'from-chart-4 to-chart-4',
    features: ['Premium Listings', 'Shop Integration', 'Messenger Bot'],
    cta: 'View Listing'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: MessageCircle,
    color: 'text-chart-1',
    bgGradient: 'from-chart-1 to-chart-1',
    features: ['Automated Viewings', 'Catalog', 'Instant Booking'],
    cta: 'Book Viewing'
  }
];

interface SocialCommerceHubProps {
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyPrice?: number;
  onPlatformClick?: (platformId: string) => void;
  compact?: boolean;
}

const SocialCommerceHub: React.FC<SocialCommerceHubProps> = ({
  propertyId,
  propertyTitle,
  propertyImage,
  propertyPrice,
  onPlatformClick,
  compact = false
}) => {
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const handlePlatformAction = (platform: SocialPlatform) => {
    setActivePlatform(platform.id);
    onPlatformClick?.(platform.id);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((platform) => (
          <Button
            key={platform.id}
            variant="outline"
            size="sm"
            onClick={() => handlePlatformAction(platform)}
            className={cn(
              "gap-2 transition-all",
              activePlatform === platform.id && "ring-2 ring-primary"
            )}
          >
            <platform.icon className={cn("h-4 w-4", platform.color)} />
            <span className="hidden sm:inline">{platform.cta}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Social Commerce
          </h2>
          <p className="text-muted-foreground mt-1">
            Shop this property across all platforms
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          5 Platforms
        </Badge>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, idx) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onMouseEnter={() => setHoveredPlatform(platform.id)}
            onMouseLeave={() => setHoveredPlatform(null)}
          >
            <Card className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-1",
              activePlatform === platform.id && "ring-2 ring-primary"
            )}>
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 opacity-10 bg-gradient-to-br",
                platform.bgGradient
              )} />

              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl bg-gradient-to-br",
                      platform.bgGradient
                    )}>
                      <platform.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                  </div>
                  <ExternalLink className={cn(
                    "h-4 w-4 transition-opacity",
                    hoveredPlatform === platform.id ? "opacity-100" : "opacity-0"
                  )} />
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {platform.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Stats Preview */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    2.4K
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    156
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5" />
                    42
                  </span>
                </div>

                {/* CTA Button */}
                <Button 
                  className={cn(
                    "w-full gap-2 bg-gradient-to-r text-primary-foreground",
                    platform.bgGradient
                  )}
                  onClick={() => handlePlatformAction(platform)}
                >
                  <Zap className="h-4 w-4" />
                  {platform.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12.5K</div>
              <div className="text-xs text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">847</div>
              <div className="text-xs text-muted-foreground">Engagements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-1">156</div>
              <div className="text-xs text-muted-foreground">Inquiries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-4">23</div>
              <div className="text-xs text-muted-foreground">Conversions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialCommerceHub;
