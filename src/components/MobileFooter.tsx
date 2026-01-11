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
      {/* Quick Contact Row - Compact */}
      <div className="px-3 py-2 flex justify-around items-center bg-gradient-to-r from-primary/5 to-accent/5">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg active:scale-95"
          onClick={() => window.open('tel:+62812345678')}
        >
          <Phone className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px]">Call</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg active:scale-95"
          onClick={() => window.open('https://wa.me/62812345678')}
        >
          <MessageCircle className="h-3.5 w-3.5 text-green-600" />
          <span className="text-[10px]">WhatsApp</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg active:scale-95"
          onClick={() => window.open('mailto:info@astravilla.com')}
        >
          <Mail className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px]">Email</span>
        </Button>
      </div>

      {/* Quick Links + Brand + Copyright - Single Compact Row */}
      <div className="px-3 py-2 flex items-center justify-between border-t border-border/20">
        {/* Brand */}
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Home className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
          <span className="text-[10px] font-bold text-foreground">ASTRA</span>
        </button>

        {/* Quick Links */}
        <div className="flex items-center gap-2 text-[9px]">
          <button onClick={() => navigate('/dijual')} className="text-muted-foreground hover:text-primary">Buy</button>
          <button onClick={() => navigate('/disewa')} className="text-muted-foreground hover:text-primary">Rent</button>
          <button onClick={() => navigate('/location')} className="text-muted-foreground hover:text-primary">Map</button>
          <button onClick={() => navigate('/community')} className="text-muted-foreground hover:text-primary">Community</button>
        </div>

        {/* Social + Copyright */}
        <div className="flex items-center gap-1">
          <Facebook className="h-3 w-3 text-muted-foreground" onClick={() => window.open('https://facebook.com')} />
          <Instagram className="h-3 w-3 text-muted-foreground" onClick={() => window.open('https://instagram.com')} />
          <span className="text-[8px] text-muted-foreground/60 ml-1">© 2024</span>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;