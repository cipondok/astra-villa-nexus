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
      <DialogContent className="sm:max-w-lg border-border/50 overflow-hidden p-0">
        <div className="relative">
          {/* Gradient Header */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 pb-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Share2 className="h-6 w-6" />
                </div>
                Share Property
              </DialogTitle>
              <DialogDescription className="text-white/90 mt-2 text-sm">
                Share this amazing property with your network
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content Section */}
          <div className="px-6 pb-6 -mt-4">
            {/* Property Preview Card - Elevated */}
            <div className="glass-card shadow-xl mb-6 overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img 
                  src={getImageUrl()} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-bold text-lg line-clamp-1 drop-shadow-lg">{property.title}</h4>
                  <p className="text-sm text-white/90 line-clamp-1 drop-shadow-lg flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {property.city || property.location}
                  </p>
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <p className="text-sm font-bold text-primary">{formatPrice(property.price)}</p>
                </div>
              </div>
            </div>

            {/* Social Media Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Share via</h3>
              <div className="grid grid-cols-3 gap-3">
                {socialPlatforms.map((platform: any) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className={`group flex flex-col items-center gap-2 h-auto py-5 border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${platform.color} text-white hover:text-white active:scale-95 relative overflow-hidden`}
                    onClick={platform.action}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <platform.icon className="h-7 w-7 relative z-10 drop-shadow-md" />
                    <span className="text-xs font-semibold relative z-10">{platform.name}</span>
                    {platform.accountName && (
                      <span className="text-[10px] opacity-90 relative z-10 line-clamp-1 max-w-full px-1">{platform.accountName}</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Native Share Button */}
            {navigator.share && window.parent === window && (
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border-primary/20 hover:border-primary/40 transition-all duration-300 py-6 group"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-5 w-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-foreground">More Sharing Options</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
