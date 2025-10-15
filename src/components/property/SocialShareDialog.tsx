import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, MessageCircle, Send, Link, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BaseProperty } from "@/types/property";

interface SocialShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: BaseProperty;
}

const SocialShareDialog = ({ open, onOpenChange, property }: SocialShareDialogProps) => {
  const shareUrl = `${window.location.origin}/properties/${property.id}`;
  const shareTitle = property.title;
  const shareDescription = `Check out this property: ${property.title} in ${property.city || property.location}`;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `IDR ${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `IDR ${(price / 1000000).toFixed(1)}M`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const shareMessage = `${shareTitle}\n${formatPrice(property.price)}\n${property.bedrooms}BR | ${property.bathrooms}BA | ${property.area_sqm}m²\n${shareUrl}`;

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366] hover:bg-[#20BD5A]",
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2] hover:bg-[#0C63D4]",
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-[#1DA1F2] hover:bg-[#0C8BD9]",
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2] hover:bg-[#084F94]",
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#0088cc] hover:bg-[#006DA8]",
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareDescription)}`, '_blank');
      }
    },
    {
      name: "Copy Link",
      icon: Link,
      color: "bg-primary hover:bg-primary/90",
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied!",
            description: "Property link has been copied to clipboard",
          });
          onOpenChange(false);
        } catch (error) {
          toast({
            title: "Failed",
            description: "Could not copy link",
            variant: "destructive",
          });
        }
      }
    }
  ];

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
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="h-5 w-5 text-primary" />
            Share Property
          </DialogTitle>
          <DialogDescription>
            Share this property with your network
          </DialogDescription>
        </DialogHeader>

        {/* Property Preview Card */}
        <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/30">
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={getImageUrl()} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-sm line-clamp-1">{property.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{property.city || property.location}</p>
            <p className="text-sm font-bold text-primary mt-1">{formatPrice(property.price)}</p>
          </div>
        </div>

        {/* Social Media Grid */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.name}
              variant="outline"
              className={`flex flex-col items-center gap-2 h-auto py-4 border border-border/50 hover:scale-105 transition-all duration-200 ${platform.color} text-white hover:text-white`}
              onClick={platform.action}
            >
              <platform.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{platform.name}</span>
            </Button>
          ))}
        </div>

        {/* Native Share Button */}
        {navigator.share && window.parent === window && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            More Options
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareDialog;
