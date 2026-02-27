
import { Shield, Star, Facebook, Twitter, Instagram, Youtube, MessageCircle, Sparkles, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocialMediaSettings } from "@/hooks/useSocialMediaSettings";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterBrandProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
}

const FooterBrand = ({ language }: FooterBrandProps) => {
  const { settings } = useSocialMediaSettings();
  const { t } = useTranslation();

  const socialLinks = [
    { url: settings.facebookUrl, icon: Facebook, label: 'Facebook', colorClass: 'from-chart-4/20 to-chart-4/10 hover:from-chart-4/30 hover:to-chart-4/20 border-chart-4/30 hover:border-chart-4/50', iconColor: 'text-chart-4' },
    { url: settings.twitterUrl, icon: Twitter, label: 'Twitter / X', colorClass: 'from-chart-4/20 to-chart-4/10 hover:from-chart-4/30 hover:to-chart-4/20 border-chart-4/30 hover:border-chart-4/50', iconColor: 'text-chart-4' },
    { url: settings.instagramUrl, icon: Instagram, label: 'Instagram', colorClass: 'from-destructive/20 to-accent/10 hover:from-destructive/30 hover:to-accent/20 border-destructive/30 hover:border-destructive/50', iconColor: 'text-destructive' },
    { url: settings.tiktokUrl, icon: Music2, label: 'TikTok', colorClass: 'from-foreground/10 to-foreground/5 hover:from-foreground/20 hover:to-foreground/10 border-foreground/20 hover:border-foreground/40', iconColor: 'text-foreground' },
    { url: settings.youtubeUrl, icon: Youtube, label: 'YouTube', colorClass: 'from-destructive/20 to-destructive/10 hover:from-destructive/30 hover:to-destructive/20 border-destructive/30 hover:border-destructive/50', iconColor: 'text-destructive' },
    { url: settings.whatsappNumber, icon: MessageCircle, label: 'WhatsApp', colorClass: 'from-chart-1/20 to-chart-1/10 hover:from-chart-1/30 hover:to-chart-1/20 border-chart-1/30 hover:border-chart-1/50', iconColor: 'text-chart-1', isPhone: true },
  ];

  const getHref = (link: typeof socialLinks[0]) => {
    if (!link.url) return undefined;
    if ((link as any).isPhone) return `https://wa.me/${link.url.replace(/\D/g, '')}`;
    return link.url.startsWith('http') ? link.url : `https://${link.url}`;
  };

  const visibleLinks = socialLinks.filter(l => l.url);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-gold-primary to-gold-primary/80 rounded-lg">
            <Sparkles className="h-6 w-6 text-background" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gold-primary via-gold-primary to-gold-primary/80 bg-clip-text text-transparent">
            {t('footerBrand.company')}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{t('footerBrand.description')}</p>
        <p className="text-gold-primary font-medium text-sm">{t('footerBrand.tagline')}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/30">
          <Shield className="h-5 w-5 text-gold-primary flex-shrink-0" />
          <span className="text-xs text-foreground font-medium">{t('footerBrand.trustedBy')}</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/30">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star className="h-4 w-4 fill-gold-primary text-gold-primary" key={i} />
            ))}
          </div>
          <span className="text-sm text-foreground font-medium">4.9/5</span>
          <span className="text-xs text-muted-foreground">(12,543 reviews)</span>
        </div>
      </div>

      {visibleLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm">{t('footerBrand.followUs')}</h4>
          <div className="flex flex-wrap gap-2">
            {visibleLinks.map((link) => {
              const href = getHref(link);
              return (
                <a key={link.label} href={href} target="_blank" rel="noopener noreferrer" title={link.label} aria-label={link.label}>
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
