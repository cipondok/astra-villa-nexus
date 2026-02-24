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

interface ShareComparisonButtonProps {
  propertyIds: string[];
  className?: string;
}

const ShareComparisonButton = ({ propertyIds, className }: ShareComparisonButtonProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

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
    const base = `${window.location.origin}/property-comparison`;
    const params = new URLSearchParams();
    propertyIds.forEach((id) => params.append('ids', id));
    if (referralCode) params.set('ref', referralCode);
    params.set('utm_source', channel);
    return `${base}?${params.toString()}`;
  };

  const shareText = `Compare ${propertyIds.length} properties on Astra Villa Realty`;

  const handleCopyLink = async () => {
    const url = buildShareUrl('copy');
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied!', description: 'Comparison link copied to clipboard' });
    } catch {
      toast({ title: 'Failed', description: 'Could not copy link', variant: 'destructive' });
    }
    setOpen(false);
  };

  const handleSocialShare = (channel: string, urlBuilder: (url: string, text: string) => string) => {
    const url = buildShareUrl(channel);
    window.open(urlBuilder(url, shareText), '_blank', 'width=600,height=400');
    setOpen(false);
  };

  const channels = [
    { name: 'Copy Link', icon: Copy, color: 'text-primary', action: handleCopyLink },
    {
      name: 'WhatsApp', icon: MessageCircle, color: 'text-[#25D366]',
      action: () => handleSocialShare('whatsapp', (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`),
    },
    {
      name: 'Facebook', icon: Facebook, color: 'text-[#1877F2]',
      action: () => handleSocialShare('facebook', (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`),
    },
    {
      name: 'Twitter/X', icon: Twitter, color: 'text-[#1DA1F2]',
      action: () => handleSocialShare('twitter', (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`),
    },
    {
      name: 'Telegram', icon: Send, color: 'text-[#0088cc]',
      action: () => handleSocialShare('telegram', (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`),
    },
  ];

  if (propertyIds.length < 2) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-1.5" />
          Share Comparison
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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

export default ShareComparisonButton;
