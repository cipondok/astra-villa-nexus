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
  MessageCircle,
  Globe,
  Building2,
  Users,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const MobileFooter = () => {
  const { isMobile } = useIsMobile();
  const { language } = useLanguage();
  const navigate = useNavigate();

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
    <footer className="bg-gradient-to-b from-background to-muted/10 border-t border-border/30 backdrop-blur-sm">
      {/* Quick Contact Actions - Ultra Compact */}
      <div className="px-3 py-2 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="flex justify-around items-center gap-1.5 max-w-sm mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-0.5 h-auto py-1.5 px-1.5 rounded-xl active:scale-95 transition-transform"
            onClick={() => window.open('tel:+62812345678')}
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] font-medium">Call</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-0.5 h-auto py-1.5 px-1.5 rounded-xl active:scale-95 transition-transform"
            onClick={() => window.open('https://wa.me/62812345678')}
          >
            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
            <span className="text-[9px] font-medium">WhatsApp</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-0.5 h-auto py-1.5 px-1.5 rounded-xl active:scale-95 transition-transform"
            onClick={() => window.open('mailto:info@astravilla.com')}
          >
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span className="text-[9px] font-medium">Email</span>
          </Button>
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="px-3 py-1.5 flex justify-center gap-2.5 text-[9px]">
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary flex items-center gap-0.5">
          <Home className="h-2.5 w-2.5" />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/dijual')} className="text-muted-foreground hover:text-primary flex items-center gap-0.5">
          <Building2 className="h-2.5 w-2.5" />
          <span>Buy</span>
        </button>
        <button onClick={() => navigate('/disewa')} className="text-muted-foreground hover:text-primary flex items-center gap-0.5">
          <Building2 className="h-2.5 w-2.5" />
          <span>Rent</span>
        </button>
        <button onClick={() => navigate('/community')} className="text-muted-foreground hover:text-primary flex items-center gap-0.5">
          <Users className="h-2.5 w-2.5" />
          <span>Community</span>
        </button>
        <button onClick={() => navigate('/development')} className="text-muted-foreground hover:text-primary flex items-center gap-0.5">
          <Info className="h-2.5 w-2.5" />
          <span>Development</span>
        </button>
      </div>

      {/* Main Content - Ultra Slim */}
      <div className="px-3 py-2 space-y-1.5 border-t border-border/20">
        {/* Brand + Social Row */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 hover:opacity-80">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Home className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ASTRA Villa
            </span>
          </button>
          
          {/* Social Icons */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 rounded-full hover:bg-primary/10 active:scale-95"
              onClick={() => window.open('https://facebook.com')}
            >
              <Facebook className="h-3 w-3 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 rounded-full hover:bg-primary/10 active:scale-95"
              onClick={() => window.open('https://instagram.com')}
            >
              <Instagram className="h-3 w-3 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 rounded-full hover:bg-primary/10 active:scale-95"
              onClick={() => window.open('https://twitter.com')}
            >
              <Twitter className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Contact + Copyright */}
        <div className="flex items-center justify-between text-[8px] text-muted-foreground/70 border-t border-border/20 pt-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <MapPin className="h-2 w-2" />
              <span>Jakarta</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Phone className="h-2 w-2" />
              <span>+62 812-345-6789</span>
            </div>
          </div>
          <span>© 2024 ASTRA Villa</span>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;