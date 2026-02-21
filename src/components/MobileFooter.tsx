import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Phone, Mail, Facebook, Instagram, 
  MessageCircle, Youtube, Twitter, Music2
} from 'lucide-react';
import { useSocialMediaSettings } from '@/hooks/useSocialMediaSettings';
import { cn } from '@/lib/utils';

const MobileFooter = () => {
  const { isMobile } = useIsMobile();
  const { settings } = useSocialMediaSettings();

  const socialLinks = [
    { url: settings.facebookUrl, Icon: Facebook, label: 'Facebook' },
    { url: settings.instagramUrl, Icon: Instagram, label: 'Instagram' },
    { url: settings.twitterUrl, Icon: Twitter, label: 'Twitter / X' },
    { url: settings.tiktokUrl, Icon: Music2, label: 'TikTok' },
    { url: settings.youtubeUrl, Icon: Youtube, label: 'YouTube' },
    { url: settings.whatsappNumber, Icon: MessageCircle, label: 'WhatsApp', isPhone: true },
  ].filter(l => l.url);

  const getHref = (link: typeof socialLinks[0]) => {
    if (!link.url) return '#';
    if (link.isPhone) return `https://wa.me/${link.url.replace(/\D/g, '')}`;
    return link.url.startsWith('http') ? link.url : `https://${link.url}`;
  };

  if (!isMobile) return null;

  return (
    <footer
      className={cn(
        "w-full rounded-t-3xl",
        "bg-card/95 backdrop-blur-xl",
        "border-t border-gold-primary/15",
        "shadow-[0_-4px_20px_hsl(var(--gold-primary)/0.06)]",
        "px-4 pt-4"
      )}
      style={{ paddingBottom: 'calc(4rem + max(env(safe-area-inset-bottom), 8px) + 0.75rem)' }}
    >
      <div className="flex items-center justify-between">
        {/* Contact buttons */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+6285716008080"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/8 border border-primary-foreground/10 text-muted-foreground hover:bg-gold-primary/10 hover:text-gold-primary transition-all duration-200"
            aria-label="Call us"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href="mailto:info@astravilla.com"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/8 border border-primary-foreground/10 text-muted-foreground hover:bg-gold-primary/10 hover:text-gold-primary transition-all duration-200"
            aria-label="Email us"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>

        {/* Social links + copyright */}
        <div className="flex items-center gap-1.5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={getHref(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/8 border border-primary-foreground/10 text-muted-foreground hover:bg-gold-primary/10 hover:border-gold-primary/30 hover:text-gold-primary active:scale-95 transition-all duration-200"
              aria-label={link.label}
            >
              <link.Icon className="h-4 w-4" />
            </a>
          ))}
          <span className="text-[9px] pl-1.5 text-muted-foreground font-medium">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* Subtle divider dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-primary/20" />
        ))}
      </div>
    </footer>
  );
};

export default MobileFooter;