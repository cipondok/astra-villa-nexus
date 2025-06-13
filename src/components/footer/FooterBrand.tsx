
import { Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

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
    },
    id: {
      company: "Astra Villa",
      tagline: "Properti impian Anda menanti",
      trustedBy: "Dipercaya oleh 50,000+ pencari properti",
      followUs: "Ikuti Kami",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-ios-blue to-ios-blue/80 bg-clip-text text-transparent">
          {currentText.company}
        </h3>
        <p className="text-muted-foreground text-sm mt-2">
          {currentText.tagline}
        </p>
      </div>
      
      {/* Trust Indicators */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">{currentText.trustedBy}</span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" key={i} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
        </div>
      </div>
      
      {/* Social Links */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 text-sm">
          {currentText.followUs}
        </h4>
        <div className="flex space-x-3">
          <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
            <Instagram className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="hover:bg-ios-blue/10 hover:text-ios-blue">
            <Linkedin className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FooterBrand;
