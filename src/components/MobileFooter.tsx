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
  Info,
  Glasses
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
    <footer className="relative bg-gradient-to-br from-white/30 via-white/15 to-white/10 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-900/70 backdrop-blur-xl border-t border-white/25 dark:border-white/15 before:absolute before:inset-0 before:bg-gradient-to-tr before:from-primary/8 before:via-transparent before:to-accent/8 before:opacity-70 after:absolute after:inset-0 after:bg-gradient-to-bl after:from-rose-400/5 after:via-transparent after:to-cyan-400/6 after:opacity-60 overflow-hidden">
      {/* Weblinks (always visible) */}
      <nav className="relative z-10 px-3 py-2 flex items-center justify-between gap-2 text-[10px] border-b border-white/20 dark:border-white/10">
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
          onClick={() => navigate('/vr-tour')}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Glasses className="h-3.5 w-3.5" />
          <span>VR</span>
        </button>
      </nav>

      {/* Compact actions row */}
      <div className="relative z-10 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => window.open('tel:+6285716008080')}
            aria-label="Call"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg bg-green-500/10 border border-green-500/30"
            onClick={() => window.open('https://wa.me/6285716008080')}
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