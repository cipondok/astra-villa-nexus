import { useState } from 'react';
import { Share2, Copy, MessageCircle, Send, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';

interface SharePropertyButtonProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: number;
  propertyLocation?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

const SharePropertyButton = ({
  propertyId,
  propertyTitle,
  propertyPrice,
  propertyLocation,
  variant = 'icon',
  className,
}: SharePropertyButtonProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Fetch user's referral code if logged in
  const { data: referralCode } = useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('affiliates')
        .select('referral_code')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      return data?.referral_code || null;
    },
    enabled: !!user?.id,
  });

  const buildShareUrl = (channel: string) => {
    const base = `${window.location.origin}/properties/${propertyId}`;
    const params = new URLSearchParams();
    if (referralCode) params.set('ref', referralCode);
    params.set('utm_source', channel);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const formatPrice = getCurrencyFormatterShort();

  const shareText = `${propertyTitle}${propertyPrice ? ` - ${formatPrice(propertyPrice)}` : ''}${propertyLocation ? ` | ${propertyLocation}` : ''}`;

  const trackShare = async (channel: string) => {
    try {
      await supabase.from('property_shares' as any).insert({
        user_id: user?.id || null,
        property_id: propertyId,
        channel,
        referral_code: referralCode || null,
      });
    } catch { /* silent */ }
  };

  const handleCopyLink = async () => {
    const url = buildShareUrl('copy');
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied!', description: 'Property link copied to clipboard' });
      trackShare('copy');
    } catch {
      toast({ title: 'Failed', description: 'Could not copy link', variant: 'destructive' });
    }
    setOpen(false);
  };

  const handleSocialShare = (channel: string, urlBuilder: (url: string, text: string) => string) => {
    const url = buildShareUrl(channel);
    window.open(urlBuilder(url, shareText), '_blank', 'width=600,height=400');
    trackShare(channel);
    setOpen(false);
  };

  const channels = [
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'text-primary',
      action: handleCopyLink,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-[#25D366]',
      action: () => handleSocialShare('whatsapp', (url, text) =>
        `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
      ),
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-[#1877F2]',
      action: () => handleSocialShare('facebook', (url) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      ),
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'text-[#1DA1F2]',
      action: () => handleSocialShare('twitter', (url, text) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      ),
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'text-[#0088cc]',
      action: () => handleSocialShare('telegram', (url, text) =>
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
      ),
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <Button
            size="sm"
            variant="ghost"
            className={className || "h-6 w-6 sm:h-7 sm:w-7 p-0 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full border border-white/20"}
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={className} onClick={(e) => e.stopPropagation()}>
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        {channels.map((ch) => (
          <DropdownMenuItem key={ch.name} onClick={ch.action} className="cursor-pointer gap-2">
            <ch.icon className={`h-4 w-4 ${ch.color}`} />
            {ch.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SharePropertyButton;
