
import { Shield, Star, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Send, Sparkles, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocialMediaSettings } from "@/hooks/useSocialMediaSettings";

interface FooterBrandProps {
  language: "en" | "id";
}

const FooterBrand = ({ language }: FooterBrandProps) => {
  const { settings } = useSocialMediaSettings();

  const text = {
    en: {
      company: "Astra Villa",
      tagline: "Your dream property awaits",
      trustedBy: "Trusted by 50,000+ property seekers",
      followUs: "Follow Us",
      description: "Indonesia's premier property marketplace connecting buyers, sellers, and industry professionals.",
    },
    id: {
      company: "Astra Villa",
      tagline: "Properti impian Anda menanti",
      trustedBy: "Dipercaya oleh 50,000+ pencari properti",
      followUs: "Ikuti Kami",
      description: "Marketplace properti terdepan Indonesia yang menghubungkan pembeli, penjual, dan profesional industri.",
    }
  };

  const currentText = text[language];

  const socialLinks = [
    { url: settings.facebookUrl, icon: Facebook, label: 'Facebook', colorClass: 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 border-blue-500/30 hover:border-blue-500/50', iconColor: 'text-blue-500' },
    { url: settings.twitterUrl, icon: Twitter, label: 'Twitter / X', colorClass: 'from-sky-400/20 to-sky-500/10 hover:from-sky-400/30 hover:to-sky-500/20 border-sky-400/30 hover:border-sky-400/50', iconColor: 'text-sky-400' },
    { url: settings.instagramUrl, icon: Instagram, label: 'Instagram', colorClass: 'from-pink-500/20 to-purple-500/10 hover:from-pink-500/30 hover:to-purple-500/20 border-pink-500/30 hover:border-pink-500/50', iconColor: 'text-pink-500' },
    { url: settings.tiktokUrl, icon: Music2, label: 'TikTok', colorClass: 'from-foreground/10 to-foreground/5 hover:from-foreground/20 hover:to-foreground/10 border-foreground/20 hover:border-foreground/40', iconColor: 'text-foreground' },
    { url: settings.linkedinUrl, icon: Linkedin, label: 'LinkedIn', colorClass: 'from-blue-600/20 to-blue-700/10 hover:from-blue-600/30 hover:to-blue-700/20 border-blue-600/30 hover:border-blue-600/50', iconColor: 'text-blue-600' },
    { url: settings.youtubeUrl, icon: Youtube, label: 'YouTube', colorClass: 'from-red-500/20 to-red-600/10 hover:from-red-500/30 hover:to-red-600/20 border-red-500/30 hover:border-red-500/50', iconColor: 'text-red-500' },
    { url: settings.whatsappNumber, icon: MessageCircle, label: 'WhatsApp', colorClass: 'from-green-500/20 to-green-600/10 hover:from-green-500/30 hover:to-green-600/20 border-green-500/30 hover:border-green-500/50', iconColor: 'text-green-500', isPhone: true },
    { url: settings.telegramUrl, icon: Send, label: 'Telegram', colorClass: 'from-sky-500/20 to-sky-600/10 hover:from-sky-500/30 hover:to-sky-600/20 border-sky-500/30 hover:border-sky-500/50', iconColor: 'text-sky-500' },
  ];

  const getHref = (link: typeof socialLinks[0]) => {
    if (!link.url) return undefined;
    if (link.isPhone) return `https://wa.me/${link.url.replace(/\D/g, '')}`;
    return link.url.startsWith('http') ? link.url : `https://${link.url}`;
  };

  const visibleLinks = socialLinks.filter(l => l.url);

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            {currentText.company}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {currentText.description}
        </p>
        <p className="text-primary font-medium text-sm">
          {currentText.tagline}
        </p>
      </div>
      
      {/* Trust Indicators */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/30">
          <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
          <span className="text-xs text-foreground font-medium">{currentText.trustedBy}</span>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/30">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" key={i} />
            ))}
          </div>
          <span className="text-sm text-foreground font-medium">4.9/5</span>
          <span className="text-xs text-muted-foreground">(12,543 reviews)</span>
        </div>
      </div>
      
      {/* Social Links */}
      {visibleLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm">
            {currentText.followUs}
          </h4>
          <div className="flex flex-wrap gap-2">
            {visibleLinks.map((link) => {
              const href = getHref(link);
              return (
                <a
                  key={link.label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  aria-label={link.label}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 bg-gradient-to-br ${link.colorClass} border transition-all duration-300 hover:scale-105`}
                    tabIndex={-1}
                  >
                    <link.icon className={`h-4 w-4 ${link.iconColor}`} />
                  </Button>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterBrand;
