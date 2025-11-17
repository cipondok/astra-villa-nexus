import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const MobileFooter = () => {
  const { isMobile } = useIsMobile();
  const { language } = useLanguage();

  const text = {
    en: {
      contact: "Contact Us",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      address: "Jakarta, Indonesia",
      phone: "+62 812-3456-789",
      email: "info@astravilla.com",
      whatsapp: "WhatsApp",
      copyright: "© 2024 ASTRA Villa. All rights reserved."
    },
    id: {
      contact: "Hubungi Kami", 
      quickLinks: "Tautan Cepat",
      followUs: "Ikuti Kami",
      address: "Jakarta, Indonesia",
      phone: "+62 812-3456-789", 
      email: "info@astravilla.com",
      whatsapp: "WhatsApp",
      copyright: "© 2024 ASTRA Villa. Hak cipta dilindungi."
    }
  };

  const currentText = text[language] || text.en;

  if (!isMobile) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border/50 backdrop-blur-sm mt-2">
      {/* Quick Contact Actions - App Style */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="flex justify-around items-center gap-2 max-w-md mx-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 px-2 rounded-2xl border-2 active:scale-95 transition-transform bg-background/80 backdrop-blur-sm"
            onClick={() => window.open('tel:+62812345678')}
          >
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-medium">Call</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 px-2 rounded-2xl border-2 active:scale-95 transition-transform bg-background/80 backdrop-blur-sm"
            onClick={() => window.open('https://wa.me/62812345678')}
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-[10px] font-medium">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 px-2 rounded-2xl border-2 active:scale-95 transition-transform bg-background/80 backdrop-blur-sm"
            onClick={() => window.open('mailto:info@astravilla.com')}
          >
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-medium">Email</span>
          </Button>
        </div>
      </div>

      {/* Main Content - Ultra Compact */}
      <div className="px-4 py-4 space-y-3">
        {/* Company Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Home className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ASTRA Villa
            </span>
          </div>
        </div>

        {/* Contact Info - Minimal */}
        <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{currentText.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-primary" />
            <span>{currentText.phone}</span>
          </div>
        </div>

        {/* Social Media - Modern Pills */}
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
            onClick={() => window.open('https://facebook.com')}
          >
            <Facebook className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
            onClick={() => window.open('https://instagram.com')}
          >
            <Instagram className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
            onClick={() => window.open('https://twitter.com')}
          >
            <Twitter className="h-4 w-4 text-primary" />
          </Button>
        </div>

        {/* Copyright - Minimal */}
        <div className="text-center pt-2 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/60">
            {currentText.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;