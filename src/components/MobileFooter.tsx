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
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border/30">
      {/* Weblinks (always visible) */}
      <nav className="px-3 py-2 flex items-center justify-between gap-2 text-[10px] border-b border-border/20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => navigate('/dijual')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Buy</span>
        </button>
        <button
          onClick={() => navigate('/disewa')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Rent</span>
        </button>
        <button
          onClick={() => navigate('/location')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Users className="h-3.5 w-3.5" />
          <span>Community</span>
        </button>
      </nav>

      {/* Compact actions row */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => window.open('tel:+62812345678')}
            aria-label="Call"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => window.open('https://wa.me/62812345678')}
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => window.open('mailto:info@astravilla.com')}
            aria-label="Email"
          >
            <Mail className="h-3.5 w-3.5 text-primary" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30"
            onClick={() => window.open('https://facebook.com')}
            aria-label="Facebook"
          >
            <Facebook className="h-3.5 w-3.5 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/10 border border-pink-500/30"
            onClick={() => window.open('https://instagram.com')}
            aria-label="Instagram"
          >
            <Instagram className="h-3.5 w-3.5 text-pink-500" />
          </Button>
          <span className="text-[9px] text-muted-foreground/70 pl-1">© 2024</span>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;