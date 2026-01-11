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
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border/30 backdrop-blur-sm">
      {/* Quick Contact Actions - Better Sized */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/8 via-transparent to-accent/8">
        <div className="flex justify-around items-center gap-2 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 px-3 rounded-xl active:scale-95 transition-transform hover:bg-primary/10"
            onClick={() => window.open('tel:+62812345678')}
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Phone className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Call</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 px-3 rounded-xl active:scale-95 transition-transform hover:bg-green-500/10"
            onClick={() => window.open('https://wa.me/62812345678')}
          >
            <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center">
              <MessageCircle className="h-4.5 w-4.5 text-green-600" />
            </div>
            <span className="text-[11px] font-medium">WhatsApp</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 px-3 rounded-xl active:scale-95 transition-transform hover:bg-primary/10"
            onClick={() => window.open('mailto:info@astravilla.com')}
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Mail className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Email</span>
          </Button>
        </div>
      </div>

      {/* Quick Links Row - Better Spacing */}
      <div className="px-4 py-2.5 flex justify-center gap-4 text-[11px] border-t border-border/20">
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/dijual')} className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <Building2 className="h-3.5 w-3.5" />
          <span>Buy</span>
        </button>
        <button onClick={() => navigate('/disewa')} className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <Building2 className="h-3.5 w-3.5" />
          <span>Rent</span>
        </button>
        <button onClick={() => navigate('/location')} className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <MapPin className="h-3.5 w-3.5" />
          <span>Map</span>
        </button>
        <button onClick={() => navigate('/community')} className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <Users className="h-3.5 w-3.5" />
          <span>Community</span>
        </button>
      </div>

      {/* Main Content - Enhanced Layout */}
      <div className="px-4 py-3 space-y-2.5 border-t border-border/20">
        {/* Brand + Social Row */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Home className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ASTRA Villa
            </span>
          </button>
          
          {/* Social Icons - Better Sized */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
              onClick={() => window.open('https://facebook.com')}
            >
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
              onClick={() => window.open('https://instagram.com')}
            >
              <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 rounded-full hover:bg-primary/10 active:scale-95 transition-all"
              onClick={() => window.open('https://twitter.com')}
            >
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </div>
        </div>

        {/* Contact + Copyright - Better Sized */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 border-t border-border/20 pt-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Jakarta</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>+62 812-345-6789</span>
            </div>
          </div>
          <span className="font-medium">© 2024 ASTRA Villa</span>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;