import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, MessageCircle, Send, Link, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BaseProperty } from "@/types/property";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SocialShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: BaseProperty;
}

interface SocialMediaSetting {
  id: string;
  platform: string;
  account_name: string | null;
  profile_url: string | null;
  is_active: boolean;
}

const SocialShareDialog = ({ open, onOpenChange, property }: SocialShareDialogProps) => {
  const { data: socialSettings } = useQuery({
    queryKey: ['social-media-settings-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('id, platform, account_name, profile_url, is_active')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as SocialMediaSetting[];
    },
  });

  const shareUrl = `${window.location.origin}/properties/${property.id}`;
  const shareTitle = property.title;
  const shareDescription = `Check out this property: ${property.title} in ${property.city || property.location}`;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `IDR ${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `IDR ${(price / 1000000).toFixed(1)}M`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const shareMessage = `${shareTitle}\n${formatPrice(property.price)}\n${property.bedrooms}BR | ${property.bathrooms}BA | ${property.area_sqm}m²\n${shareUrl}`;

  // Build social platforms from database settings
  const activePlatforms = socialSettings?.filter(s => s.is_active) || [];
  
  const getPlatformConfig = (platform: string) => {
    const configs = {
      facebook: {
        name: "Facebook",
        icon: Facebook,
        color: "bg-[#1877F2] hover:bg-[#0C63D4]",
        action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
      },
      twitter: {
        name: "Twitter",
        icon: Twitter,
        color: "bg-[#1DA1F2] hover:bg-[#0C8BD9]",
        action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
      linkedin: {
        name: "LinkedIn",
        icon: Linkedin,
        color: "bg-[#0A66C2] hover:bg-[#084F94]",
        action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
      whatsapp: {
        name: "WhatsApp",
        icon: MessageCircle,
        color: "bg-[#25D366] hover:bg-[#20BD5A]",
        action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')
      },
      telegram: {
        name: "Telegram",
        icon: Send,
        color: "bg-[#0088cc] hover:bg-[#006DA8]",
        action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}`, '_blank')
      },
    };
    
    return configs[platform as keyof typeof configs];
  };

  const socialPlatforms = activePlatforms
    .map(setting => {
      const config = getPlatformConfig(setting.platform);
      return config ? { ...config, accountName: setting.account_name } : null;
    })
    .filter(Boolean);

  // Always include Copy Link
  const copyLinkAction = {
    name: "Copy Link",
    icon: Link,
    color: "bg-primary hover:bg-primary/90",
    action: () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link Copied!",
          description: "Property link has been copied to clipboard",
        });
        onOpenChange(false);
      }).catch(() => {
        toast({
          title: "Failed",
          description: "Could not copy link",
          variant: "destructive",
        });
      });
    },
    accountName: null,
  };
  
  socialPlatforms.push(copyLinkAction as any);

  const handleNativeShare = async () => {
    if (navigator.share && window.parent === window) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        onOpenChange(false);
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  const getImageUrl = () => {
    if (property.images && property.images.length > 0) return property.images[0];
    if (property.image_urls && property.image_urls.length > 0) return property.image_urls[0];
    if (property.thumbnail_url) return property.thumbnail_url;
    return "/placeholder.svg";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl p-0 gap-0 overflow-hidden">
        {/* Modern Gradient Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Share Property</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-xs">
                  Share with your network
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-3">
          {/* Property Preview - Ultra Compact */}
          <div className="rounded-lg overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-accent/30 to-accent/50 shadow-sm">
            <div className="aspect-video relative overflow-hidden bg-muted/50">
              <img 
                src={getImageUrl()} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold shadow-lg">
                {formatPrice(property.price)}
              </div>
            </div>
            <div className="p-2 bg-background/80 backdrop-blur-sm">
              <h4 className="font-bold text-xs line-clamp-1 text-foreground">{property.title}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-1 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.city || property.location}
              </p>
            </div>
          </div>

          {/* Social Buttons - Compact Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {socialPlatforms.map((platform: any) => (
              <Button
                key={platform.name}
                variant="ghost"
                className="flex flex-col items-center gap-1 h-auto py-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-105 active:scale-95 border-0"
                onClick={platform.action}
              >
                <div className={`p-1.5 rounded-full ${platform.color}`}>
                  <platform.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[9px] font-medium text-foreground/80 line-clamp-1">{platform.name}</span>
              </Button>
            ))}
          </div>

          {/* Native Share */}
          {navigator.share && window.parent === window && (
            <Button
              variant="outline"
              className="w-full border-2 hover:bg-accent py-2 text-xs"
              onClick={handleNativeShare}
            >
              <Share2 className="h-3 w-3 mr-1.5" />
              More Options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
