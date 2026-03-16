import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareShortlistButtonProps {
  className?: string;
}

/**
 * Button + dialog that lets users share their saved property shortlist
 * as a link with all property IDs encoded.
 */
export default function ShareShortlistButton({ className }: ShareShortlistButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: savedIds = [] } = useQuery({
    queryKey: ['shortlist-ids', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return (data || []).map(d => d.property_id);
    },
    enabled: !!user?.id && open,
  });

  if (!user) return null;

  const shortlistUrl = savedIds.length > 0
    ? `${window.location.origin}/properties?shortlist=${savedIds.slice(0, 10).join(',')}`
    : '';

  const handleCopy = async () => {
    if (!shortlistUrl) return;
    await navigator.clipboard.writeText(shortlistUrl);
    setCopied(true);
    toast.success('Shortlist link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!shortlistUrl) return;
    const text = `Check out my property shortlist on ASTRAVILLA:\n${shortlistUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTelegram = () => {
    if (!shortlistUrl) return;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shortlistUrl)}&text=${encodeURIComponent('My property shortlist on ASTRAVILLA')}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share Shortlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Share Your Shortlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {savedIds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Save some properties first to share your shortlist.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Share {Math.min(savedIds.length, 10)} saved properties with family, friends, or your agent.
              </p>

              {/* Link preview */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <input
                  readOnly
                  value={shortlistUrl}
                  className="flex-1 text-xs bg-transparent border-0 outline-none text-foreground truncate"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-chart-1" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>

              {/* Share channels */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-chart-1" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  onClick={handleTelegram}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5 text-chart-4" />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  onClick={handleCopy}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
