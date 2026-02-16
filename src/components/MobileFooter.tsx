import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, Phone, Mail, MapPin, Facebook, Instagram, 
  MessageCircle, Building2, Glasses, Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const MobileFooter = () => {
  const { isMobile } = useIsMobile();
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const footerStyle: React.CSSProperties = {
    width: '100%',
    margin: '0 auto',
    borderRadius: '30px 30px 0 0',
    background: `
      radial-gradient(circle at 10% 20%, rgba(255,255,255,0.95) 0%, transparent 40%),
      radial-gradient(circle at 90% 70%, rgba(255,240,150,0.6) 5%, transparent 40%),
      linear-gradient(125deg, rgba(255,255,255,0.92) 0%, rgba(255,225,100,0.4) 18%, rgba(140,210,230,0.5) 42%, rgba(255,245,190,0.7) 68%, rgba(255,255,255,0.96) 92%)
    `,
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    border: '1px solid rgba(255,255,240,0.7)',
    borderBottom: 'none',
    boxShadow: '0 -15px 40px -15px rgba(0,20,30,0.4), inset 0 1px 6px rgba(255,255,255,0.9), inset 0 0 25px rgba(250,230,130,0.3)',
    padding: '0.8rem 0.6rem',
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dijual', label: 'Buy', icon: Building2 },
    { path: '/disewa', label: 'Rent', icon: Building2 },
    { path: '/location', label: 'Map', icon: MapPin },
    { path: '/vr-tour', label: 'VR', icon: Glasses },
  ];

  const socialIconStyle = (bg: string): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: bg,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,250,180,0.8)',
    boxShadow: '0 4px 10px -4px rgba(0,0,0,0.3), inset 0 1px 4px rgba(255,255,250,0.9)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0c404e',
  });

  const dotColors = [
    'rgba(255,215,100,0.7)',
    'rgba(190,230,250,0.7)',
    'rgba(255,240,170,0.8)',
    'rgba(210,235,220,0.8)',
    'rgba(255,210,160,0.7)',
  ];

  return (
    <footer style={footerStyle}>
      {/* Nav links */}
      <nav className="flex items-center justify-between gap-1 px-2 py-1.5 mb-2"
        style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '40px',
          border: '1px solid rgba(255,245,180,0.3)',
        }}
      >
        {navLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="flex flex-col items-center gap-0.5 text-[10px] transition-opacity hover:opacity-70"
            style={{ color: '#0c4455' }}
          >
            <link.icon className="h-3.5 w-3.5" />
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      {/* Actions + Social row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-full"
            style={socialIconStyle('rgba(255,240,180,0.7)')}
            onClick={() => window.open('tel:+6285716008080')}
            aria-label="Call"
          >
            <Phone className="h-3.5 w-3.5" style={{ color: '#0c404e' }} />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-full"
            style={socialIconStyle('rgba(210,240,230,0.6)')}
            onClick={() => window.open('https://wa.me/6285716008080')}
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" style={{ color: '#0c404e' }} />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-full"
            style={socialIconStyle('rgba(190,230,250,0.6)')}
            onClick={() => window.open('mailto:info@astravilla.com')}
            aria-label="Email"
          >
            <Mail className="h-3.5 w-3.5" style={{ color: '#0c404e' }} />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <a href="https://facebook.com" style={socialIconStyle('rgba(190,230,250,0.6)')} className="hover:opacity-80 transition-opacity" aria-label="Facebook">
            <Facebook className="h-3.5 w-3.5" />
          </a>
          <a href="https://instagram.com" style={socialIconStyle('rgba(255,240,180,0.7)')} className="hover:opacity-80 transition-opacity" aria-label="Instagram">
            <Instagram className="h-3.5 w-3.5" />
          </a>
          <span className="text-[9px] pl-1" style={{ color: '#083945', fontWeight: 450 }}>© 2026</span>
        </div>
      </div>

      {/* Glass dots */}
      <div className="flex justify-center gap-2 mt-2">
        {dotColors.map((bg, i) => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ background: bg, boxShadow: 'inset 0 1px 3px white' }} />
        ))}
      </div>
    </footer>
  );
};

export default MobileFooter;
