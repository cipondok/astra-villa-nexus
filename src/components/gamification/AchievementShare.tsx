import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, Link2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Achievement } from '@/hooks/useGamification';

interface AchievementShareProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
}

const AchievementShare = ({ achievement, isOpen, onClose }: AchievementShareProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = achievement.share_text || 'Check out my achievement on Astra Villa!';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share your achievement with friends",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getAchievementIcon = () => {
    switch (achievement.achievement_type) {
      case 'badge_earned':
        return '🏆';
      case 'level_up':
        return '⬆️';
      case 'leaderboard':
        return '👑';
      case 'milestone':
        return '🎯';
      default:
        return '🌟';
    }
  };

  const getAchievementTitle = () => {
    switch (achievement.achievement_type) {
      case 'badge_earned':
        return `Badge Earned: ${achievement.achievement_data?.badge_name || 'New Badge'}`;
      case 'level_up':
        return `Reached Level ${achievement.achievement_data?.new_level || '?'}!`;
      case 'leaderboard':
        return 'Leaderboard Achievement';
      case 'milestone':
        return 'Milestone Reached';
      default:
        return 'New Achievement';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Achievement
          </DialogTitle>
        </DialogHeader>

        {/* Achievement Preview Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 border border-primary/20 p-4"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="text-4xl mb-2">{getAchievementIcon()}</div>
            <h3 className="font-bold text-lg">{getAchievementTitle()}</h3>
            <p className="text-sm text-muted-foreground mt-1">{shareText}</p>
            
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-primary/10 text-primary">Astra Villa</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(achievement.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Share Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
            <span className="text-[10px]">Twitter</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('facebook')}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Facebook className="h-5 w-5 text-[#1877F2]" />
            <span className="text-[10px]">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            <span className="text-[10px]">LinkedIn</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col h-auto py-3 gap-1"
          >
            <svg className="h-5 w-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[10px]">WhatsApp</span>
          </Button>
        </div>

        {/* Copy Link */}
        <Button
          variant="secondary"
          onClick={handleCopyLink}
          className="w-full"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementShare;
