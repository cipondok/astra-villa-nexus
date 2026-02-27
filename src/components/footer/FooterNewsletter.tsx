
import { useState } from "react";
import { Send, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";

interface FooterNewsletterProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
}

const FooterNewsletter = ({ language }: FooterNewsletterProps) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { t, tArray } = useTranslation();

  const benefits = tArray('footer.benefits');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    console.log("Subscribing email:", email);
    setIsSubscribed(true);
    toast.success(t('footer.successMessage'));
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gold-primary/10 rounded-lg">
          <Mail className="h-5 w-5 text-gold-primary" />
        </div>
        <h4 className="font-bold text-foreground text-sm">
          {t('footer.newsletter')}
        </h4>
      </div>
      
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t('footer.newsletterText')}
        </p>
        
        {!isSubscribed ? (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12 bg-background/50 border-border/30 focus:border-gold-primary/50 text-sm"
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background"
              size="sm"
            >
              <Send className="h-3 w-3 mr-2" />
              {t('footer.subscribe')}
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-chart-1/10 rounded-lg border border-chart-1/20">
            <CheckCircle className="h-4 w-4 text-chart-1" />
            <span className="text-chart-1 text-sm font-medium">
              {t('footer.subscribed')}
            </span>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">What you'll get:</p>
          <ul className="space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="h-1 w-1 bg-gold-primary rounded-full flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FooterNewsletter;
