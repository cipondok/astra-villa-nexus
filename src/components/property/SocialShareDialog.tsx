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
      <DialogContent className="sm:max-w-md border-0 overflow-hidden p-0 bg-white dark:bg-gray-900">
        {/* WhatsApp-Style Header */}
        <div className="bg-[#128C7E] dark:bg-[#075E54] px-5 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
              <Share2 className="h-5 w-5" />
              Share Property
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
          {/* Property Preview - Compact */}
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img 
                src={getImageUrl()} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-[#25D366] text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                {formatPrice(property.price)}
              </div>
            </div>
            <div className="p-2.5 bg-white dark:bg-gray-800">
              <h4 className="font-semibold text-sm line-clamp-1 text-gray-900 dark:text-white">{property.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{property.city || property.location}</p>
            </div>
          </div>

          {/* Social Buttons - Compact Grid */}
          <div className="grid grid-cols-4 gap-2">
            {socialPlatforms.map((platform: any) => (
              <Button
                key={platform.name}
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 border-0`}
                onClick={platform.action}
              >
                <div className={`p-2 rounded-full ${platform.color}`}>
                  <platform.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{platform.name}</span>
              </Button>
            ))}
          </div>

          {/* Native Share */}
          {navigator.share && window.parent === window && (
            <Button
              variant="ghost"
              className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2.5 text-sm"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              More Options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
