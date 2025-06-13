
import { Shield, Star, Facebook, Twitter, Instagram, Linkedin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterBrandProps {
  language: "en" | "id";
}

const FooterBrand = ({ language }: FooterBrandProps) => {
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

  const handleSocialClick = (platform: string) => {
    console.log(`Social media click: ${platform}`);
  };

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
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-sm">
          {currentText.followUs}
        </h4>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-blue-500/10 hover:text-blue-500 border border-border/30"
            onClick={() => handleSocialClick('Facebook')}
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-sky-500/10 hover:text-sky-500 border border-border/30"
            onClick={() => handleSocialClick('Twitter')}
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-pink-500/10 hover:text-pink-500 border border-border/30"
            onClick={() => handleSocialClick('Instagram')}
          >
            <Instagram className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 hover:bg-blue-600/10 hover:text-blue-600 border border-border/30"
            onClick={() => handleSocialClick('LinkedIn')}
          >
            <Linkedin className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FooterBrand;
