import { useState } from "react";
import { Link } from "react-router-dom";
import { Rocket, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Handshake, ChevronDown, Home, ShoppingCart, Key, UsersRound, Construction, Search, MessageSquare, Calculator, PiggyBank, HelpCircle, CircleHelp, PhoneCall, Shield, FileText, Cookie, MapPin, Glasses, UserCheck } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalFooterProps {
  language: "en" | "id";
}

const ProfessionalFooter = ({ language }: ProfessionalFooterProps) => {
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);

  const { data: footerLogoUrl } = useQuery({
    queryKey: ['branding', 'footerLogo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'branding')
        .eq('key', 'footerLogo')
        .maybeSingle();
      if (error || !data?.value) return null;
      const value = typeof data.value === 'string' ? data.value : null;
      return value && value.trim() !== '' ? value : null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const text = {
    en: {
      company: "Astra Villa",
      tagline: "Your trusted real estate partner",
      quickLinks: "Quick Links",
      services: "Services",
      support: "Support",
      allRights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      home: "Home",
      buy: "Buy",
      rent: "Rent",
      community: "Community",
      propertySearch: "Property Search",
      consultation: "Consultation",
      valuation: "Property Valuation",
      investment: "Investment Advisory",
      help: "Help Center",
      faq: "FAQ",
      contactUs: "Contact Us",
      businessPartners: "Business Partners",
      partnerNetwork: "Partner Network",
      becomePartner: "Become a Partner",
      partnerBenefits: "Partner Benefits",
      jointVentures: "Joint Ventures",
    },
    id: {
      company: "Astra Villa",
      tagline: "Mitra real estate terpercaya Anda",
      quickLinks: "Tautan Cepat",
      services: "Layanan",
      support: "Dukungan",
      allRights: "Semua hak dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat Layanan",
      cookies: "Kebijakan Cookie",
      home: "Beranda",
      buy: "Beli",
      rent: "Sewa",
      community: "Komunitas",
      propertySearch: "Pencarian Properti",
      consultation: "Konsultasi",
      valuation: "Valuasi Properti",
      investment: "Konsultan Investasi",
      help: "Pusat Bantuan",
      faq: "FAQ",
      contactUs: "Hubungi Kami",
      businessPartners: "Mitra Bisnis",
      partnerNetwork: "Jaringan Mitra",
      becomePartner: "Jadi Mitra",
      partnerBenefits: "Manfaat Mitra",
      jointVentures: "Usaha Patungan",
    },
  };

  const currentText = text[language];

  const footerContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 'none',
    margin: '0',
    borderRadius: '0',
    background: `
      radial-gradient(circle at 10% 20%, rgba(255,255,255,0.95) 0%, transparent 40%),
      radial-gradient(circle at 90% 70%, rgba(150,210,255,0.6) 5%, transparent 40%),
      linear-gradient(125deg, rgba(255,255,255,0.92) 0%, rgba(130,200,240,0.4) 18%, rgba(140,210,230,0.5) 42%, rgba(180,220,250,0.7) 68%, rgba(255,255,255,0.96) 92%)
    `,
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    border: 'none',
    borderTop: '1px solid rgba(180,220,255,0.7)',
    boxShadow: '0 -10px 40px -15px rgba(0,20,30,0.3), inset 0 1px 6px rgba(255,255,255,0.9), inset 0 0 35px rgba(150,210,250,0.3)',
    padding: '1.2rem 2rem',
    transition: 'box-shadow 0.3s ease, border-color 0.2s ease',
  };

  const colStyle: React.CSSProperties = {
    padding: '1.6rem 1.2rem',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
  };

  const socialRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.9rem 2rem',
    margin: '1.8rem 0',
    padding: '1rem 1.8rem',
    background: 'rgba(10,50,60,0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(150,210,250,0.5)',
  };

  const socialIconBase: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(150,210,250,0.8)',
    boxShadow: '0 8px 18px -8px black, inset 0 2px 8px rgba(255,255,250,0.9)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.7rem',
    color: '#0c404e',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const copyrightStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.2rem',
    padding: '1rem 1.8rem',
    fontSize: '0.95rem',
    color: '#022b36',
    fontWeight: 450,
    marginTop: '1rem',
  };

  const colTitleGradient: React.CSSProperties = {
    background: 'linear-gradient(135deg, #b8dff5, #c1e4f0, #a0d4f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '1px',
    fontSize: '1.3rem',
    fontWeight: 600,
    marginBottom: '1rem',
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#0c4455',
    fontWeight: 450,
    padding: '0.2rem 0.4rem',
    transition: 'all 0.15s ease',
    display: 'inline-block',
    fontSize: '0.95rem',
  };

  const copyrightBadge: React.CSSProperties = {
    padding: '0.3rem 1.4rem',
  };

  const dotColors = [
    'rgba(130,200,240,0.7)',
    'rgba(190,230,250,0.7)',
    'rgba(160,215,245,0.8)',
    'rgba(210,235,250,0.8)',
    'rgba(140,205,240,0.7)',
    'rgba(180,220,250,0.7)',
    'rgba(120,195,235,0.75)',
  ];

  const quickLinks = [
    { to: "/", label: currentText.home, icon: Home },
    { to: "/dijual", label: currentText.buy, icon: ShoppingCart },
    { to: "/disewa", label: currentText.rent, icon: Key },
    { to: "/vr-tour", label: language === "en" ? "VR Tour" : "Tur VR", icon: Glasses },
    { to: "/location", label: language === "en" ? "Location Map" : "Peta Lokasi", icon: MapPin },
    { to: "/community", label: currentText.community, icon: UsersRound },
    { to: "/agents", label: language === "en" ? "Find Agents" : "Cari Agen", icon: UserCheck },
    { to: "/development", label: language === "en" ? "Development" : "Pengembangan", icon: Construction },
  ];

  const serviceLinks = [
    { label: currentText.propertySearch, icon: Search },
    { label: currentText.consultation, icon: MessageSquare },
    { label: currentText.valuation, icon: Calculator },
    { label: currentText.investment, icon: PiggyBank },
  ];

  const supportLinks = [
    { label: currentText.help, icon: HelpCircle },
    { label: currentText.faq, icon: CircleHelp },
    { label: currentText.contactUs, icon: PhoneCall },
  ];

  const socialIcons = [
    { icon: '𝕏', bg: 'rgba(130,200,240,0.5)', label: 'Twitter' },
    { icon: 'ⓕ', bg: 'rgba(190,230,250,0.6)', label: 'Facebook' },
    { icon: <Instagram className="w-5 h-5" />, bg: 'rgba(160,215,245,0.7)', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, bg: 'rgba(210,235,250,0.6)', label: 'YouTube' },
  ];

  return (
    <footer style={footerContainerStyle}>
      {/* Row 1: Brand + All Links in one flowing row */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-4">
          {footerLogoUrl ? (
            <img src={footerLogoUrl} alt={currentText.company} className="h-7 max-w-[100px] object-contain" loading="lazy" />
          ) : (
            <>
              <div className="p-1 rounded" style={{ background: 'rgba(130,200,240,0.4)' }}>
                <Rocket className="w-4 h-4" style={{ color: '#0c404e' }} />
              </div>
              <span className="text-sm font-bold" style={{ color: '#0a3340' }}>{currentText.company}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <span style={{ color: 'rgba(130,200,240,0.6)' }}>|</span>

        {/* All links as icon-only with tooltip on hover */}
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to} style={linkStyle} className="relative group hover:opacity-70 inline-flex items-center justify-center" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </Link>
        ))}

        <span style={{ color: 'rgba(130,200,240,0.6)' }}>|</span>

        {serviceLinks.map(link => (
          <span key={link.label} style={linkStyle} className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}

        <span style={{ color: 'rgba(130,200,240,0.6)' }}>|</span>

        {supportLinks.map(link => (
          <span key={link.label} style={linkStyle} className="relative group cursor-pointer hover:opacity-70 inline-flex items-center justify-center" title={link.label}>
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {link.label}
            </span>
          </span>
        ))}
      </div>

      {/* Row 2: Social + Copyright */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {/* Social icons */}
        <div className="flex items-center gap-2">
          {socialIcons.map((s, i) => (
            <a
              key={i}
              href="#"
              className="hover:opacity-80 transition-opacity inline-flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: s.bg,
                border: '1px solid rgba(150,210,250,0.6)',
                boxShadow: '0 4px 10px -4px rgba(0,0,0,0.2), inset 0 1px 4px rgba(255,255,250,0.8)',
                color: '#0c404e',
                fontSize: '1rem',
              }}
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
          <span className="text-xs" style={{ color: '#083945' }}>@astravilla</span>
        </div>

        <span style={{ color: 'rgba(130,200,240,0.6)' }}>|</span>

        {/* Copyright */}
        <span className="text-xs" style={{ color: '#022b36', fontWeight: 450 }}>
          © {new Date().getFullYear()} {currentText.company}. {currentText.allRights}
        </span>

        <span className="text-xs" style={{ color: '#02222b' }}>✦ Astra Villa ✦</span>

        {/* Glass dots inline */}
        <div className="flex items-center gap-1.5">
          {dotColors.map((bg, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: bg, boxShadow: 'inset 0 1px 3px white' }} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
