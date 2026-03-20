import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
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
        "w-full",
        "bg-card/95 backdrop-blur-xl",
        "border-t border-border/30",
        "px-3 pt-2 pb-1"
      )}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 56px)' }}
    >
      <div className="flex items-center justify-between">
        {/* Contact buttons */}
        <div className="flex items-center gap-1">
          <a
            href="tel:+6285716008080"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/40 text-muted-foreground active:scale-95 transition-all duration-150"
            aria-label="Call us"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
          <a
            href="mailto:info@astravilla.com"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/40 text-muted-foreground active:scale-95 transition-all duration-150"
            aria-label="Email us"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Social links + copyright */}
        <div className="flex items-center gap-1">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={getHref(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/40 text-muted-foreground active:scale-95 transition-all duration-150"
              aria-label={link.label}
            >
              <link.Icon className="h-3.5 w-3.5" />
            </a>
          ))}
          <span className="text-[9px] pl-1 text-muted-foreground/60 font-medium">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;
